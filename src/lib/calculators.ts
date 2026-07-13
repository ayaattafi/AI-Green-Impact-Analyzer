import * as mlService from '@/services/mlService';
import type { CalculatorCategory, CalculationResult, AnalysisOutputs } from '@/types';

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Feature -> actionable tip, keyed by the ML model's real (global) feature
 * importance for that category. We surface the single most influential
 * feature for this category's trained model and pair it with a concrete
 * action - this replaces the old score-bucket canned strings with guidance
 * that is actually derived from what the model learned matters.
 */
const FEATURE_TIPS: Record<CalculatorCategory, Record<string, string>> = {
  carbon: {
    distance: 'Distance dominates your footprint — combining trips or working remotely even one day a week compounds fast.',
    fuelType: 'Fuel type is a major driver here — switching to hybrid or electric could cut this trip\'s emissions substantially.',
    fuelConsumption: 'Your vehicle\'s fuel consumption rate is the biggest lever — a more efficient vehicle would meaningfully lower this number.',
    vehicleType: 'Vehicle class matters a lot for this trip — a smaller or lighter vehicle reduces emissions per km.',
    passengers: 'Carpooling barely changes total trip emissions but slashes your personal share — bring a passenger next time.',
  },
  water: {
    laundryLoads: 'Laundry is your largest water draw — running full loads on an eco cycle has the biggest impact available to you.',
    showerMinutes: 'Shower time is your largest water draw — a low-flow showerhead or a couple fewer minutes adds up fast.',
    tapMinutes: 'Tap usage is a major contributor — turning off the tap while brushing/washing saves more than it seems.',
    dishwasherLoads: 'Dishwasher loads are a meaningful share — always run full loads on the eco setting.',
    toiletFlushes: 'Toilet usage is a meaningful share — a dual-flush retrofit is a one-time fix with a lasting effect.',
  },
  energy: {
    electricityKwh: 'Electricity use is your largest lever — a green energy tariff or efficiency upgrades will move this the most.',
    heatingKwh: 'Heating is your largest energy draw — insulation and a heat pump upgrade have outsized impact.',
    heatingType: 'Your heating system type is a major driver — a heat pump is roughly 3x more efficient than gas or oil heating.',
    renewablePercent: 'Renewable share is doing a lot of work here — increasing it further is the single biggest thing you can do.',
    avgOutdoorTempC: 'Weather-driven heating demand is a big factor — this varies seasonally and isn\'t fully in your control.',
  },
  food: {
    meatMeals: 'Meat meals are your largest food-related footprint — swapping a couple of meals a week for plant-based options has outsized impact.',
    dairyServings: 'Dairy is a meaningful share of your footprint — plant-based alternatives for some servings would help.',
    plantMeals: 'Plant-based meals are already your lowest-impact choice — keep leaning into them.',
    foodWasteKg: 'Food waste is a significant, fully avoidable share — better meal planning directly cuts this number.',
  },
  waste: {
    organicKg: 'Organic waste is a major contributor — composting instead of landfilling avoids most of its emissions.',
    plasticKg: 'Plastic waste carries a high emissions factor — reducing single-use plastic has outsized impact.',
    paperKg: 'Paper waste is a meaningful share — recycling it directly avoids landfill emissions.',
    recycledPercent: 'Your recycling rate is the single biggest lever on this result — every extra % diverted helps.',
    glassKg: 'Glass is your smallest contributor here — it\'s largely inert in landfill compared to other materials.',
  },
  electronics: {
    powerWatts: 'Device power draw is the biggest factor — this device runs hotter/higher-wattage than efficient alternatives.',
    usageHours: 'Active usage hours are your largest lever — power-saving/auto-sleep settings reduce this directly.',
    standbyHours: 'Standby ("phantom load") time is a bigger factor than people expect — unplugging or a smart power strip helps.',
    devicesCount: 'Number of devices multiplies everything else — consolidating devices reduces total draw.',
    deviceType: 'This device category is inherently power-hungry relative to alternatives.',
  },
};

/** Top N actionable tips for a category, ranked by real model feature importance. */
export function getTopFeatureTips(
  category: CalculatorCategory,
  featureContributions: Record<string, number>,
  count = 3
): { feature: string; share: number; tip: string }[] {
  return Object.entries(featureContributions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([feature, share]) => ({ feature, share, tip: FEATURE_TIPS[category][feature] ?? '' }))
    .filter((t) => t.tip);
}

