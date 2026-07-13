from typing import Literal

from pydantic import BaseModel, Field

VehicleType = Literal["car", "suv", "motorcycle", "bus", "van"]
FuelType = Literal["petrol", "diesel", "hybrid", "electric", "cng", "e85"]
HeatingType = Literal["natural_gas", "oil", "electric", "heat_pump", "propane", "biomass"]
DeviceType = Literal["laptop", "desktop", "tv", "console", "monitor"]


class CarbonInput(BaseModel):
    vehicleType: VehicleType
    fuelType: FuelType
    distance: float = Field(ge=0, le=20000)
    fuelConsumption: float = Field(ge=0, le=100)
    passengers: int = Field(ge=1, le=20)


class WaterInput(BaseModel):
    showerMinutes: float = Field(ge=0, le=120)
    laundryLoads: float = Field(ge=0, le=50)
    dishwasherLoads: float = Field(ge=0, le=50)
    toiletFlushes: float = Field(ge=0, le=50)
    tapMinutes: float = Field(ge=0, le=180)


class EnergyInput(BaseModel):
    electricityKwh: float = Field(ge=0, le=10000)
    heatingType: HeatingType
    heatingKwh: float = Field(ge=0, le=10000)
    renewablePercent: float = Field(ge=0, le=100)
    avgOutdoorTempC: float = Field(default=12.0, ge=-40, le=50)


class FoodInput(BaseModel):
    meatMeals: float = Field(ge=0, le=50)
    dairyServings: float = Field(ge=0, le=50)
    plantMeals: float = Field(ge=0, le=50)
    foodWasteKg: float = Field(ge=0, le=50)


class WasteInput(BaseModel):
    plasticKg: float = Field(ge=0, le=100)
    paperKg: float = Field(ge=0, le=100)
    organicKg: float = Field(ge=0, le=100)
    glassKg: float = Field(ge=0, le=100)
    recycledPercent: float = Field(ge=0, le=100)


class ElectronicsInput(BaseModel):
    deviceType: DeviceType
    usageHours: float = Field(ge=0, le=24)
    powerWatts: float = Field(ge=0, le=5000)
    standbyHours: float = Field(ge=0, le=24)
    devicesCount: int = Field(ge=1, le=100)


class PredictionResponse(BaseModel):
    category: str
    prediction: float
    target: str
    unit: str
    greenScore: int
    confidence: float
    modelUsed: str
    percentileRank: float
    featureContributions: dict[str, float]


class ForecastPoint(BaseModel):
    date: str
    value: float


class ForecastRequest(BaseModel):
    points: list[ForecastPoint]
    periodsAhead: int = Field(default=6, ge=1, le=24)


class ForecastResponsePoint(BaseModel):
    index: int
    predicted: float
    confidenceLow: float
    confidenceHigh: float
    isHistorical: bool
    actual: float | None = None


class ForecastResponse(BaseModel):
    points: list[ForecastResponsePoint]
    trend: Literal["increasing", "decreasing", "stable"]
    trendPercent: float
    modelConfidence: float
    method: str
