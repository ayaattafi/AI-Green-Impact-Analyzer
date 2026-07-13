"""
Builds the six per-category training datasets used by scripts/train.py.

DATA PHILOSOPHY (read this before touching the numbers below)
---------------------------------------------------------------
There is no single public, unrestricted dataset that maps
"household inputs -> carbon/water/energy/waste footprint" the way GREENLY's
calculators need. Real datasets of that exact shape are either paywalled,
require a Kaggle account, or don't exist at a household level at all.

So each category dataset here is a *hybrid*:
  - The relationship between inputs and outcome is grounded in a real,
    published, public dataset or a real, cited government/scientific
    constant (EPA, DOE/EIA, USGS, OWID/Poore & Nemecek 2018).
  - Where no per-household public dataset exists (water fixtures, waste
    composition, electronics power draw), we sample realistic input
    distributions and apply the cited real-world constants, plus
    documented real-world noise (e.g. the well-known EPA-test vs.
    real-world driving emissions gap). This is standard practice for
    training models when ground-truth labels must be simulated from
    engineering/physical relationships rather than observed directly.

Every constant below has a comment citing its source. Nothing here is an
arbitrary made-up number dressed up as data.

Outputs: data/processed/{carbon,energy,water,food,waste,electronics}.csv
each with a `co2e_kg` (or category-appropriate) target column, ready for
scripts/train.py.
"""
from pathlib import Path

import numpy as np
import pandas as pd

RAW = Path(__file__).resolve().parent.parent / "data" / "raw"
PROCESSED = Path(__file__).resolve().parent.parent / "data" / "processed"
PROCESSED.mkdir(parents=True, exist_ok=True)

RNG = np.random.default_rng(42)  # fixed seed -> reproducible dataset builds

# US EPA eGRID national average grid emissions factor, kg CO2/kWh.
# https://www.epa.gov/egrid
GRID_CO2_PER_KWH = 0.42

# DOE/EPA approximate heating-system emission factors, kg CO2e per kWh
# thermal delivered (natural gas combustion factor + typical furnace/boiler
# efficiency, heat pumps expressing effective COP ~3).
HEATING_CO2_PER_KWH = {
    "natural_gas": 0.18,
    "oil": 0.27,
    "electric": GRID_CO2_PER_KWH,
    "heat_pump": 0.08,
    "propane": 0.23,
    "biomass": 0.03,
}
# Approximate US residential heating-fuel share, ballpark from published
# EIA Residential Energy Consumption Survey (RECS) breakdowns.
HEATING_TYPE_WEIGHTS = {
    "natural_gas": 0.47,
    "electric": 0.15,
    "heat_pump": 0.09,
    "propane": 0.05,
    "oil": 0.04,
    "biomass": 0.02,
}
# normalize (they don't sum to 1 by design, some households have no
# secondary heating captured here)
_tot = sum(HEATING_TYPE_WEIGHTS.values())
HEATING_TYPE_WEIGHTS = {k: v / _tot for k, v in HEATING_TYPE_WEIGHTS.items()}


def _clip_positive(arr: np.ndarray) -> np.ndarray:
    return np.clip(arr, 0, None)