function buildRecommendation(
  category: CalculatorCategory,
  featureContributions: Record<string, number>,
  greenScore: number
): string {
  const sorted = Object.entries(featureContributions).sort((a, b) => b[1] - a[1]);
  const [topFeature, topShare] = sorted[0] ?? [null, 0];
  const tip = topFeature ? FEATURE_TIPS[category][topFeature] : null;
  const prefix = greenScore >= 80 ? 'Excellent result. ' : greenScore >= 60 ? 'Good result. ' : greenScore >= 40 ? 'Room to improve. ' : 'High impact detected. ';
  const attribution = tip ? `${tip} (This factor accounts for ~${Math.round((topShare as number) * 100)}% of what our model weighs for ${category}.)` : '';
  return `${prefix}${attribution}`.trim();
}

function buildDetails(category: CalculatorCategory, inputs: Record<string, unknown>, prediction: mlService.MlPrediction): Record<string, number | string> {
  const details: Record<string, number | string> = {};
  if (category === 'carbon') {
    const passengers = Number(inputs.passengers) || 1;
    details['CO₂ total (kg)'] = prediction.prediction;
    details['CO₂ per passenger (kg)'] = Number((prediction.prediction / passengers).toFixed(2));
    details['Trees needed/yr'] = Math.ceil(prediction.prediction / 21);
    details['Distance (km)'] = Number(inputs.distance) || 0;
  } else if (category === 'water') {
    details['Total water (L)'] = prediction.prediction;
    details['Est. daily cost ($)'] = Number((prediction.prediction * 0.003).toFixed(2));
  } else if (category === 'energy' || category === 'electronics') {
    details['CO₂e (kg)'] = prediction.prediction;
    const kwh = category === 'energy'
      ? (Number(inputs.electricityKwh) || 0) + (Number(inputs.heatingKwh) || 0)
      : undefined;
    if (kwh !== undefined) {
      details['Total energy (kWh)'] = Number(kwh.toFixed(1));
      details['Est. cost ($)'] = Number((kwh * 0.15).toFixed(2));
    }
  } else if (category === 'food' || category === 'waste') {
    details['CO₂e (kg)'] = prediction.prediction;
  }
  details['Model percentile'] = `${prediction.percentileRank}th`;
  return details;
}

export async function calculate(
  category: CalculatorCategory,
  inputs: Record<string, unknown>
): Promise<CalculationResult> {
  const invalidField = Object.entries(inputs).find(
    ([, v]) => typeof v === 'number' && !Number.isFinite(v)
  );
  if (invalidField) {
    throw new Error(`"${invalidField[0]}" is not a valid number. Please check your inputs and try again.`);
  }

  const prediction = await mlService.predict(category, inputs);

  const outputs: AnalysisOutputs = {
    greenScore: clampScore(prediction.greenScore),
    details: buildDetails(category, inputs, prediction),
    modelUsed: prediction.modelUsed,
    confidence: prediction.confidence,
    percentileRank: prediction.percentileRank,
    featureContributions: prediction.featureContributions,
  };

  if (prediction.target === 'waterLiters') {
    outputs.waterLiters = prediction.prediction;
  } else if (category === 'energy' || category === 'electronics') {
    outputs.co2e = prediction.prediction;
    outputs.energyKwh = Number(outputs.details['Total energy (kWh)'] ?? 0) || undefined;
  } else {
    outputs.co2e = prediction.prediction;
    if (category === 'carbon') {
      outputs.treesNeeded = Number(outputs.details['Trees needed/yr']);
    }
  }
  if (typeof outputs.details['Est. cost ($)'] === 'number') outputs.cost = outputs.details['Est. cost ($)'] as number;
  if (typeof outputs.details['Est. daily cost ($)'] === 'number') outputs.cost = outputs.details['Est. daily cost ($)'] as number;
  if (category === 'waste') outputs.wasteKg = Number(inputs.plasticKg ?? 0) + Number(inputs.paperKg ?? 0) + Number(inputs.organicKg ?? 0) + Number(inputs.glassKg ?? 0);

  return {
    category,
    inputs,
    outputs,
    recommendation: buildRecommendation(category, prediction.featureContributions, outputs.greenScore),
  };
}
