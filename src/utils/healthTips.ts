export interface TipBundle {
  title: string;
  tips: string[];
}

export const getBmiTips = (rangeIndex: number): TipBundle => {
  switch (rangeIndex) {
    case 0:
      return {
        title: 'Underweight — Tips to Improve',
        tips: [
          'Increase calorie intake with nutrient-dense foods (nuts, avocados, smoothies).',
          'Prefer 5–6 smaller meals/day and include healthy snacks.',
          'Prioritize protein and resistance training to build lean mass.',
          'Consult a healthcare provider to rule out underlying causes.',
        ],
      };
    case 2:
      return {
        title: 'Overweight — Practical Tips',
        tips: [
          'Adopt a balanced calorie-controlled diet rich in vegetables and lean proteins.',
          'Increase physical activity: aim for 150+ minutes of moderate exercise weekly.',
          'Reduce sugary drinks and processed snacks; prefer whole foods.',
          'Consult a dietitian for a personalized plan and set gradual goals.',
        ],
      };
    case 3:
      return {
        title: 'Obese — Recommended Actions',
        tips: [
          'Seek medical advice to assess risks and create a supervised weight-loss plan.',
          'Start with low-impact activities (walking, cycling, water aerobics) and increase gradually.',
          'Consider behavioral support, nutritional counseling, and structured programs.',
          'Monitor progress and focus on sustainable lifestyle changes rather than quick fixes.',
        ],
      };
    default:
      return {
        title: 'Maintenance Tips',
        tips: [
          'Maintain a balanced diet and regular physical activity.',
          'Monitor weight periodically and keep hydrated.',
          'Include strength training and cardiovascular exercise in routine.',
        ],
      };
  }
};

export const tipsToPlainText = (bundle: TipBundle): string => {
  return `${bundle.title}\n\n- ${bundle.tips.join('\n- ')}`;
};