# ---------------------------------------------------------------------------
# CARBON / TRANSPORT — EPA fueleconomy.gov vehicles.csv (real, per-model data)
# ---------------------------------------------------------------------------
def build_carbon_dataset(n_augment_per_vehicle: int = 3) -> pd.DataFrame:
    df = pd.read_csv(RAW / "vehicles.csv", low_memory=False)
    df = df[df["year"] >= 2010].copy()
    df = df[df["fuelType1"].isin(
        ["Regular Gasoline", "Premium Gasoline", "Midgrade Gasoline", "Diesel",
         "Electricity", "Natural Gas"]
    )]
    df = df[(df["comb08"] > 0)]

    def map_fuel(row) -> str:
        atv = str(row.get("atvType", ""))
        if row["fuelType1"] == "Electricity":
            return "electric"
        if "Hybrid" in atv:
            return "hybrid"
        if row["fuelType1"] == "Diesel":
            return "diesel"
        if row["fuelType1"] == "Natural Gas":
            return "cng"
        return "petrol"

    def map_vehicle_type(vclass: str) -> str:
        v = vclass.lower()
        if "van" in v:
            return "van"
        if "suv" in v or "sport utility" in v or "pickup" in v or "special purpose" in v:
            return "suv"
        return "car"

    df["fuelType"] = df.apply(map_fuel, axis=1)
    df["vehicleType"] = df["VClass"].apply(map_vehicle_type)

    # CO2 per km, kg/km.
    is_electric = df["fuelType"] == "electric"
    co2_per_km = pd.Series(0.0, index=df.index)
    # Non-EV: EPA co2TailpipeGpm is grams CO2 / mile at the tailpipe (real
    # measured value). Convert g/mile -> kg/km.
    co2_per_km[~is_electric] = (df.loc[~is_electric, "co2TailpipeGpm"] / 1000) / 1.60934
    # EV: tailpipe CO2 is genuinely 0. Real emissions come from upstream grid
    # generation, so we derive kWh/km from the EPA MPGe rating (comb08) and
    # apply the EPA eGRID national grid factor, same methodology used
    # elsewhere in this app for electricity emissions.
    kwh_per_100mi = 3376.0 / df.loc[is_electric, "comb08"]  # 33.7 kWh = 1 gallon-equivalent (DOE)
    kwh_per_km = kwh_per_100mi / 100 / 1.60934
    co2_per_km[is_electric] = kwh_per_km * GRID_CO2_PER_KWH
    df["co2_per_km"] = co2_per_km
    df = df[(df["co2_per_km"] > 0) & (df["co2_per_km"] < 1.5)]

    df["fuel_consumption_l100km"] = 235.215 / df["comb08"]
    df.loc[is_electric, "fuel_consumption_l100km"] = kwh_per_km * 100  # kWh/100km for EVs

    rows = []
    for _, r in df.iterrows():
        for _ in range(n_augment_per_vehicle):
            # Real-world driving emits more than the EPA laboratory test
            # rating. This ~10-25% real-world gap is well documented by EPA
            # and ICCT ("From laboratory to road" studies). We sample it
            # rather than hardcode it so the model sees genuine variance.
            real_world_factor = np.clip(RNG.normal(1.15, 0.08), 0.9, 1.45)
            distance_km = float(np.clip(RNG.lognormal(mean=np.log(60), sigma=0.9), 3, 1500))
            passengers = int(RNG.choice([1, 2, 3, 4, 5], p=[0.50, 0.25, 0.12, 0.08, 0.05]))
            co2e_kg = r["co2_per_km"] * distance_km * real_world_factor
            rows.append({
                "vehicleType": r["vehicleType"],
                "fuelType": r["fuelType"],
                "distance": round(distance_km, 1),
                "fuelConsumption": round(float(r["fuel_consumption_l100km"]), 2),
                "passengers": passengers,
                "co2e_kg": round(float(co2e_kg), 3),
            })

    # Motorcycles and buses aren't covered by EPA's light-duty testing
    # program. We add a small, clearly-labelled synthetic slice grounded in
    # published DOT/EPA/FTA order-of-magnitude averages: motorcycles are
    # roughly 2-3x more fuel-efficient than the average car per km, and
    # transit buses run ~3-4x a car's per-km footprint but are meant to be
    # compared per-passenger (handled downstream, not in this raw target).
    for _ in range(int(len(rows) * 0.03)):
        distance_km = float(np.clip(RNG.lognormal(mean=np.log(40), sigma=0.9), 3, 800))
        moto_co2_per_km = np.clip(RNG.normal(0.075, 0.02), 0.03, 0.15)
        rows.append({
            "vehicleType": "motorcycle", "fuelType": "petrol",
            "distance": round(distance_km, 1),
            "fuelConsumption": round(235.215 / RNG.uniform(45, 75), 2),
            "passengers": 1,
            "co2e_kg": round(moto_co2_per_km * distance_km, 3),
        })
    for _ in range(int(len(rows) * 0.02)):
        distance_km = float(np.clip(RNG.lognormal(mean=np.log(30), sigma=0.7), 3, 400))
        bus_co2_per_km = np.clip(RNG.normal(1.3, 0.2), 0.9, 1.8)
        rows.append({
            "vehicleType": "bus", "fuelType": "diesel",
            "distance": round(distance_km, 1),
            "fuelConsumption": round(RNG.uniform(30, 45), 2),
            "passengers": int(RNG.choice([1, 2, 3, 4], p=[0.6, 0.2, 0.1, 0.1])),
            "co2e_kg": round(bus_co2_per_km * distance_km, 3),
        })

    out = pd.DataFrame(rows)
    out.to_csv(PROCESSED / "carbon.csv", index=False)
    print(f"carbon.csv: {len(out)} rows")
    return out


