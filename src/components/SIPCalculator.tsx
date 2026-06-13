import { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3 } from 'lucide-react';
import { addHistoryItem } from '../utils/history';

interface SIPCalculatorProps {
  darkMode?: boolean;
}

export default function SIPCalculator({ darkMode = true }: SIPCalculatorProps) {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState(10);
  const [result, setResult] = useState<{ totalInvested: number; estimatedReturns: number; totalWealth: number } | null>(null);

  const tabCardStyle = darkMode
    ? "bg-[#0b132b] rounded-3xl p-6 md:p-8 border border-blue-900/30 shadow-2xl text-white"
    : "bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-lg text-slate-900";

  const inputStyle = darkMode
    ? "w-full p-3 rounded-2xl border border-blue-900/30 bg-[#121c3d] text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
    : "w-full p-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none";

  const calculate = () => {
    const months = years * 12;
    const monthlyRate = expectedReturn / 100 / 12;
    
    // SIP Formula: M = P × {[(1 + r)^n - 1] / r} × (1 + r)
    const totalWealth = monthlyInvestment * 
      (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * 
      (1 + monthlyRate);
    
    const totalInvested = monthlyInvestment * months;
    const estimatedReturns = totalWealth - totalInvested;

    setResult({ totalInvested, estimatedReturns, totalWealth });
    try {
      const expr = `SIP: M=${monthlyInvestment}, r=${expectedReturn}%, n=${years}yrs => Total=${totalWealth.toFixed(2)}`;
      addHistoryItem(expr, totalWealth.toFixed(2));
    } catch (e) {}
  };

  return (
    <div id="sip-calculator" className={`w-full max-w-4xl mx-auto ${tabCardStyle}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>SIP Calculator</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Calculate Systematic Investment Plan returns</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className={`p-3 rounded-xl mb-2 ${darkMode ? 'bg-[#07101a]/60 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
          <div className="text-xs font-semibold">Formula</div>
          <div className="text-sm font-mono mt-1">FV = P × [ (1+r)^n − 1 ] / r × (1+r)</div>
        </div>
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Monthly Investment (₹)</label>
            <input
              type="number"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(parseFloat(e.target.value) || 0)}
              className={inputStyle}
              placeholder="Enter monthly amount"
            />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Expected Return Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(parseFloat(e.target.value) || 0)}
              className={inputStyle}
              placeholder="Enter rate"
            />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Time Period (Years)</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(parseFloat(e.target.value) || 0)}
              className={inputStyle}
              placeholder="Enter years"
            />
          </div>
        </div>

        {/* Calculate Button */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={calculate}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Calculate
          </motion.button>
        </div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div
              className={`p-4 rounded-2xl border-2 ${
                darkMode
                  ? 'bg-[#121c3d] border-green-500/50'
                  : 'bg-green-50 border-green-300'
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Invested</p>
              <p className="text-2xl font-black text-green-500">₹{result.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            <div
              className={`p-4 rounded-2xl border-2 ${
                darkMode
                  ? 'bg-[#121c3d] border-emerald-500/50'
                  : 'bg-emerald-50 border-emerald-300'
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Estimated Returns</p>
              <p className="text-2xl font-black text-emerald-500">₹{result.estimatedReturns.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            <div
              className={`p-4 rounded-2xl border-2 ${
                darkMode
                  ? 'bg-[#121c3d] border-cyan-500/50'
                  : 'bg-cyan-50 border-cyan-300'
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Wealth</p>
              <p className="text-2xl font-black text-cyan-500">₹{result.totalWealth.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
          </motion.div>
        )}

        {/* Info Box */}
        <div
          className={`p-4 rounded-xl text-sm ${
            darkMode
              ? 'bg-[#121c3d] text-slate-300 border border-blue-900/30'
              : 'bg-blue-50 text-slate-700 border border-blue-200'
          }`}
        >
          <p className="font-bold mb-1">💡 SIP Tip:</p>
          <p>Invest regularly regardless of market conditions. This reduces market volatility risk and builds wealth through the power of compounding.</p>
        </div>
      </div>
    </div>
  );
}
