# Dataset sources & preprocessing

GREENLY's ML models are trained on **six** per-category datasets, each built by
`scripts/prepare_datasets.py` from real, publicly published sources (no
Kaggle account / API key required — see `scripts/download_datasets.py`).

## Why hybrid (real data + engineered sampling), not a single raw CSV

No public dataset maps "household calculator inputs -> footprint" directly.
Datasets of that exact shape are either paywalled, gated behind a Kaggle
account, or don't exist at household granularity at all. So each category
combines:

1. A **real published data source** for the input->outcome relationship
   (an actual EPA-tested vehicle's CO2 rate, an actual food product's
   GHG/kg from a 38,700-farm meta-analysis, actual sensor-logged household
   energy use, etc).
2. **Engineered sampling** of the usage-frequency inputs (how many showers,
   how many meat meals) grounded in cited government/scientific figures,
   plus documented real-world noise (e.g. the EPA-test-vs-real-world
   driving gap) where no per-household survey exists publicly.

Every constant is commented with its source in `prepare_datasets.py`. None
are arbitrary.

## Sources

| Category | Real data source | Rows | License / access |
|---|---|---|---|
| Carbon / transport | [EPA fueleconomy.gov `vehicles.csv`](https://www.fueleconomy.gov/feg/download.shtml) — every vehicle model EPA fuel-economy-tested, 1984-present, with tailpipe CO2 (g/mile) | ~50,000 vehicle records | US government, public domain |
| Energy | [UCI "Appliances energy prediction"](https://archive.ics.uci.edu/dataset/374/appliances+energy+prediction) — 10-minute whole-house appliance energy (Wh) + climate sensors, ~4.5 months, real house | 19,735 readings | UCI ML Repository, public |
| Electronics | EPA ENERGY STAR / DOE published typical device power-draw ranges (laptop, desktop, TV, console, monitor) | engineered from cited ranges | US government, public |
| Food | [Our World in Data — Poore & Nemecek (2018)](https://ourworldindata.org/environmental-impacts-of-food) — GHG emissions per kg for 40 food products, meta-analysis of 38,700 farms / 119 countries | 37 products used (bucketed meat/dairy/plant) | OWID, CC BY 4.0 |
| Waste | [Our World in Data — municipal waste collection/recycling rates](https://ourworldindata.org/waste-management) (real country-year rates, used to sample a realistic `recycledPercent` distribution instead of assuming uniform) + EPA WARM-*consistent* (not exact) material emission ordering | 111 countries' rates sampled from | OWID, CC BY 4.0 |
| Water | EPA WaterSense / USGS published approximate per-fixture flow-rate benchmarks (shower L/min, toilet L/flush, etc.) | engineered from cited benchmarks | US government, public |

## Preprocessing steps applied (per category)

1. **Filtering** — drop rows with invalid/placeholder values (e.g. EPA's `-1`
   sentinel for missing CO2 data, non-light-duty test years).
2. **Categorical mapping** — EPA's ~30 raw `VClass` vehicle-class strings and
   6 `fuelType1` values (plus `atvType` for hybrids/EVs) are mapped onto the
   app's 5 vehicle types and 6 fuel types via rule-based matching.
3. **Unit normalization** — MPG -> L/100km, g CO2/mile -> kg CO2/km, MPGe ->
   kWh/km via the DOE's 33.7 kWh/gallon-equivalent constant.
4. **Feature engineering** — heating-degree-day style outdoor-temperature
   feature for energy demand; per-row "diet composition" and "fixture
   efficiency" multipliers representing genuine household-to-household
   variance that isn't observable from usage counts alone.
5. **Missing values** — none remain after filtering (verified in the build
   script's output — 0 missing values across all six processed datasets).
6. **Outlier removal** — physically implausible values are clipped (e.g.
   vehicle CO2/km capped at 1.5 kg/km, water fixture rates bounded to
   realistic fixture ranges).
7. **Normalization** — tree-based models (Random Forest, Gradient Boosting,
   XGBoost, LightGBM, CatBoost) don't require feature scaling, so none is
   applied; categorical features are one-hot encoded via a shared
   `ColumnTransformer` so every algorithm is compared on identical inputs.

## Known limitation, stated plainly

The **water** model reaches R²≈0.78, not the ~0.98+ of other categories.
This is intentional, not a bug: two households with identical usage habits
(same shower minutes, same laundry loads) can have meaningfully different
total consumption depending on fixture efficiency (old vs. WaterSense-rated
hardware), which isn't knowable from usage counts alone — we model that as
genuine per-household noise rather than hiding it. See
`models/metrics.json` for the full per-algorithm comparison.
