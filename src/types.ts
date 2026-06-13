export type ActiveTab = 
  | 'home'
  | 'calc_std'
  | 'calc_sci'
  | 'calc_loan'
  | 'calc_gst'
  | 'calc_percentage'
  | 'calc_compound'
  | 'calc_investment'
  | 'calc_sip'
  | 'calc_graph'
  | 'calc_scientific_graph'
  | 'calc_academic'
  | 'calc_water_intake'
  | 'conv_curr'
  | 'conv_age'
  | 'conv_bmi'
  | 'conv_discount'
  | 'conv_date'
  | 'conv_area'
  | 'conv_length'
  | 'conv_mass'
  | 'conv_num'
  | 'conv_speed'
  | 'conv_temp'
  | 'conv_time'
  | 'conv_volume'
  | 'conv_data'
  | 'history';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export interface GSTResult {
  originalPrice: number;
  gstPercent: number;
  gstAmount: number;
  totalPrice: number;
  cgst: number;
  sgst: number;
}

export interface EMIResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  schedule: Array<{
    month: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
  }>;
}
