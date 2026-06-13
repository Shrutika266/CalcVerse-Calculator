import { useState } from 'react';
import { motion } from 'motion/react';
import { Percent } from 'lucide-react';
import { addHistoryItem } from '../utils/history';

interface PercentageCalculatorProps {
  darkMode?: boolean;
}

export default function PercentageCalculator({ darkMode = true }: PercentageCalculatorProps) {
  const [calcType, setCalcType] = useState<'what_percent' | 'percent_of' | 'percent_change'>('percent_of');
  const [values, setValues] = useState({ x: 20, y: 100, oldVal: 100, newVal: 150 });
  const [result, setResult] = useState<number | null>(null);

  const tabCardStyle = darkMode
    ? "bg-[#0b132b] rounded-3xl p-6 md:p-8 border border-blue-900/30 shadow-2xl text-white"
    : "bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-lg text-slate-900";

  const inputStyle = darkMode
    ? "w-full p-3 rounded-2xl border border-blue-900/30 bg-[#121c3d] text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
    : "w-full p-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none";

  const calculate = () => {
    let res: number = 0;
    let expr = '';
    if (calcType === 'percent_of') {
      res = (values.x / 100) * values.y;
      expr = `${values.x}% of ${values.y} = ${res}`;
    } else if (calcType === 'what_percent') {
      res = (values.x / values.y) * 100;
      expr = `${values.x} is ${res}% of ${values.y}`;
    } else {
      res = ((values.newVal - values.oldVal) / values.oldVal) * 100;
      expr = `Change from ${values.oldVal} to ${values.newVal} = ${res}%`;
    }
    setResult(res);
    try {
      addHistoryItem(expr, res.toFixed(2));
    } catch (e) {}
  };

  return (
    <div id="percentage-calculator" className={`w-full max-w-4xl mx-auto ${tabCardStyle}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 text-white">
          <Percent className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Percentage Calculator</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Calculate percentages instantly</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Formula Display */}
        <div className={`p-3 rounded-xl mb-2 ${darkMode ? 'bg-[#0f1724]/60 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
          <div className="text-xs font-semibold">Formula</div>
          <div className="text-sm font-mono mt-1">
            {calcType === 'percent_of' && <>Result = (X / 100) × Y</>}
            {calcType === 'what_percent' && <>Result (%) = (X ÷ Y) × 100</>}
            {calcType === 'percent_change' && <>Change (%) = ((New − Old) ÷ Old) × 100</>}
          </div>
        </div>
        {/* Calculator Type Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: 'percent_of', label: 'X% of Y' },
            { id: 'what_percent', label: 'X is % of Y' },
            { id: 'percent_change', label: '% Change' }
          ].map((type) => (
            <motion.button
              key={type.id}
              onClick={() => setCalcType(type.id as any)}
              className={`py-3 px-4 rounded-xl font-bold transition-all ${
                calcType === type.id
                  ? 'bg-orange-500 text-white shadow-lg'
                  : darkMode
                  ? 'bg-[#121c3d] text-slate-300 hover:bg-[#192652]'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {type.label}
            </motion.button>
          ))}
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calcType === 'percent_of' && (
            <>
              <div>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Percentage (%)</label>
                <input
                  type="number"
                  value={values.x}
                  onChange={(e) => setValues({ ...values, x: parseFloat(e.target.value) || 0 })}
                  className={inputStyle}
                  placeholder="Enter percentage"
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Total Value</label>
                <input
                  type="number"
                  value={values.y}
                  onChange={(e) => setValues({ ...values, y: parseFloat(e.target.value) || 0 })}
                  className={inputStyle}
                  placeholder="Enter total value"
                />
              </div>
            </>
          )}
          {calcType === 'what_percent' && (
            <>
              <div>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Part Value (X)</label>
                <input
                  type="number"
                  value={values.x}
                  onChange={(e) => setValues({ ...values, x: parseFloat(e.target.value) || 0 })}
                  className={inputStyle}
                  placeholder="Enter part value"
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Total Value (Y)</label>
                <input
                  type="number"
                  value={values.y}
                  onChange={(e) => setValues({ ...values, y: parseFloat(e.target.value) || 0 })}
                  className={inputStyle}
                  placeholder="Enter total value"
                />
              </div>
            </>
          )}
          {calcType === 'percent_change' && (
            <>
              <div>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Old Value</label>
                <input
                  type="number"
                  value={values.oldVal}
                  onChange={(e) => setValues({ ...values, oldVal: parseFloat(e.target.value) || 0 })}
                  className={inputStyle}
                  placeholder="Enter old value"
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>New Value</label>
                <input
                  type="number"
                  value={values.newVal}
                  onChange={(e) => setValues({ ...values, newVal: parseFloat(e.target.value) || 0 })}
                  className={inputStyle}
                  placeholder="Enter new value"
                />
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={calculate}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Calculate
          </motion.button>
        </div>

        {/* Result */}
        {result !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border-2 ${
              darkMode
                ? 'bg-[#121c3d] border-orange-500/50 text-white'
                : 'bg-orange-50 border-orange-300 text-slate-900'
            }`}
          >
            <p className="text-sm font-bold mb-2">Result:</p>
            <p className="text-4xl font-black text-orange-500">{result.toFixed(2)}</p>
            <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {calcType === 'percent_of' && `${values.x}% of ${values.y} = ${result.toFixed(2)}`}
              {calcType === 'what_percent' && `${values.x} is ${result.toFixed(2)}% of ${values.y}`}
              {calcType === 'percent_change' && `Change from ${values.oldVal} to ${values.newVal} = ${result.toFixed(2)}%`}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
