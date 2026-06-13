import { useState } from 'react';
import { motion } from 'motion/react';
import { PiggyBank } from 'lucide-react';
import { addHistoryItem } from '../utils/history';

interface InvestmentCalculatorProps {
  darkMode?: boolean;
}

export default function InvestmentCalculator({ darkMode = true }: InvestmentCalculatorProps) {
  const [initial, setInitial] = useState(50000);
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(10);
  const [result, setResult] = useState<{ balance: number; contributed: number; interest: number } | null>(null);

  const tabCardStyle = darkMode
    ? "bg-[#0b132b] rounded-3xl p-6 md:p-8 border border-blue-900/30 shadow-2xl text-white"
    : "bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-lg text-slate-900";

  const inputStyle = darkMode
    ? "w-full p-3 rounded-2xl border border-blue-900/30 bg-[#121c3d] text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
    : "w-full p-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none";

  const calculate = () => {
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    
    // Future value of initial investment
    const fvInitial = initial * Math.pow(1 + monthlyRate, months);
    
    // Future value of monthly contributions (annuity)
    const fvMonthly = monthly * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    
    const totalBalance = fvInitial + fvMonthly;
    const totalContributed = initial + monthly * months;
    const totalInterest = totalBalance - totalContributed;
    setResult({ balance: totalBalance, contributed: totalContributed, interest: totalInterest });
    try {
      const expr = `FV = ${initial}*(1+${monthlyRate})^${months} + contributions FV = ${totalBalance.toFixed(2)}`;
      addHistoryItem(expr, totalBalance.toFixed(2));
    } catch (e) {}
  };

  return (
    <div id="investment-calculator" className={`w-full max-w-4xl mx-auto ${tabCardStyle}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white">
          <PiggyBank className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Investment Calculator</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Plan your investment with regular contributions</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className={`p-3 rounded-xl mb-2 ${darkMode ? 'bg-[#07101a]/60 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
          <div className="text-xs font-semibold">Formula</div>
          <div className="text-sm font-mono mt-1">FV = PV×(1+r)^n + PMT×[(1+r)^n − 1]/r</div>
        </div>
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Initial Investment (₹)</label>
            <input
              type="number"
              value={initial}
              onChange={(e) => setInitial(parseFloat(e.target.value) || 0)}
              className={inputStyle}
              placeholder="Enter initial amount"
            />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Monthly Contribution (₹)</label>
            <input
              type="number"
              value={monthly}
              onChange={(e) => setMonthly(parseFloat(e.target.value) || 0)}
              className={inputStyle}
              placeholder="Enter monthly amount"
            />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Annual Return Rate (%)</label>
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
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Investment Period (Years)</label>
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
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
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
                  ? 'bg-[#121c3d] border-pink-500/50'
                  : 'bg-pink-50 border-pink-300'
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Contributed</p>
              <p className="text-2xl font-black text-pink-500">₹{result.contributed.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            <div
              className={`p-4 rounded-2xl border-2 ${
                darkMode
                  ? 'bg-[#121c3d] border-rose-500/50'
                  : 'bg-rose-50 border-rose-300'
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Interest Gained</p>
              <p className="text-2xl font-black text-rose-500">₹{result.interest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            <div
              className={`p-4 rounded-2xl border-2 ${
                darkMode
                  ? 'bg-[#121c3d] border-emerald-500/50'
                  : 'bg-emerald-50 border-emerald-300'
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Balance</p>
              <p className="text-2xl font-black text-emerald-500">₹{result.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