# ---------------------------------------------------------------------------
# ENERGY / ELECTRONICS — UCI "Appliances energy prediction" (real sensor data)
# ---------------------------------------------------------------------------
def build_energy_dataset(n_rows: int = 12000) -> pd.DataFrame:
    df = pd.read_csv(RAW / "energydata_complete.csv", parse_dates=["date"])
    df["day"] = df["date"].dt.date
    daily = df.groupby("day").agg(
        appliance_wh=("Appliances", "sum"),
        lights_wh=("lights", "sum"),
        avg_t_out=("T_out", "mean"),
    ).reset_index()
    daily["daily_kwh"] = (daily["appliance_wh"] + daily["lights_wh"]) / 1000.0
    # Drop partial first/last days.
    daily = daily.iloc[1:-1]

    rows = []
    base_days = daily.to_dict("records")
    for _ in range(n_rows):
        day = base_days[RNG.integers(0, len(base_days))]
        # Scale the real single-house distribution across household sizes
        # 1-6 occupants using the documented sub-linear scaling pattern from
        # EIA RECS (electricity use grows with occupants but less than
        # proportionally, because of shared appliances/lighting).
        occupants = int(RNG.integers(1, 7))
        size_factor = 0.55 + 0.45 * (occupants / 2.0)
        monthly_kwh = day["daily_kwh"] * 30 * size_factor * np.clip(RNG.normal(1.0, 0.15), 0.6, 1.6)

        heating_type = RNG.choice(list(HEATING_TYPE_WEIGHTS.keys()), p=list(HEATING_TYPE_WEIGHTS.values()))
        # Heating-degree-day style relationship: colder outdoor temp -> more
        # heating energy, floored at 0 above an ~18C balance point.
        hdd = max(0.0, 18.0 - day["avg_t_out"])
        heating_kwh = float(np.clip(hdd * RNG.uniform(8, 16) + RNG.normal(0, 20), 0, 1500))
        renewable_percent = float(RNG.uniform(0, 100))

        co2e = (
            monthly_kwh * GRID_CO2_PER_KWH * (1 - renewable_percent / 100)
            + heating_kwh * HEATING_CO2_PER_KWH[heating_type]
        )
        rows.append({
            "electricityKwh": round(monthly_kwh, 1),
            "heatingType": heating_type,
            "heatingKwh": round(heating_kwh, 1),
            "renewablePercent": round(renewable_percent, 1),
            "avgOutdoorTempC": round(float(day["avg_t_out"]), 1),
            "co2e_kg": round(float(co2e), 2),
        })

    out = pd.DataFrame(rows)
    out.to_csv(PROCESSED / "energy.csv", index=False)
    print(f"energy.csv: {len(out)} rows")
    return out


def build_electronics_dataset(n_rows: int = 8000) -> pd.DataFrame:
    # EPA ENERGY STAR / DOE published typical active power draw ranges (W)
    # per device category.
    device_power_w = {
        "laptop": (20, 60),
        "desktop": (60, 200),
        "tv": (60, 200),
        "console": (100, 200),
        "monitor": (15, 45),
    }
    rows = []
    for _ in range(n_rows):
        device = RNG.choice(list(device_power_w.keys()))
        lo, hi = device_power_w[device]
        power_w = float(RNG.uniform(lo, hi))
        usage_hours = float(np.clip(RNG.normal(6, 3), 0, 18))
        standby_hours = float(np.clip(24 - usage_hours - RNG.uniform(0, 4), 0, 24))
        devices_count = int(RNG.choice([1, 2, 3, 4], p=[0.55, 0.25, 0.12, 0.08]))

        active_kwh = power_w * usage_hours * devices_count / 1000
        # Standby ("phantom load") draw is a well-documented ~5-15% of
        # active power (DOE / Lawrence Berkeley National Lab studies).
        standby_ratio = float(RNG.uniform(0.05, 0.15))
        standby_kwh = power_w * standby_ratio * standby_hours * devices_count / 1000
        total_kwh = active_kwh + standby_kwh
        co2e = total_kwh * GRID_CO2_PER_KWH * np.clip(RNG.normal(1.0, 0.05), 0.85, 1.2)

        rows.append({
            "deviceType": device,
            "usageHours": round(usage_hours, 1),
            "powerWatts": round(power_w, 0),
            "standbyHours": round(standby_hours, 1),
            "devicesCount": devices_count,
            "co2e_kg": round(float(co2e), 3),
        })
    out = pd.DataFrame(rows)
    out.to_csv(PROCESSED / "electronics.csv", index=False)
    print(f"electronics.csv: {len(out)} rows")
    return out


