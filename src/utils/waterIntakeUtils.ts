export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type ClimateType = 'cold' | 'moderate' | 'hot';

export interface WaterRecord {
  id: string;
  date: string;
  intakeLiters: number;
}

export const getActivityMultiplier = (activity: ActivityLevel): number => {
  switch (activity) {
    case 'lightly_active':
      return 1.1;
    case 'moderately_active':
      return 1.2;
    case 'very_active':
      return 1.3;
    default:
      return 1.0;
  }
};

export const getClimateMultiplier = (climate: ClimateType): number => {
  switch (climate) {
    case 'cold':
      return 0.95;
    case 'hot':
      return 1.15;
    default:
      return 1.0;
  }
};

export const getAgeAdjustment = (age: number): number => {
  if (age <= 0) return 1.0;
  if (age < 18) return 1.05;
  if (age >= 55) return 0.93;
  return 1.0;
};

export const calculateDailyWaterIntake = (
  weightKg: number,
  age: number,
  activity: ActivityLevel,
  climate: ClimateType
): number => {
  const baseMl = Math.max(0, weightKg) * 35;
  const activityFactor = getActivityMultiplier(activity);
  const climateFactor = getClimateMultiplier(climate);
  const ageFactor = getAgeAdjustment(age);
  const totalMl = baseMl * activityFactor * climateFactor * ageFactor;
  return Number((totalMl / 1000).toFixed(2));
};

export const litersToGlasses = (liters: number, glassSizeMl = 250): number => {
  if (liters <= 0) return 0;
  return Math.round((liters * 1000) / glassSizeMl);
};

export const hydrationLevel = (liters: number, targetLiters: number): string => {
  if (liters >= targetLiters) return 'Hydrated';
  const ratio = liters / Math.max(0.1, targetLiters);
  if (ratio >= 0.85) return 'Almost There';
  if (ratio >= 0.65) return 'Below Target';
  return 'Needs More Water';
};

export const hydrationTips = (liters: number, targetLiters: number): string[] => {
  const tips: string[] = [];
  if (liters >= targetLiters) {
    tips.push('You have reached your daily hydration target. Keep maintaining steady sips throughout the day.');
    tips.push('Continue drinking water before meals and after exercise.');
  } else {
    tips.push('Try drinking a glass of water every 1-2 hours to stay on track.');
    if (targetLiters - liters >= 0.75) {
      tips.push('Increase your intake with herbal tea, cucumber water, or infused water for better hydration.');
    } else {
      tips.push('A small reminder bottle or hydration app can help you meet your daily goal.');
    }
  }
  tips.push('Avoid caffeinated beverages as your main source of hydration.');
  return tips;
};
