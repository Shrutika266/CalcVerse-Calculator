import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Percent, 
  Scale, 
  CalendarRange, 
  Scissors, 
  Globe, 
  Brain, 
  User, 
  Square,
  TrendingUp,
  Share2,
  Clock,
  Briefcase,
  Search,
  Activity,
  Cpu,
  Layers,
  Thermometer,
  Zap,
  HardDrive
} from 'lucide-react';
import { ActiveTab, GSTResult, EMIResult } from '../types';
import { 
  areaUnits, 
  lengthUnits, 
  massUnits, 
  speedUnits, 
  timeUnits, 
  volumeUnits, 
  convertTemperature, 
  convertNumeralSystem 
} from '../utils/conversions';
import PercentageCalculator from './PercentageCalculator';
import CompoundInterestCalculator from './CompoundInterestCalculator';
import InvestmentCalculator from './InvestmentCalculator';
import SIPCalculator from './SIPCalculator';
import GraphPlotter from './GraphPlotter';
import ScientificGraphVisualizer from './ScientificGraphVisualizer';
import AcademicCalculator from './AcademicCalculator';
import WaterIntakeCalculator from './WaterIntakeCalculator';
import { getBmiTips, tipsToPlainText } from '../utils/healthTips';

interface ConvertersProps {
  activeTab: ActiveTab;
  darkMode?: boolean;
}

// Global currencies helper
const fallbackRates: Record<string, number> = {
  USD: 1.0,
  INR: 83.45,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 156.40,
  CAD: 1.37,
  AUD: 1.50,
  AED: 3.67,
  SGD: 1.35,
};

// Indian state details (Sales tax / local multipliers for PPP representation)
const indianStates = [
  { code: 'MH', name: 'Maharashtra', costIndex: 1.05, label: 'High PPP state (Mumbai hub)' },
  { code: 'DL', name: 'Delhi NCR', costIndex: 1.02, label: 'Capital metabolic index' },
  { code: 'KA', name: 'Karnataka', costIndex: 1.04, label: 'Tech corridor index (Bengaluru)' },
  { code: 'TN', name: 'Tamil Nadu', costIndex: 0.98, label: 'Industrial manufacturing index' },
  { code: 'UP', name: 'Uttar Pradesh', costIndex: 0.88, label: 'Agrarian base PPP' },
  { code: 'GJ', name: 'Gujarat', costIndex: 0.96, label: 'Trading/Enterprise cost index' },
];

// US states with typical sales tax rates and cost-of-living index
const usStates = [
  { code: 'CA', name: 'California', tax: 0.0725, costIndex: 1.35 },
  { code: 'NY', name: 'New York', tax: 0.0400, costIndex: 1.40 },
  { code: 'TX', name: 'Texas', tax: 0.0625, costIndex: 0.95 },
  { code: 'FL', name: 'Florida', tax: 0.0600, costIndex: 1.01 },
  { code: 'WA', name: 'Washington', tax: 0.0650, costIndex: 1.15 },
  { code: 'IL', name: 'Illinois', tax: 0.0625, costIndex: 1.00 },
];

