import { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { addHistoryItem } from '../utils/history';


interface CompoundInterestProps {
  darkMode?: boolean;
}

export default function CompoundInterestCalculator({ darkMode = true }: CompoundInterestProps) {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [time, setTime] = useState(5);
  const [frequency, setFrequency] = useState<'daily' | 'monthly' | 'quarterly' | 'semi' | 'annual'>('annual');
  const [result, setResult] = useState<{ amount: number; interest: number } | null>(null);

  const tabCardStyle = darkMode
    ? "bg-[#0b132b] rounded-3xl p-6 md:p-8 border border-blue-900/30 shadow-2xl text-white"
    : "bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-lg text-slate-900";

  const inputStyle = darkMode
    ? "w-full p-3 rounded-2xl border border-blue-900/30 bg-[#121c3d] text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
    : "w-full p-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none";

  const frequencyMap: Record<string, number> = {
    daily: 365,
    monthly: 12,
    quarterly: 4,
    semi: 2,
    annual: 1
  };

  const calculate = () => {
    const n = frequencyMap[frequency];
    const amount = principal * Math.pow(1 + rate / 100 / n, n * time);
    const interest = amount - principal;
    setResult({ amount, interest });
    try {
      const expr = `A = ${principal} * (1 + ${rate}/100 / ${n})^(${n}*${time}) = ${amount.toFixed(2)}`;
      addHistoryItem(expr, amount.toFixed(2));
    } catch (e) {}
  };

  return (
    <div id="compound-calculator" className={`w-full max-w-4xl mx-auto ${tabCardStyle}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Compound Interest Calculator</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Calculate compound interest & future value</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className={`p-3 rounded-xl mb-2 ${darkMode ? 'bg-[#07101a]/60 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
          <div className="text-xs font-semibold">Formula</div>
          <div className="text-sm font-mono mt-1">A = P × (1 + r/n)^(n×t)</div>
        </div>
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Principal Amount (₹)</label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
              className={inputStyle}
              placeholder="Enter principal"
            />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Annual Interest Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
              className={inputStyle}
              placeholder="Enter rate"
            />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Time (Years)</label>
            <input
              type="number"
              value={time}
              onChange={(e) => setTime(parseFloat(e.target.value) || 0)}
              className={inputStyle}
              placeholder="Enter time in years"
            />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Compounding Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className={inputStyle}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semi">Semi-Annually</option>
              <option value="annual">Annually</option>
            </select>
          </div>
        </div>

        {/* Calculate Button */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={calculate}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
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
                  ? 'bg-[#121c3d] border-cyan-500/50'
                  : 'bg-cyan-50 border-cyan-300'
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Principal</p>
              <p className="text-2xl font-black text-cyan-500">₹{principal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            <div
              className={`p-4 rounded-2xl border-2 ${
                darkMode
                  ? 'bg-[#121c3d] border-blue-500/50'
                  : 'bg-blue-50 border-blue-300'
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Interest Earned</p>
              <p className="text-2xl font-black text-blue-500">₹{result.interest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            <div
              className={`p-4 rounded-2xl border-2 ${
                darkMode
                  ? 'bg-[#121c3d] border-emerald-500/50'
                  : 'bg-emerald-50 border-emerald-300'
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Future Value</p>
              <p className="text-2xl font-black text-emerald-500">₹{result.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
