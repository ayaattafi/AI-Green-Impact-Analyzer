"""
Downloads the public source datasets used to train GREENLY's ML models.

Every dataset here is real, publicly published, and requires no API key /
account:

  1. EPA fueleconomy.gov "vehicles.csv"     -> carbon/transport model
     https://www.fueleconomy.gov/feg/epadata/vehicles.csv.zip
     US DOE/EPA joint dataset of every vehicle model tested for fuel economy
     and tailpipe CO2, 1984-present.

  2. UCI "Appliances energy prediction"     -> energy/electronics model
     https://archive.ics.uci.edu/ml/machine-learning-databases/00374/energydata_complete.csv
     10-minute-interval whole-house appliance energy use (Wh) for a low-energy
     house in Belgium, ~4.5 months, with indoor/outdoor climate sensors.

  3. Our World in Data - Poore & Nemecek (2018) food footprints -> food model
     https://ourworldindata.org/grapher/ghg-per-kg-poore.csv
     https://ourworldindata.org/grapher/land-use-per-kg-poore.csv
     https://ourworldindata.org/grapher/water-withdrawals-per-kg-poore.csv
     Meta-analysis of 38,700 farms across 119 countries / 40 products -
     greenhouse-gas, land and freshwater footprint per kg of food product.

  4. Our World in Data - municipal waste                          -> waste model
     https://ourworldindata.org/grapher/municipal-waste-recycled.csv
     https://ourworldindata.org/grapher/share-waste-collected.csv
     Country-year municipal solid waste recycling/collection rates.

Run: python scripts/download_datasets.py
"""
import io
import zipfile
from pathlib import Path

import requests

RAW = Path(__file__).resolve().parent.parent / "data" / "raw"
RAW.mkdir(parents=True, exist_ok=True)

SOURCES = {
    "ghg-per-kg-poore.csv": "https://ourworldindata.org/grapher/ghg-per-kg-poore.csv",
    "land-use-per-kg-poore.csv": "https://ourworldindata.org/grapher/land-use-per-kg-poore.csv",
    "water-withdrawals-per-kg-poore.csv": "https://ourworldindata.org/grapher/water-withdrawals-per-kg-poore.csv",
    "municipal-waste-recycled.csv": "https://ourworldindata.org/grapher/municipal-waste-recycled.csv",
    "share-waste-collected.csv": "https://ourworldindata.org/grapher/share-waste-collected.csv",
    "energydata_complete.csv": "https://archive.ics.uci.edu/ml/machine-learning-databases/00374/energydata_complete.csv",
}

VEHICLES_ZIP_URL = "https://www.fueleconomy.gov/feg/epadata/vehicles.csv.zip"


def fetch(name: str, url: str) -> None:
    dest = RAW / name
    if dest.exists():
        print(f"skip (already downloaded): {name}")
        return
    print(f"downloading {name} ...")
    resp = requests.get(url, timeout=60, headers={"User-Agent": "greenly-ml-service/1.0"})
    resp.raise_for_status()
    dest.write_bytes(resp.content)
    print(f"  saved {dest} ({len(resp.content) / 1024:.0f} KB)")


def fetch_vehicles_csv() -> None:
    dest = RAW / "vehicles.csv"
    if dest.exists():
        print("skip (already downloaded): vehicles.csv")
        return
    print("downloading vehicles.csv.zip ...")
    resp = requests.get(VEHICLES_ZIP_URL, timeout=120, headers={"User-Agent": "greenly-ml-service/1.0"})
    resp.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        inner_name = next(n for n in zf.namelist() if n.lower().endswith("vehicles.csv"))
        with zf.open(inner_name) as f:
            dest.write_bytes(f.read())
    print(f"  saved {dest}")


def main() -> None:
    fetch_vehicles_csv()
    for name, url in SOURCES.items():
        fetch(name, url)
    print("\nAll datasets downloaded to", RAW)


if __name__ == "__main__":
    main()