export default function Converters({ activeTab, darkMode = true }: ConvertersProps) {
  // Theme styling helpers inside converter tabs (Stunning Cosmic Navy Theme for dark mode, clean white for light mode)
  const tabCardStyle = darkMode 
    ? "navy-converter-palette bg-[#0b132b] @theme/dark:bg-[#070b19] rounded-3xl p-6 md:p-8 border border-blue-900/30 shadow-2xl transition-all max-w-4xl mx-auto w-full text-white"
    : "light-converter-palette bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-lg transition-all max-w-4xl mx-auto w-full text-slate-900";
  const headerContainerStyle = "flex items-center space-x-3 border-b border-blue-900/20 pb-4 mb-6";
  const labelStyle = "block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2";
  const inputStyle = "w-full p-3.5 rounded-2xl border border-blue-900/30 bg-[#121c3d] focus:bg-[#192652] focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none text-white font-semibold transition-all text-base placeholder-slate-400";
  const selectStyle = "w-full p-3.5 rounded-2xl border border-blue-900/30 bg-[#121c3d] text-white font-semibold transition-all outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400";

  // --- 1. CURRENCY CONVERTER STATES ---
  const [currBase, setCurrBase] = useState('INR');
  const [currTarget, setCurrTarget] = useState('USD');
  const [currAmount, setCurrAmount] = useState<number | ''>(100);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(fallbackRates);
  const [liveUpdated, setLiveUpdated] = useState<string>('Local Cache');
  
  // State options matching regional query
  const [selectedIndState, setSelectedIndState] = useState('MH');
  const [selectedUsState, setSelectedUsState] = useState('CA');

  useEffect(() => {
    // Attempt real-time currency conversion based on live exchange rates
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((res) => {
        if (!res.ok) throw new Error('Network query failed');
        return res.json();
      })
      .then((data) => {
        if (data && data.rates) {
          setExchangeRates(data.rates);
          const dateStr = new Date(data.time_last_update_utc).toLocaleDateString();
          setLiveUpdated(`Live Rate API (${dateStr})`);
        }
      })
      .catch((err) => {
        console.warn('Unable to reach live rates API, using default rates:', err);
        setLiveUpdated('Local cached fallback');
      });
  }, []);

  const convertCurrencyVal = (amount: number, from: string, to: string): number => {
    const fromRate = exchangeRates[from] || fallbackRates[from];
    const toRate = exchangeRates[to] || fallbackRates[to];
    if (!fromRate || !toRate) return 0;
    // Base is USD
    const usd = amount / fromRate;
    return usd * toRate;
  };

  // State-wise breakdown calculations
  const inrValueState = (currAmount === '' ? 0 : currAmount);
  // Base USD rate for the INR amount
  const baseUSDTotal = convertCurrencyVal(inrValueState, 'INR', 'USD');
  const baseEURTotal = convertCurrencyVal(inrValueState, 'INR', 'EUR');

  const indStateObj = indianStates.find(s => s.code === selectedIndState) || indianStates[0];
  const usStateObj = usStates.find(s => s.code === selectedUsState) || usStates[0];

  // Apply state logic: Adjust local purchasing capacity in USD based on state sales tax and living indices
  // Effective cost-of-living adjusted conversion
  const stateAdjustedUSD = baseUSDTotal * (indStateObj.costIndex / usStateObj.costIndex);
  const stateUSDWithSalesTax = baseUSDTotal * (1 - usStateObj.tax);

  // --- 2. GST CALCULATOR STATES ---
  const [gstPrice, setGstPrice] = useState<number | ''>(1000);
  const [gstPercent, setGstPercent] = useState<number>(18);
  const [gstIsAdd, setGstIsAdd] = useState<boolean>(true); // Add GST vs Remove GST

  const computeGST = (): GSTResult => {
    const price = gstPrice === '' ? 0 : gstPrice;
    let gstAmount = 0;
    let totalPrice = 0;

    if (gstIsAdd) {
      gstAmount = (price * gstPercent) / 100;
      totalPrice = price + gstAmount;
    } else {
      totalPrice = price / (1 + gstPercent / 100);
      gstAmount = price - totalPrice;
    }

    return {
      originalPrice: price,
      gstPercent,
      gstAmount,
      totalPrice,
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
    };
  };

  const gstRes = computeGST();

  // --- 3. LOAN / EMI CALCULATOR STATES ---
  const [loanPrincipal, setLoanPrincipal] = useState<number | ''>(500000);
  const [loanRate, setLoanRate] = useState<number | ''>(8.5);
  const [loanTenure, setLoanTenure] = useState<number | ''>(5);
  const [loanTenureUnit, setLoanTenureUnit] = useState<'years' | 'months'>('years');

  const computeEMI = (): EMIResult => {
    const P = loanPrincipal === '' ? 0 : loanPrincipal;
    const rAnnual = loanRate === '' ? 0 : loanRate;
    const tVal = loanTenure === '' ? 0 : loanTenure;

    const N = loanTenureUnit === 'years' ? tVal * 12 : tVal;
    const rMonthly = (rAnnual / 12) / 100;

    if (rMonthly === 0) {
      const emi = N > 0 ? P / N : 0;
      return {
        monthlyPayment: emi,
        totalInterest: 0,
        totalPayment: P,
        schedule: Array.from({ length: N }, (_, i) => ({
          month: i + 1,
          principalPaid: emi,
          interestPaid: 0,
          remainingBalance: Math.max(0, P - emi * (i + 1)),
        })),
      };
    }

    const emi = N > 0 ? (P * rMonthly * Math.pow(1 + rMonthly, N)) / (Math.pow(1 + rMonthly, N) - 1) : 0;
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    let balance = P;
    const schedule = [];
    for (let m = 1; m <= Math.min(N, 60); m++) { // Limit schedules to first 60 months for performance
      const interestPaid = balance * rMonthly;
      const principalPaid = emi - interestPaid;
      balance = Math.max(0, balance - principalPaid);
      schedule.push({
        month: m,
        principalPaid,
        interestPaid,
        remainingBalance: balance,
      });
    }

    return {
      monthlyPayment: emi,
      totalInterest,
      totalPayment,
      schedule,
    };
  };

  const emiRes = computeEMI();

  // --- 4. AGE CONVERTER STATES ---
  const [dob, setDob] = useState<string>('2000-01-01');

  const computeAge = () => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();

    if (birthDate > today) return { error: 'Date of birth cannot be in the future!' };

    // Calculate exact age difference
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Time calculations
    const diffMs = today.getTime() - birthDate.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalSeconds = Math.floor(diffMs / 1000);

    // Next Birthday countdown
    const nextBday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBday < today) {
      nextBday.setFullYear(today.getFullYear() + 1);
    }
    const daysUntilNext = Math.ceil((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      totalSeconds,
      daysUntilNext,
    };
  };

  const ageDetails = computeAge();

  // --- 5. DATE CONVERTER STATES ---
  const [dateStart, setDateStart] = useState<string>('2026-06-01');
  const [dateEnd, setDateEnd] = useState<string>('2026-06-11');

  const computeDateDiff = () => {
    if (!dateStart || !dateEnd) return null;
    const start = new Date(dateStart);
    const end = new Date(dateEnd);

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;

    return {
      days: totalDays,
      weeks: totalWeeks,
      remDays: remainingDays,
      months: (totalDays / 30.43).toFixed(1),
    };
  };

  const dateDiffObj = computeDateDiff();

  // --- 6. DISCOUNT CALCULATOR STATES ---
  const [originalCost, setOriginalCost] = useState<number | ''>(500);
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [taxPercent, setTaxPercent] = useState<number>(8);

  const calculateDiscount = () => {
    const cost = originalCost === '' ? 0 : originalCost;
    const discountAmt = (cost * discountPercent) / 100;
    const subtotal = cost - discountAmt;
    const taxAmt = (subtotal * taxPercent) / 100;
    const finalCost = subtotal + taxAmt;

    return {
      savings: discountAmt,
      subtotal,
      taxAmount: taxAmt,
      finalCost,
    };
  };

  const discountRes = calculateDiscount();

  // --- 7. BMI CALCULATOR STATES ---
  const [heightUnit, setHeightUnit] = useState<'cm' | 'm' | 'ft' | 'in'>('cm');
  const [heightVal, setHeightVal] = useState<number | ''>(175);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [weightVal, setWeightVal] = useState<number | ''>(70);

  const calculateBMI = () => {
    const height = heightVal === '' ? 0 : heightVal;
    const weight = weightVal === '' ? 0 : weightVal;
    if (!height || !weight) return null;

    // Convert height to meters
    let hMeters = 0;
    switch (heightUnit) {
      case 'cm': hMeters = height / 100; break;
      case 'm': hMeters = height; break;
      case 'ft': hMeters = height * 0.3048; break;
      case 'in': hMeters = height * 0.0254; break;
    }

    // Convert weight to kg
    let wKg = weightUnit === 'kg' ? weight : weight * 0.45359237;

    if (hMeters <= 0) return null;

    const bmi = wKg / (hMeters * hMeters);

    let category = 'Normal weight';
    let color = 'text-green-500';
    let rangeIndex = 1; // 0 Under, 1 Normal, 2 Over, 3 Obese

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-sky-500';
      rangeIndex = 0;
    } else if (bmi < 25) {
      category = 'Normal weight';
      color = 'text-green-500';
      rangeIndex = 1;
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-amber-500';
      rangeIndex = 2;
    } else {
      category = 'Obese';
      color = 'text-red-500';
      rangeIndex = 3;
    }

    const idealLow = 18.5 * (hMeters * hMeters);
    const idealHigh = 24.9 * (hMeters * hMeters);

    return {
      score: bmi.toFixed(1),
      category,
      color,
      rangeIndex,
      idealWeight: `${weightUnit === 'kg' ? idealLow.toFixed(1) : (idealLow * 2.20462).toFixed(1)} - ${weightUnit === 'kg' ? idealHigh.toFixed(1) : (idealHigh * 2.20462).toFixed(1)} ${weightUnit}`,
    };
  };

  const bmiDetails = calculateBMI();

  // --- 8. DECIMAL BINARY OCTAL HEXADECIMAL CONVERTER STATES ---
  const [numBase, setNumBase] = useState<'dec' | 'bin' | 'oct' | 'hex'>('dec');
  const [numValue, setNumValue] = useState<string>('255');
  const numeralResults = convertNumeralSystem(numValue, numBase);

  // --- 9. DATA CONVERTER STATES ---
  const [dataInput, setDataInput] = useState<number | ''>(5);
  const [dataFromUnit, setDataFromUnit] = useState<string>('GB');
  const [dataToUnit, setDataToUnit] = useState<string>('MB');
  const [isBinaryFormat, setIsBinaryFormat] = useState<boolean>(true); // binary (1024) vs decimal (1000)

  const convertDataUnits = () => {
    const val = dataInput === '' ? 0 : dataInput;
    const baseMult = isBinaryFormat ? 1024 : 1000;

    const dataScales: Record<string, number> = {
      'Bit': 0.125,
      'Byte': 1,
      'KB': baseMult,
      'MB': Math.pow(baseMult, 2),
      'GB': Math.pow(baseMult, 3),
      'TB': Math.pow(baseMult, 4),
      'PB': Math.pow(baseMult, 5),
      'EB': Math.pow(baseMult, 6),
    };

    const fromScale = dataScales[dataFromUnit] || 1;
    const toScale = dataScales[dataToUnit] || 1;
    return (val * fromScale) / toScale;
  };

  const dataResult = convertDataUnits();

  // --- 10. AREA CONVERTER STATES ---
  const [areaInput, setAreaInput] = useState<number | ''>(1);
  const [areaFrom, setAreaFrom] = useState<keyof typeof areaUnits>('acre');
  const [areaTo, setAreaTo] = useState<keyof typeof areaUnits>('sq_m');

  const convertAreaValues = () => {
    const val = areaInput === '' ? 0 : areaInput;
    const fromMult = areaUnits[areaFrom]?.val || 1;
    const toMult = areaUnits[areaTo]?.val || 1;
    return (val * fromMult) / toMult;
  };

  // --- 11. LENGTH CONVERTER STATES ---
  const [lengthInput, setLengthInput] = useState<number | ''>(10);
  const [lengthFrom, setLengthFrom] = useState<keyof typeof lengthUnits>('inch');
  const [lengthTo, setLengthTo] = useState<keyof typeof lengthUnits>('centimeter');

  const convertLengthValues = () => {
    const val = lengthInput === '' ? 0 : lengthInput;
    const fromMult = lengthUnits[lengthFrom]?.val || 1;
    const toMult = lengthUnits[lengthTo]?.val || 1;
    return (val * fromMult) / toMult;
  };

  // --- 12. MASS CONVERTER STATES ---
  const [massInput, setMassInput] = useState<number | ''>(1);
  const [massFrom, setMassFrom] = useState<keyof typeof massUnits>('kg');
  const [massTo, setMassTo] = useState<keyof typeof massUnits>('pound');

  const convertMassValues = () => {
    const val = massInput === '' ? 0 : massInput;
    const fromMult = massUnits[massFrom]?.val || 1;
    const toMult = massUnits[massTo]?.val || 1;
    return (val * fromMult) / toMult;
  };

  // --- 13. SPEED CONVERTER STATES ---
  const [speedInput, setSpeedInput] = useState<number | ''>(100);
  const [speedFrom, setSpeedFrom] = useState<keyof typeof speedUnits>('km_h');
  const [speedTo, setSpeedTo] = useState<keyof typeof speedUnits>('m_s');

  const convertSpeedValues = () => {
    const val = speedInput === '' ? 0 : speedInput;
    const fromMult = speedUnits[speedFrom]?.val || 1;
    const toMult = speedUnits[speedTo]?.val || 1;
    return (val * fromMult) / toMult;
  };

  // --- 14. VOLUME CONVERTER STATES ---
  const [volumeInput, setVolumeInput] = useState<number | ''>(1);
  const [volumeFrom, setVolumeFrom] = useState<keyof typeof volumeUnits>('liter');
  const [volumeTo, setVolumeTo] = useState<keyof typeof volumeUnits>('deciliter');

  const convertVolumeValues = () => {
    const val = volumeInput === '' ? 0 : volumeInput;
    const fromMult = volumeUnits[volumeFrom]?.val || 1;
    const toMult = volumeUnits[volumeTo]?.val || 1;
    return (val * fromMult) / toMult;
  };

  // --- 15. TEMPERATURE CONVERTER STATES ---
  const [tempInput, setTempInput] = useState<number | ''>(25);
  const [tempFrom, setTempFrom] = useState<'celsius' | 'fahrenheit' | 'kelvin' | 'rankine' | 'reaumur'>('celsius');
  const [tempTo, setTempTo] = useState<'celsius' | 'fahrenheit' | 'kelvin' | 'rankine' | 'reaumur'>('fahrenheit');

  // --- 16. TIME CONVERTER STATES ---
  const [timeInput, setTimeInput] = useState<number | ''>(1);
  const [timeFrom, setTimeFrom] = useState<keyof typeof timeUnits>('day');
  const [timeTo, setTimeTo] = useState<keyof typeof timeUnits>('hour');

  const convertTimeValues = () => {
    const val = timeInput === '' ? 0 : timeInput;
    const fromMult = timeUnits[timeFrom]?.val || 1;
    const toMult = timeUnits[timeTo]?.val || 1;
    return (val * fromMult) / toMult;
  };


  return (
    <div className="w-full px-4 py-4 md:py-6">
      
      {/* ----------------- TABLE: CURRENCY CONVERTER ----------------- */}
      {activeTab === 'conv_curr' && (
        <div className={tabCardStyle} id="curr-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Real-Time Currency Converter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Synced with {liveUpdated}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={labelStyle}>Amount</label>
              <input 
                type="number" 
                value={currAmount}
                onChange={(e) => setCurrAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputStyle}
                placeholder="Enter conversion sum"
              />
            </div>
            <div>
              <label className={labelStyle}>From</label>
              <select 
                value={currBase} 
                onChange={(e) => setCurrBase(e.target.value)}
                className={selectStyle}
              >
                {Object.keys(exchangeRates).map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelStyle}>To</label>
              <select 
                value={currTarget} 
                onChange={(e) => setCurrTarget(e.target.value)}
                className={selectStyle}
              >
                {Object.keys(exchangeRates).map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-5 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 text-center mb-8">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">Conversion Result</span>
            <div className="mt-2 text-3xl font-bold text-slate-800 dark:text-white font-mono break-all leading-tight">
              {currAmount === '' ? '0' : currAmount.toLocaleString()} <span className="text-slate-500 text-xl font-semibold">{currBase}</span> = <span className="text-indigo-600 dark:text-indigo-400">{currAmount === '' ? '0' : convertCurrencyVal(currAmount, currBase, currTarget).toLocaleString([], { maximumFractionDigits: 4 })}</span> <span className="text-slate-500 text-xl font-semibold">{currTarget}</span>
            </div>
          </div>

          {/* Special State-to-State Purchasing Power comparison dashboard */}
          <div className={`p-6 rounded-3xl border transition-colors ${darkMode ? 'bg-[#121c3d]/40 border-blue-900/20' : 'bg-white border-slate-200'}`}>
            <h4 className="font-bold text-sm text-cyan-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>State-Specific Currency Check (INR to US states USD & Euro)</span>
            </h4>

            <p className={`text-xs mb-5 leading-normal ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Compare purchasing power and sales tax implications for an Indian Rupee (₹) converting specifically to select US and European regions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className={labelStyle}>Select Indian Source State</label>
                <select 
                  value={selectedIndState} 
                  onChange={(e) => setSelectedIndState(e.target.value)}
                  className={selectStyle}
                >
                  {indianStates.map((st) => (
                    <option key={st.code} value={st.code}>{st.name} ({st.code})</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block italic">{indStateObj.label}</span>
              </div>
              <div className="hidden md:flex items-center justify-center text-slate-400 font-mono text-xl">
                ⇄
              </div>
              <div>
                <label className={labelStyle}>Select target US State</label>
                <select 
                  value={selectedUsState} 
                  onChange={(e) => setSelectedUsState(e.target.value)}
                  className={selectStyle}
                >
                  {usStates.map((st) => (
                    <option key={st.code} value={st.code}>{st.name} ({st.code})</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block italic">{usStateObj.name} typical Sales Tax: {(usStateObj.tax * 100).toFixed(2)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-[#121c3d] dark:bg-[#070b1a] border border-blue-900/20">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Standard USD Value</span>
                <p className="text-lg font-bold text-slate-100 dark:text-slate-200 mt-1">${baseUSDTotal.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#162454] dark:bg-[#0c1635] border border-blue-500/20">
                <span className="text-[10px] font-bold text-[#818cf8] uppercase">Pure Purchasing Value</span>
                <p className="text-lg font-bold text-indigo-300 dark:text-indigo-400 mt-1">${stateAdjustedUSD.toFixed(2)}</p>
                <span className="text-[9px] text-slate-300">adjusted for cost of living</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#121c3d] dark:bg-[#070b1a] border border-blue-900/20">
                <span className="text-[10px] font-bold text-slate-400 uppercase">With Sales Tax ({usStateObj.code})</span>
                <p className="text-lg font-bold text-slate-100 dark:text-slate-200 mt-1">${stateUSDWithSalesTax.toFixed(2)}</p>
                <span className="text-[9px] text-slate-300">Post local store purchase</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-2">
              <Coins className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>In parallel terms, your ₹{inrValueState.toLocaleString()} converts directly to **{baseEURTotal.toFixed(2)} EUR** (European Base union value).</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TABLE: GST CALCULATOR ----------------- */}
      {activeTab === 'calc_gst' && (
        <div className={tabCardStyle} id="gst-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">GST Calculation Screen</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Add/Subtract GST tax and split SGST & CGST instantly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={labelStyle}>Original Price (₹)</label>
              <input 
                type="number" 
                value={gstPrice}
                onChange={(e) => setGstPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputStyle}
                placeholder="Enter base price"
              />
            </div>
            <div>
              <label className={labelStyle}>Calculation Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGstIsAdd(true)}
                  className={`p-3 rounded-2xl font-bold text-sm border transition-all ${
                    gstIsAdd 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  Add GST (+)
                </button>
                <button
                  onClick={() => setGstIsAdd(false)}
                  className={`p-3 rounded-2xl font-bold text-sm border transition-all ${
                    !gstIsAdd 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  Subtract GST (-)
                </button>
              </div>
            </div>
          </div>

          <label className={labelStyle}>Select GST Rate</label>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {[3, 5, 12, 18, 28].map((rate) => (
              <button
                key={rate}
                onClick={() => setGstPercent(rate)}
                className={`p-3 rounded-xl font-bold transition-all text-xs border ${
                  gstPercent === rate 
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300' 
                    : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-750 dark:text-slate-400'
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className={labelStyle}>Custom GST Rate (%)</label>
            <input 
              type="number" 
              value={gstPercent}
              onChange={(e) => setGstPercent(e.target.value === '' ? 0 : parseFloat(e.target.value))}
              className={inputStyle}
              placeholder="Enter custom rate %"
            />
          </div>

          {/* Detailed GST Outlines */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-850 space-y-4">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm font-semibold">
              <span>{gstIsAdd ? 'Original Net Price' : 'Post-Tax Net Amount'}</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">₹{(gstRes.originalPrice).toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm font-semibold">
              <span>CGST (Central GST - {gstPercent / 2}%)</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">₹{(gstRes.cgst).toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm font-semibold">
              <span>SGST (State GST - {gstPercent / 2}%)</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">₹{(gstRes.sgst).toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm font-semibold border-t border-slate-250 dark:border-slate-800 pt-3">
              <span>Total calculated GST Tax</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">₹{(gstRes.gstAmount).toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between border-t border-indigo-100 dark:border-indigo-950/40 pt-4">
              <span className="text-base font-bold text-slate-700 dark:text-slate-300">{gstIsAdd ? 'Final Gross Price' : 'Actual Net Base Price'}</span>
              <span className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">₹{(gstRes.totalPrice).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TABLE: LOAN / EMI CALCULATOR ----------------- */}
      {activeTab === 'calc_loan' && (
        <div className={tabCardStyle} id="loan-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Loan EMI Calculator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Analyze amortization schedule and payments in details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className={labelStyle}>Principal Loan Amount (₹)</label>
              <input 
                type="number" 
                value={loanPrincipal}
                onChange={(e) => setLoanPrincipal(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputStyle}
                placeholder="Ex. 5,00,000"
              />
            </div>
            <div>
              <label className={labelStyle}>Annual Interest Rate (%)</label>
              <input 
                type="number" 
                value={loanRate}
                step="0.01"
                onChange={(e) => setLoanRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputStyle}
                placeholder="Ex. 8.5"
              />
            </div>
            <div>
              <label className={labelStyle}>Loan Tenure</label>
              <div className="flex space-x-2">
                <input 
                  type="number" 
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="w-2/3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-medium"
                  placeholder="Ex. 5"
                />
                <select 
                  value={loanTenureUnit} 
                  onChange={(e) => setLoanTenureUnit(e.target.value as 'years' | 'months')}
                  className="w-1/3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider"
                >
                  <option value="years">Yrs</option>
                  <option value="months">Mths</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl text-center">
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Monthly Loan EMI</span>
              <p className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">₹{Math.round(emiRes.monthlyPayment).toLocaleString()}</p>
            </div>
            <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-3xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interest Payable</span>
              <p className="text-2xl font-extrabold font-mono text-slate-700 dark:text-slate-200 mt-1">₹{Math.round(emiRes.totalInterest).toLocaleString()}</p>
            </div>
            <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-3xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
              <p className="text-2xl font-extrabold font-mono text-slate-700 dark:text-slate-200 mt-1">₹{Math.round(emiRes.totalPayment).toLocaleString()}</p>
            </div>
          </div>

          {/* Initial short list of monthly schedules */}
          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-3">Amortization Schedule (First 5 Months Breakdown)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-850">
                    <th className="py-2.5 font-bold">Month</th>
                    <th className="py-2.5 font-bold text-right">Interest Paid</th>
                    <th className="py-2.5 font-bold text-right">Principal Paid</th>
                    <th className="py-2.5 font-bold text-right">Principal Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {emiRes.schedule.slice(0, 5).map((row) => (
                    <tr key={row.month} className="border-b border-slate-150 dark:border-slate-850/60 font-mono">
                      <td className="py-2.5">Month {row.month}</td>
                      <td className="py-2.5 text-right text-red-500">₹{Math.round(row.interestPaid).toLocaleString()}</td>
                      <td className="py-2.5 text-right text-green-500">₹{Math.round(row.principalPaid).toLocaleString()}</td>
                      <td className="py-2.5 text-right text-slate-800 dark:text-slate-200">₹{Math.round(row.remainingBalance).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TABLE: AGE CONVERTER ----------------- */}
      {activeTab === 'conv_age' && (
        <div className={tabCardStyle} id="age-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-2xl">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Smart Age Calculator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Exact age breakdown & milestone countdowns</p>
            </div>
          </div>

          <div className="mb-8">
            <label className={labelStyle}>Your Date of Birth</label>
            <input 
              type="date" 
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={inputStyle}
            />
          </div>

          {ageDetails && ('error' in ageDetails ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-2xl text-sm font-semibold text-center">{ageDetails.error}</div>
          ) : (
            <div className="space-y-6">
              {/* Year Month Day Primary Result */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-indigo-500">Years</span>
                  <p className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">{ageDetails.years}</p>
                </div>
                <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-indigo-500">Months</span>
                  <p className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">{ageDetails.months}</p>
                </div>
                <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-indigo-500">Days</span>
                  <p className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">{ageDetails.days}</p>
                </div>
              </div>

              {/* Next BDay Highlight banner */}
              <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-amber-500 text-sm font-bold">
                  <CalendarRange className="w-5.5 h-5.5 text-amber-500" />
                  <span>Countdown for next Birthday</span>
                </div>
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  <span className="text-xl font-bold font-mono text-amber-500">{ageDetails.daysUntilNext}</span> days left
                </div>
              </div>

              {/* Total Subcounts table */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-3">Complete Lifetime Sub-Intervals</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Total Weeks</span>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">{ageDetails.totalWeeks.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Total Days</span>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">{ageDetails.totalDays.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 col-span-2 md:col-span-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Total Hours</span>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">{ageDetails.totalHours.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 col-span-2 md:col-span-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Total Minutes</span>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">{ageDetails.totalMinutes.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 col-span-2 md:col-span-2">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Total Seconds</span>
                    <p className="text-base font-bold text-slate-850 dark:text-slate-100 mt-0.5 font-mono">{ageDetails.totalSeconds.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ----------------- TABLE: DATE DIFFERENCE CALCULATOR ----------------- */}
      {activeTab === 'conv_date' && (
        <div className={tabCardStyle} id="date-diff-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-2xl">
              <CalendarRange className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Date Duration Calculator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Find difference between two dates accurately</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className={labelStyle}>Start Date</label>
              <input 
                type="date" 
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>End Date</label>
              <input 
                type="date" 
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className={inputStyle}
              />
            </div>
          </div>

          {dateDiffObj && (
            <div className="space-y-4">
              <div className="p-6 bg-teal-500/5 rounded-3xl border border-teal-500/10 text-center">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 tracking-wider uppercase">Calculated GAP</span>
                <p className="text-3xl font-extrabold font-mono text-slate-800 dark:text-white mt-1">
                  {dateDiffObj.days} <span className="text-indigo-600 dark:text-indigo-400">Days</span>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
                  Which equals {dateDiffObj.weeks} Weeks and {dateDiffObj.remDays} Days (~ {dateDiffObj.months} Months)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TABLE: DISCOUNT CALCULATOR ----------------- */}
      {activeTab === 'conv_discount' && (
        <div className={tabCardStyle} id="discount-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Retail Discount Calculator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Apply retail pricing cuts & sales taxes instantly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className={labelStyle}>Original Price (₹)</label>
              <input 
                type="number" 
                value={originalCost}
                onChange={(e) => setOriginalCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputStyle}
                placeholder="Ex. 999"
              />
            </div>
            <div>
              <label className={labelStyle}>Discount (%)</label>
              <input 
                type="number" 
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className={inputStyle}
                placeholder="Ex. 15%"
              />
            </div>
            <div>
              <label className={labelStyle}>Tax Rate (%)</label>
              <input 
                type="number" 
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className={inputStyle}
                placeholder="Ex. 8%"
              />
            </div>
          </div>

          <label className={labelStyle}>Quick Discount Rates</label>
          <div className="grid grid-cols-4 gap-2 mb-8">
            {[10, 20, 30, 50].map((rate) => (
              <button
                key={rate}
                onClick={() => setDiscountPercent(rate)}
                className={`py-2 px-3 rounded-xl font-bold transition-all text-sm border ${
                  discountPercent === rate 
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300' 
                    : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-750'
                }`}
              >
                {rate}% Off
              </button>
            ))}
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-850 space-y-3">
            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 font-semibold">
              <span>Original Gross Cost</span>
              <span className="font-mono text-slate-700 dark:text-slate-200">₹{(originalCost === '' ? 0 : originalCost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-green-500 font-bold">
              <span>Your Savings ({discountPercent}%)</span>
              <span className="font-mono">- ₹{(discountRes.savings).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-200 dark:border-slate-800/60 pt-2">
              <span>Subtotal with Discount</span>
              <span className="font-mono text-slate-700 dark:text-slate-200">₹{(discountRes.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 font-semibold">
              <span>Sales Tax ({taxPercent}%)</span>
              <span className="font-mono text-slate-700 dark:text-slate-200">+ ₹{(discountRes.taxAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-indigo-100 dark:border-indigo-950/40 pt-4">
              <span className="text-base font-bold text-slate-700 dark:text-slate-300">Final Discounted cost</span>
              <span className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">₹{(discountRes.finalCost).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TABLE: BMI CALCULATOR ----------------- */}
      {activeTab === 'conv_bmi' && (
        <div className={tabCardStyle} id="bmi-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-2xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">BMI Body Mass Calculator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify Body Mass Index health indices instantly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Height inputs */}
            <div>
              <label className={labelStyle}>Height</label>
              <div className="flex space-x-2">
                <input 
                  type="number" 
                  value={heightVal}
                  onChange={(e) => setHeightVal(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-2/3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white"
                  placeholder="Height"
                />
                <select 
                  value={heightUnit} 
                  onChange={(e) => setHeightUnit(e.target.value as any)}
                  className="w-1/3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-750 text-slate-750 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider"
                >
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                  <option value="ft">feet</option>
                  <option value="in">inch</option>
                </select>
              </div>
            </div>

            {/* Weight inputs */}
            <div>
              <label className={labelStyle}>Weight</label>
              <div className="flex space-x-2">
                <input 
                  type="number" 
                  value={weightVal}
                  onChange={(e) => setWeightVal(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-2/3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white"
                  placeholder="Weight"
                />
                <select 
                  value={weightUnit} 
                  onChange={(e) => setWeightUnit(e.target.value as any)}
                  className="w-1/3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
          </div>

          {bmiDetails && (
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-850 flex flex-col md:flex-row items-center justify-around">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Calculated Score</span>
                  <p className="text-5xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">{bmiDetails.score}</p>
                </div>
                
                <div className="text-center md:text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Diagnosis Status</span>
                  <p className={`text-2xl font-bold mt-1 ${bmiDetails.color}`}>{bmiDetails.category}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Recommended healthy weight: {bmiDetails.idealWeight}</p>
                </div>
              </div>

              {/* Graphical diagnostic bar */}
              <div>
                <span className={labelStyle}>Visual BMI Diagnostics Spectrum</span>
                <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex mt-2.5 relative">
                  <div className="h-full bg-sky-400 w-[18.5%]" title="Underweight < 18.5" />
                  <div className="h-full bg-green-400 w-[24.9%]" title="Normal 18.5 - 24.9" />
                  <div className="h-full bg-amber-400 w-[29.9%]" title="Overweight 25.0 - 29.9" />
                  <div className="h-full bg-red-400 w-[26.7%]" title="Obese >= 30.0" />

                  {/* indicator needle matching indices */}
                  <motion.div 
                    initial={{ left: '0%' }}
                    animate={{ left: `${Math.min(Math.max((parseFloat(bmiDetails.score) / 40) * 100, 5), 95)}%` }}
                    className="absolute -top-1 w-5 h-5 bg-indigo-600 border-2 border-white dark:border-slate-950 rounded-full shadow-md"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-2">
                  <span>Under (18.5)</span>
                  <span>Normal (24.9)</span>
                  <span>Over (29.9)</span>
                  <span>Obese (40.0)</span>
                </div>
              </div>

                {/* Contextual improvement tips (reusable util + quick actions) */}
                <div className="mt-4">
                  {(() => {
                    const bundle = getBmiTips(bmiDetails.rangeIndex);
                    const boxColor = bmiDetails.rangeIndex === 0 ? 'amber' : bmiDetails.rangeIndex === 1 ? 'green' : bmiDetails.rangeIndex === 2 ? 'amber' : 'red';
                    return (
                      <div className={`rounded-2xl border border-${boxColor}-200/10 bg-${boxColor}-50/5 p-4`}>
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-bold text-slate-100">{bundle.title}</h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(tipsToPlainText(bundle));
                                  alert('Tips copied to clipboard');
                                } catch (e) {
                                  alert('Copy failed — check browser permissions');
                                }
                              }}
                              className="text-xs px-2 py-1 rounded-md bg-slate-800 text-white"
                            >Copy Tips</button>
                            <button
                              onClick={async () => {
                                const text = tipsToPlainText(bundle);
                                if (navigator.share) {
                                  try {
                                    await navigator.share({ title: bundle.title, text });
                                  } catch (e) {
                                    alert('Share canceled or failed');
                                  }
                                } else {
                                  try {
                                    await navigator.clipboard.writeText(text);
                                    alert('Sharing not available — tips copied to clipboard');
                                  } catch (e) {
                                    alert('Share/copy failed');
                                  }
                                }
                              }}
                              className="text-xs px-2 py-1 rounded-md bg-slate-700 text-white"
                            >Share</button>
                          </div>
                        </div>
                        <ul className="mt-2 text-sm text-slate-300 space-y-2">
                          {bundle.tips.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TABLE: NUMERICAL SYSTEM CONVERTER ----------------- */}
      {activeTab === 'conv_num' && (
        <div className={tabCardStyle} id="num-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-2xl">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Numerical Binary Hex Oct Converter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Automatic real-time switching on numeric formats</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={labelStyle}>Select Source Numeral Base</label>
              <select 
                value={numBase} 
                onChange={(e) => setNumBase(e.target.value as any)}
                className={selectStyle}
              >
                <option value="dec">Decimal (Base 10)</option>
                <option value="bin">Binary (Base 2)</option>
                <option value="oct">Octal (Base 8)</option>
                <option value="hex">Hexadecimal (Base 16)</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Input value to convert</label>
              <input 
                type="text" 
                value={numValue}
                onChange={(e) => setNumValue(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-mono"
                placeholder="Ex. 255"
              />
            </div>
          </div>

          {numeralResults.error && (
            <div className="p-3 bg-red-100 text-red-700 text-xs font-semibold rounded-2xl text-center mb-6">{numeralResults.error}</div>
          )}

          {/* Table display representing numerals */}
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Decimal (DEC)</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-100 select-all">{numeralResults.dec || '-'}</span>
            </div>
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Binary (BIN)</span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 select-all break-all text-right">{numeralResults.bin || '-'}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Octal (OCT)</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-100 select-all">{numeralResults.oct || '-'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Hexadecimal (HEX)</span>
              <span className="text-base font-bold text-amber-500 select-all uppercase">{numeralResults.hex || '-'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TABLE: DATA STORAGE CALCULATOR ----------------- */}
      {activeTab === 'conv_data' && (
        <div className={tabCardStyle} id="data-storage-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Data Storage Capacity Converter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify data kilobytes, megabytes, or terabytes quickly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={labelStyle}>Value</label>
              <input 
                type="number" 
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputStyle}
                placeholder="Ex. 1024"
              />
            </div>
            <div>
              <label className={labelStyle}>From</label>
              <select 
                value={dataFromUnit} 
                onChange={(e) => setDataFromUnit(e.target.value)}
                className={selectStyle}
              >
                {['Bit', 'Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'].map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelStyle}>To</label>
              <select 
                value={dataToUnit} 
                onChange={(e) => setDataToUnit(e.target.value)}
                className={selectStyle}
              >
                {['Bit', 'Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'].map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 mb-6 bg-slate-50 dark:bg-slate-950 px-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase">Use Binary Scale Base-1024 (KiB/MiB)</span>
            <button
              onClick={() => setIsBinaryFormat(!isBinaryFormat)}
              className={`p-1 w-12 h-6.5 rounded-full transition-colors relative ${
                isBinaryFormat ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div 
                className={`w-4.5 h-4.5 bg-white rounded-full transition-transform shadow ${
                  isBinaryFormat ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`} 
              />
            </button>
          </div>

          <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-center font-mono text-xl font-bold dark:text-white select-all">
            {dataInput === '' ? '0' : dataInput} {dataFromUnit} = <span className="text-indigo-600 dark:text-indigo-400">{dataResult.toLocaleString([], { maximumFractionDigits: 5 })}</span> {dataToUnit}
          </div>
        </div>
      )}

      {/* ----------------- TABLE: AREA CONVERTER ----------------- */}
      {activeTab === 'conv_area' && (
        <div className={tabCardStyle} id="area-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-2xl">
              <Square className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Area Conversion Panel</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Switch between 13 precise metric & regional land scales</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={labelStyle}>Land Area</label>
              <input 
                type="number" 
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputStyle}
                placeholder="Ex. 1"
              />
            </div>
            <div>
              <label className={labelStyle}>From unit</label>
              <select 
                value={areaFrom} 
                onChange={(e) => setAreaFrom(e.target.value as any)}
                className={selectStyle}
              >
                {Object.entries(areaUnits).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelStyle}>To unit</label>
              <select 
                value={areaTo} 
                onChange={(e) => setAreaTo(e.target.value as any)}
                className={selectStyle}
              >
                {Object.entries(areaUnits).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-center font-mono text-xl font-bold dark:text-white">
            {areaInput === '' ? '0' : areaInput} {areaUnits[areaFrom]?.name.split(' (')[0]} = <span className="text-indigo-600 dark:text-indigo-400">{convertAreaValues().toLocaleString([], { maximumFractionDigits: 6 })}</span> {areaUnits[areaTo]?.name.split(' (')[0]}
          </div>
        </div>
      )}

      {/* ----------------- TABLE: LENGTH CONVERTER ----------------- */}
      {activeTab === 'conv_length' && (
        <div className={tabCardStyle} id="length-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Length & Distance Converter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">Switch metric & imperial units seamlessly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={labelStyle}>Length</label>
              <input 
                type="number" 
                value={lengthInput}
                onChange={(e) => setLengthInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>From</label>
              <select 
                value={lengthFrom} 
                onChange={(e) => setLengthFrom(e.target.value as any)}
                className={selectStyle}
              >
                {Object.entries(lengthUnits).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelStyle}>To</label>
              <select 
                value={lengthTo} 
                onChange={(e) => setLengthTo(e.target.value as any)}
                className={selectStyle}
              >
                {Object.entries(lengthUnits).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-center font-mono text-xl font-bold dark:text-white">
            {lengthInput === '' ? '0' : lengthInput} {lengthUnits[lengthFrom]?.name.split(' (')[0]} = <span className="text-indigo-600 dark:text-indigo-400">{convertLengthValues().toLocaleString([], { maximumFractionDigits: 6 })}</span> {lengthUnits[lengthTo]?.name.split(' (')[0]}
          </div>
        </div>
      )}

      {/* ----------------- TABLE: MASS CONVERTER ----------------- */}
      {activeTab === 'conv_mass' && (
        <div className={tabCardStyle} id="mass-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-2xl">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Weight & Mass Converter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Metric tonnage to fine carats conversions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={labelStyle}>Weight value</label>
              <input 
                type="number" 
                value={massInput}
                onChange={(e) => setMassInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>From</label>
              <select 
                value={massFrom} 
                onChange={(e) => setMassFrom(e.target.value as any)}
                className={selectStyle}
              >
                {Object.entries(massUnits).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelStyle}>To</label>
              <select 
                value={massTo} 
                onChange={(e) => setMassTo(e.target.value as any)}
                className={selectStyle}
              >
                {Object.entries(massUnits).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-center font-mono text-xl font-bold dark:text-white">
            {massInput === '' ? '0' : massInput} {massUnits[massFrom]?.name.split(' (')[0]} = <span className="text-indigo-600 dark:text-indigo-400">{convertMassValues().toLocaleString([], { maximumFractionDigits: 6 })}</span> {massUnits[massTo]?.name.split(' (')[0]}
          </div>
        </div>
      )}

      {/* ----------------- TABLE: SPEED CONVERTER ----------------- */}
      {activeTab === 'conv_speed' && (
        <div className={tabCardStyle} id="speed-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-2xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Speed Velocity Converter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify standard km/h, metric speed & cosmic index</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={labelStyle}>Velocity</label>
              <input 
                type="number" 
                value={speedInput}
                onChange={(e) => setSpeedInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>From</label>
              <select 
                value={speedFrom} 
                onChange={(e) => setSpeedFrom(e.target.value as any)}
                className={selectStyle}
              >
                {Object.entries(speedUnits).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelStyle}>To</label>
              <select 
                value={speedTo} 
                onChange={(e) => setSpeedTo(e.target.value as any)}
                className={selectStyle}
              >
                {Object.entries(speedUnits).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-center font-mono text-xl font-bold dark:text-white">
            {speedInput === '' ? '0' : speedInput} {speedUnits[speedFrom]?.name.split(' (')[0]} = <span className="text-indigo-600 dark:text-indigo-400">{convertSpeedValues().toLocaleString([], { maximumFractionDigits: 6 })}</span> {speedUnits[speedTo]?.name.split(' (')[0]}
          </div>
        </div>
      )}

      {/* ----------------- TABLE: TEMPERATURE CONVERTER ----------------- */}
      {activeTab === 'conv_temp' && (
        <div className={tabCardStyle} id="temp-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-2xl">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Temperature Formula Converter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Switch Celsius, Fahrenheit, Kelvin, Rankine & Réaumur</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={labelStyle}>Temperature</label>
              <input 
                type="number" 
                value={tempInput}
                onChange={(e) => setTempInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>From</label>
              <select 
                value={tempFrom} 
                onChange={(e) => setTempFrom(e.target.value as any)}
                className={selectStyle}
              >
                <option value="celsius">Celsius (°C)</option>
                <option value="fahrenheit">Fahrenheit (°F)</option>
                <option value="kelvin">Kelvin (K)</option>
                <option value="rankine">Rankine (°Ra)</option>
                <option value="reaumur">Réaumur (°Re)</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>To</label>
              <select 
                value={tempTo} 
                onChange={(e) => setTempTo(e.target.value as any)}
                className={selectStyle}
              >
                <option value="celsius">Celsius (°C)</option>
                <option value="fahrenheit">Fahrenheit (°F)</option>
                <option value="kelvin">Kelvin (K)</option>
                <option value="rankine">Rankine (°Ra)</option>
                <option value="reaumur">Réaumur (°Re)</option>
              </select>
            </div>
          </div>

          <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-center font-mono text-xl font-bold dark:text-white">
            {tempInput === '' ? '0' : tempInput} = <span className="text-indigo-600 dark:text-indigo-400">{(convertTemperature(parseFloat(tempInput as any), tempFrom, tempTo)).toLocaleString([], { maximumFractionDigits: 4 })}</span>
          </div>
        </div>
      )}

      {/* ----------------- TABLE: TIME CONVERTER ----------------- */}
      {activeTab === 'conv_time' && (
        <div className={tabCardStyle} id="time-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Time Interval Converter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Compute precise seconds, years, or sub-picoseconds instantly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={labelStyle}>Duration</label>
              <input 
                type="number" 
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>From</label>
              <select 
                value={timeFrom} 
                onChange={(e) => setTimeFrom(e.target.value as any)}
                className={selectStyle}
              >
                {Object.entries(timeUnits).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelStyle}>To</label>
              <select 
                value={timeTo} 
                onChange={(e) => setTimeTo(e.target.value as any)}
                className={selectStyle}
              >
                {Object.entries(timeUnits).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-center font-mono text-xl font-bold dark:text-white">
            {timeInput === '' ? '0' : timeInput} {timeUnits[timeFrom]?.name.split(' (')[0]} = <span className="text-indigo-600 dark:text-indigo-400">{convertTimeValues().toLocaleString([], { maximumFractionDigits: 6 })}</span> {timeUnits[timeTo]?.name.split(' (')[0]}
          </div>
        </div>
      )}

      {/* ----------------- TABLE: VOLUME CONVERTER ----------------- */}
      {activeTab === 'conv_volume' && (
        <div className={tabCardStyle} id="volume-container">
          <div className={headerContainerStyle}>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Volume Capacity Converter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Convert metric liters, deciliter or yards instantly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={labelStyle}>Volume size</label>
              <input 
                type="number" 
                value={volumeInput}
                onChange={(e) => setVolumeInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>From</label>
              <select 
                value={volumeFrom} 
                onChange={(e) => setVolumeFrom(e.target.value as any)}
                className={selectStyle}
              >
                {Object.entries(volumeUnits).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelStyle}>To</label>
              <select 
                value={volumeTo} 
                onChange={(e) => setVolumeTo(e.target.value as any)}
                className={selectStyle}
              >
                {Object.entries(volumeUnits).map(([key, item]) => (
                  <option key={key} value={key}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-center font-mono text-xl font-bold dark:text-white">
            {volumeInput === '' ? '0' : volumeInput} {volumeUnits[volumeFrom]?.name.split(' (')[0]} = <span className="text-indigo-600 dark:text-indigo-400">{convertVolumeValues().toLocaleString([], { maximumFractionDigits: 6 })}</span> {volumeUnits[volumeTo]?.name.split(' (')[0]}
          </div>
        </div>
      )}

      {/* ===== NEW FINANCIAL & GRAPHING CALCULATORS ===== */}

      {/* Percentage Calculator */}
      {activeTab === 'calc_percentage' && <PercentageCalculator darkMode={darkMode} />}

      {/* Compound Interest Calculator */}
      {activeTab === 'calc_compound' && <CompoundInterestCalculator darkMode={darkMode} />}

      {/* Investment Calculator */}
      {activeTab === 'calc_investment' && <InvestmentCalculator darkMode={darkMode} />}

      {/* SIP Calculator */}
      {activeTab === 'calc_sip' && <SIPCalculator darkMode={darkMode} />}

      {/* Graph Plotter */}
      {activeTab === 'calc_graph' && <GraphPlotter darkMode={darkMode} />}

      {/* Scientific Graph Visualizer */}
      {activeTab === 'calc_scientific_graph' && <ScientificGraphVisualizer darkMode={darkMode} />}

      {/* Academic Calculator */}
      {activeTab === 'calc_academic' && <AcademicCalculator darkMode={darkMode} />}

      {/* Water Intake Calculator */}
      {activeTab === 'calc_water_intake' && <WaterIntakeCalculator darkMode={darkMode} />}

    </div>
  );
}