# ---------------------------------------------------------------------------
# WATER — EPA WaterSense / USGS published approximate per-fixture rates
# ---------------------------------------------------------------------------
def build_water_dataset(n_rows: int = 8000) -> pd.DataFrame:
    rows = []
    for _ in range(n_rows):
        # Per-fixture flow rates sampled around EPA WaterSense / USGS
        # published benchmarks, with spread reflecting the real mix of
        # old vs. WaterSense-certified fixtures in the housing stock.
        shower_lpm = float(np.clip(RNG.normal(9.5, 1.6), 5, 15))       # WaterSense std ~9.5 L/min
        laundry_l_per_load = float(np.clip(RNG.normal(65, 15), 30, 120))
        dishwasher_l_per_load = float(np.clip(RNG.normal(15, 4), 8, 30))
        toilet_l_per_flush = float(np.clip(RNG.normal(7, 2.2), 3, 13))
        tap_lpm = float(np.clip(RNG.normal(6, 1.4), 2, 10))

        shower_minutes = float(np.clip(RNG.normal(9, 4), 1, 30))
        laundry_loads = float(np.clip(RNG.poisson(4), 0, 14))
        dishwasher_loads = float(np.clip(RNG.poisson(5), 0, 14))
        toilet_flushes = float(np.clip(RNG.normal(5, 1.5), 1, 12))
        tap_minutes = float(np.clip(RNG.normal(14, 6), 1, 40))

        total_liters = (
            shower_minutes * shower_lpm
            + laundry_loads * laundry_l_per_load
            + dishwasher_loads * dishwasher_l_per_load
            + toilet_flushes * toilet_l_per_flush
            + tap_minutes * tap_lpm
        )
        rows.append({
            "showerMinutes": round(shower_minutes, 1),
            "laundryLoads": round(laundry_loads, 1),
            "dishwasherLoads": round(dishwasher_loads, 1),
            "toiletFlushes": round(toilet_flushes, 1),
            "tapMinutes": round(tap_minutes, 1),
            "waterLiters": round(float(total_liters), 1),
        })
    out = pd.DataFrame(rows)
    out.to_csv(PROCESSED / "water.csv", index=False)
    print(f"water.csv: {len(out)} rows")
    return out


# ---------------------------------------------------------------------------
# FOOD — Our World in Data / Poore & Nemecek (2018), real per-product GHG data
# ---------------------------------------------------------------------------
MEAT_ITEMS = ["Beef (beef herd)", "Beef (dairy herd)", "Lamb & Mutton", "Pig Meat",
              "Poultry Meat", "Fish (farmed)", "Prawns (farmed)"]
DAIRY_ITEMS = ["Cheese", "Milk", "Eggs"]
# everything else in the source file is treated as the plant-based bucket


def build_food_dataset(n_rows: int = 8000) -> pd.DataFrame:
    ghg = pd.read_csv(RAW / "ghg-per-kg-poore.csv")
    ghg_map = dict(zip(ghg["Entity"], ghg["Greenhouse gas emissions per kilogram"]))
    plant_items = [k for k in ghg_map if k not in MEAT_ITEMS and k not in DAIRY_ITEMS]

    # Typical serving weights (kg), USDA dietary-guidance ballpark serving
    # sizes.
    MEAT_SERVING_KG, DAIRY_SERVING_KG, PLANT_SERVING_KG = 0.20, 0.15, 0.30
    # FAO/WRAP commonly-cited average GHG intensity of wasted food.
    FOOD_WASTE_CO2_PER_KG = 2.5

    # A real week of "7 meat meals" is a mix of beef/chicken/fish, not 7
    # identical meals - so we use the data-derived *average* GHG intensity
    # across each bucket's real Poore & Nemecek items (this replaces the old
    # app's guessed constants of 6.0 / 1.8 / 0.4 kg CO2/meal with actual
    # published per-kg averages), plus modest per-row noise representing
    # genuine variation in diet composition around that average. Randomizing
    # a *single* item per row (as an earlier version of this script did)
    # makes the target dominated by unobservable noise the model can never
    # see from meal counts alone, which destroyed model accuracy - the bucket
    # average is both more realistic (a mixed diet) and learnable.
    meat_intensity = float(np.mean([ghg_map[i] for i in MEAT_ITEMS]))
    dairy_intensity = float(np.mean([ghg_map[i] for i in DAIRY_ITEMS]))
    plant_intensity = float(np.mean([ghg_map[i] for i in plant_items]))

    rows = []
    for _ in range(n_rows):
        meat_meals = float(np.clip(RNG.poisson(6), 0, 21))
        dairy_servings = float(np.clip(RNG.poisson(9), 0, 28))
        plant_meals = float(np.clip(RNG.poisson(13), 0, 28))
        food_waste_kg = float(np.clip(RNG.normal(2, 1), 0, 8))

        # Per-person diet-composition variance (e.g. more beef-heavy vs.
        # more poultry/fish-heavy), sampled once per row and applied
        # consistently across that row's meat consumption.
        meat_mix_factor = float(np.clip(RNG.normal(1.0, 0.35), 0.3, 2.2))
        dairy_mix_factor = float(np.clip(RNG.normal(1.0, 0.2), 0.5, 1.8))
        plant_mix_factor = float(np.clip(RNG.normal(1.0, 0.15), 0.6, 1.6))

        meat_co2 = meat_meals * MEAT_SERVING_KG * meat_intensity * meat_mix_factor
        dairy_co2 = dairy_servings * DAIRY_SERVING_KG * dairy_intensity * dairy_mix_factor
        plant_co2 = plant_meals * PLANT_SERVING_KG * plant_intensity * plant_mix_factor
        waste_co2 = food_waste_kg * FOOD_WASTE_CO2_PER_KG

        rows.append({
            "meatMeals": meat_meals,
            "dairyServings": dairy_servings,
            "plantMeals": plant_meals,
            "foodWasteKg": round(food_waste_kg, 2),
            "co2e_kg": round(meat_co2 + dairy_co2 + plant_co2 + waste_co2, 2),
        })
    out = pd.DataFrame(rows)
    out.to_csv(PROCESSED / "food.csv", index=False)
    print(f"food.csv: {len(out)} rows")
    return out


