import type { CalculatorCategory } from '@/types';

export interface FieldConfig {
  key: string;
  label: string;
  type: 'select' | 'number';
  placeholder?: string;
  unit?: string;
  min?: number;
  step?: number;
  defaultValue: number | string;
  options?: { label: string; value: string }[];
}

export interface CategoryConfig {
  category: CalculatorCategory;
  title: string;
  description: string;
  icon: string;
  fields: FieldConfig[];
  primaryMetricLabel: string;
  primaryMetricKey: string;
}

export const categoryConfigs: Record<CalculatorCategory, CategoryConfig> = {
  carbon: {
    category: 'carbon',
    title: 'Carbon Calculator',
    description: 'Estimate your transportation carbon footprint',
    icon: 'Car',
    primaryMetricLabel: 'CO₂ Emissions',
    primaryMetricKey: 'co2e',
    fields: [
      {
        key: 'vehicleType', label: 'Vehicle Type', type: 'select', defaultValue: 'car',
        options: [
          { label: 'Car', value: 'car' }, { label: 'SUV / Truck', value: 'suv' },
          { label: 'Motorcycle', value: 'motorcycle' }, { label: 'Bus', value: 'bus' },
          { label: 'Van', value: 'van' },
        ],
      },
      {
        key: 'fuelType', label: 'Fuel Type', type: 'select', defaultValue: 'petrol',
        options: [
          { label: 'Petrol', value: 'petrol' }, { label: 'Diesel', value: 'diesel' },
          { label: 'Hybrid', value: 'hybrid' }, { label: 'Electric', value: 'electric' },
          { label: 'CNG', value: 'cng' }, { label: 'E85', value: 'e85' },
        ],
      },
      { key: 'distance', label: 'Distance', type: 'number', unit: 'km', placeholder: '500', min: 0, step: 10, defaultValue: 500 },
      { key: 'fuelConsumption', label: 'Fuel Consumption', type: 'number', unit: 'L/100km', placeholder: '8', min: 0, step: 0.5, defaultValue: 8 },
      { key: 'passengers', label: 'Passengers', type: 'number', unit: 'people', placeholder: '1', min: 1, step: 1, defaultValue: 1 },
    ],
  },
  water: {
    category: 'water',
    title: 'Water Calculator',
    description: 'Track your daily water consumption',
    icon: 'Droplets',
    primaryMetricLabel: 'Water Usage',
    primaryMetricKey: 'waterLiters',
    fields: [
      { key: 'showerMinutes', label: 'Shower Time', type: 'number', unit: 'min/day', placeholder: '10', min: 0, step: 1, defaultValue: 10 },
      { key: 'laundryLoads', label: 'Laundry Loads', type: 'number', unit: 'loads/week', placeholder: '4', min: 0, step: 1, defaultValue: 4 },
      { key: 'dishwasherLoads', label: 'Dishwasher', type: 'number', unit: 'loads/week', placeholder: '5', min: 0, step: 1, defaultValue: 5 },
      { key: 'toiletFlushes', label: 'Toilet Flushes', type: 'number', unit: 'flushes/day', placeholder: '5', min: 0, step: 1, defaultValue: 5 },
      { key: 'tapMinutes', label: 'Tap Usage', type: 'number', unit: 'min/day', placeholder: '15', min: 0, step: 1, defaultValue: 15 },
    ],
  },
  energy: {
    category: 'energy',
    title: 'Energy Calculator',
    description: 'Analyze your electricity and heating usage',
    icon: 'Zap',
    primaryMetricLabel: 'Energy Usage',
    primaryMetricKey: 'energyKwh',
    fields: [
      { key: 'electricityKwh', label: 'Electricity', type: 'number', unit: 'kWh/month', placeholder: '300', min: 0, step: 10, defaultValue: 300 },
      {
        key: 'heatingType', label: 'Heating Type', type: 'select', defaultValue: 'natural_gas',
        options: [
          { label: 'Natural Gas', value: 'natural_gas' }, { label: 'Oil', value: 'oil' },
          { label: 'Electric', value: 'electric' }, { label: 'Heat Pump', value: 'heat_pump' },
          { label: 'Propane', value: 'propane' }, { label: 'Biomass', value: 'biomass' },
        ],
      },
      { key: 'heatingKwh', label: 'Heating', type: 'number', unit: 'kWh/month', placeholder: '200', min: 0, step: 10, defaultValue: 200 },
      { key: 'renewablePercent', label: 'Renewable Energy', type: 'number', unit: '%', placeholder: '0', min: 0, step: 5, defaultValue: 0 },
    ],
  },
  food: {
    category: 'food',
    title: 'Food Calculator',
    description: 'Measure your dietary environmental impact',
    icon: 'UtensilsCrossed',
    primaryMetricLabel: 'Food CO₂e',
    primaryMetricKey: 'co2e',
    fields: [
      { key: 'meatMeals', label: 'Meat Meals', type: 'number', unit: 'meals/week', placeholder: '7', min: 0, step: 1, defaultValue: 7 },
      { key: 'dairyServings', label: 'Dairy Servings', type: 'number', unit: 'servings/week', placeholder: '10', min: 0, step: 1, defaultValue: 10 },
      { key: 'plantMeals', label: 'Plant Meals', type: 'number', unit: 'meals/week', placeholder: '14', min: 0, step: 1, defaultValue: 14 },
      { key: 'foodWasteKg', label: 'Food Waste', type: 'number', unit: 'kg/week', placeholder: '2', min: 0, step: 0.5, defaultValue: 2 },
    ],
  },
  waste: {
    category: 'waste',
    title: 'Waste Calculator',
    description: 'Assess your waste and recycling impact',
    icon: 'Recycle',
    primaryMetricLabel: 'Waste CO₂e',
    primaryMetricKey: 'co2e',
    fields: [
      { key: 'plasticKg', label: 'Plastic Waste', type: 'number', unit: 'kg/week', placeholder: '1.5', min: 0, step: 0.1, defaultValue: 1.5 },
      { key: 'paperKg', label: 'Paper Waste', type: 'number', unit: 'kg/week', placeholder: '2', min: 0, step: 0.1, defaultValue: 2 },
      { key: 'organicKg', label: 'Organic Waste', type: 'number', unit: 'kg/week', placeholder: '3', min: 0, step: 0.1, defaultValue: 3 },
      { key: 'glassKg', label: 'Glass Waste', type: 'number', unit: 'kg/week', placeholder: '1', min: 0, step: 0.1, defaultValue: 1 },
      { key: 'recycledPercent', label: 'Recycling Rate', type: 'number', unit: '%', placeholder: '40', min: 0, step: 5, defaultValue: 40 },
    ],
  },
  electronics: {
    category: 'electronics',
    title: 'Electronics Calculator',
    description: 'Evaluate your device energy consumption',
    icon: 'Smartphone',
    primaryMetricLabel: 'Energy Usage',
    primaryMetricKey: 'energyKwh',
    fields: [
      {
        key: 'deviceType', label: 'Device Type', type: 'select', defaultValue: 'laptop',
        options: [
          { label: 'Laptop', value: 'laptop' }, { label: 'Desktop PC', value: 'desktop' },
          { label: 'TV', value: 'tv' }, { label: 'Gaming Console', value: 'console' },
          { label: 'Monitor', value: 'monitor' },
        ],
      },
      { key: 'usageHours', label: 'Daily Usage', type: 'number', unit: 'hours/day', placeholder: '8', min: 0, step: 1, defaultValue: 8 },
      { key: 'powerWatts', label: 'Power Draw', type: 'number', unit: 'watts', placeholder: '65', min: 0, step: 5, defaultValue: 65 },
      { key: 'standbyHours', label: 'Standby Time', type: 'number', unit: 'hours/day', placeholder: '16', min: 0, step: 1, defaultValue: 16 },
      { key: 'devicesCount', label: 'Number of Devices', type: 'number', unit: 'devices', placeholder: '1', min: 1, step: 1, defaultValue: 1 },
    ],
  },
};

export const validCategories: CalculatorCategory[] = ['carbon', 'water', 'energy', 'food', 'waste', 'electronics'];