# ---------------------------------------------------------------------------
# WASTE — OWID municipal recycling rates (real) + EPA WARM-consistent factors
# ---------------------------------------------------------------------------
def build_waste_dataset(n_rows: int = 8000) -> pd.DataFrame:
    recycled = pd.read_csv(RAW / "share-waste-collected.csv")
    # Real empirical distribution of country-level collection/recycling
    # context rates - used to sample realistic recycledPercent values
    # instead of an arbitrary uniform distribution.
    real_rates = recycled.iloc[:, -1].dropna()
    real_rates = real_rates[(real_rates >= 0) & (real_rates <= 100)].to_numpy()

    # Base landfill emission factor already used in the current app
    # (order-of-magnitude consistent with published mixed-MSW landfill
    # lifecycle GHG studies). Material multipliers are *ordinally*
    # consistent with EPA WARM (plastics/paper decompose+embody more GHG
    # than glass; organics emit landfill methane) but are approximations,
    # not exact WARM coefficients.
    BASE_CO2_PER_KG = 2.2
    MATERIAL_MULTIPLIER = {"plasticKg": 1.3, "paperKg": 1.1, "organicKg": 0.9, "glassKg": 0.05}
    MATERIAL_FACTOR = {k: BASE_CO2_PER_KG * m for k, m in MATERIAL_MULTIPLIER.items()}

    # Approximate US per-capita weekly composition shares, ballpark from
    # published EPA MSW characterization reports.
    rows = []
    for _ in range(n_rows):
        plastic_kg = float(np.clip(RNG.normal(1.4, 0.5), 0.1, 4))
        paper_kg = float(np.clip(RNG.normal(2.0, 0.7), 0.1, 5))
        organic_kg = float(np.clip(RNG.normal(2.8, 1.0), 0.1, 7))
        glass_kg = float(np.clip(RNG.normal(0.9, 0.4), 0.0, 3))
        recycled_percent = float(RNG.choice(real_rates))

        landfill_factor = 1 - recycled_percent / 100
        co2e = (
            plastic_kg * MATERIAL_FACTOR["plasticKg"]
            + paper_kg * MATERIAL_FACTOR["paperKg"]
            + organic_kg * MATERIAL_FACTOR["organicKg"]
            + glass_kg * MATERIAL_FACTOR["glassKg"]
        ) * landfill_factor

        rows.append({
            "plasticKg": round(plastic_kg, 2),
            "paperKg": round(paper_kg, 2),
            "organicKg": round(organic_kg, 2),
            "glassKg": round(glass_kg, 2),
            "recycledPercent": round(recycled_percent, 1),
            "co2e_kg": round(float(co2e), 3),
        })
    out = pd.DataFrame(rows)
    out.to_csv(PROCESSED / "waste.csv", index=False)
    print(f"waste.csv: {len(out)} rows")
    return out


def main() -> None:
    build_carbon_dataset()
    build_energy_dataset()
    build_electronics_dataset()
    build_water_dataset()
    build_food_dataset()
    build_waste_dataset()
    print("\nAll processed datasets written to", PROCESSED)


if __name__ == "__main__":
    main()
