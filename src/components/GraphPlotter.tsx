import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart as LineChartIcon } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { addHistoryItem } from '../utils/history';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface GraphPlotterProps {
  darkMode?: boolean;
}

export default function GraphPlotter({ darkMode = true }: GraphPlotterProps) {
  const [functionStr, setFunctionStr] = useState('Math.sin(x)');
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState('');

  const tabCardStyle = darkMode
    ? "bg-[#0b132b] rounded-3xl p-6 md:p-8 border border-blue-900/30 shadow-2xl text-white"
    : "bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-lg text-slate-900";

  const inputStyle = darkMode
    ? "w-full p-3 rounded-2xl border border-blue-900/30 bg-[#121c3d] text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
    : "w-full p-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none";

  const plot = () => {
    setError('');
    try {
      const points: { x: number; y: number }[] = [];
      const step = (xMax - xMin) / 100;

      // Create function from string
      const fn = new Function('x', `return ${functionStr}`);

      for (let x = xMin; x <= xMax; x += step) {
        const y = fn(x);
        if (typeof y === 'number' && isFinite(y)) {
          points.push({ x, y });
        }
      }

      if (points.length === 0) {
        setError('No valid points generated. Check your function.');
        return;
      }

      const labels = points.map((p) => p.x.toFixed(1));
      const data = points.map((p) => p.y);

      setChartData({
        labels,
        datasets: [
          {
            label: functionStr,
            data,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
          }
        ]
      });
      try {
        addHistoryItem(`Plot: ${functionStr} range [${xMin},${xMax}]`, 'plotted');
      } catch (e) {}
    } catch (e) {
      setError(`Error: ${(e as Error).message}`);
    }
  };

  useEffect(() => {
    plot();
  }, []);

  return (
    <div id="graph-plotter" className={`w-full max-w-4xl mx-auto ${tabCardStyle}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <LineChartIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Graph Plotter</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Visualize mathematical functions</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
              Function (use 'x' as variable)
            </label>
            <input
              type="text"
              value={functionStr}
              onChange={(e) => setFunctionStr(e.target.value)}
              className={inputStyle}
              placeholder="e.g., Math.sin(x), x*x, Math.cos(x)"
            />
            <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Examples: <code className="font-mono">Math.sin(x)</code>, <code className="font-mono">x*x</code>, <code className="font-mono">Math.sqrt(x)</code>
            </p>
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>X Min</label>
            <input
              type="number"
              value={xMin}
              onChange={(e) => setXMin(parseFloat(e.target.value) || -10)}
              className={inputStyle}
              placeholder="Min X value"
            />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>X Max</label>
            <input
              type="number"
              value={xMax}
              onChange={(e) => setXMax(parseFloat(e.target.value) || 10)}
              className={inputStyle}
              placeholder="Max X value"
            />
          </div>
        </div>

        {/* Plot Button */}
        <motion.button
          onClick={plot}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Plot Graph
        </motion.button>

        {/* Error Display */}
        {error && (
          <div className={`p-4 rounded-xl text-sm ${darkMode ? 'bg-red-900/30 text-red-300 border border-red-900' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            {error}
          </div>
        )}

        {/* Chart */}
        {chartData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border-2 ${
              darkMode
                ? 'bg-black border-indigo-500/50'
                : 'bg-slate-50 border-indigo-300'
            }`}
          >
            <Line
              data={chartData}
              plugins={[{
                id: 'darkBg',
                beforeDraw: (chart) => {
                  if (!darkMode) return;
                  const ctx = chart.ctx;
                  ctx.save();
                  ctx.fillStyle = '#000';
                  ctx.fillRect(0, 0, chart.width, chart.height);
                  ctx.restore();
                }
              }]}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    labels: {
                      color: darkMode ? '#cbd5e1' : '#1e293b',
                      font: { size: 12, weight: 'bold' }
                    }
                  },
                  title: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    grid: {
                      color: darkMode ? '#0b0b0b' : '#e2e8f0'
                    },
                    ticks: {
                      color: darkMode ? '#cbd5e1' : '#64748b',
                      font: { size: 10 }
                    }
                  },
                  y: {
                    grid: {
                      color: darkMode ? '#0b0b0b' : '#e2e8f0'
                    },
                    ticks: {
                      color: darkMode ? '#cbd5e1' : '#64748b',
                      font: { size: 10 }
                    }
                  }
                }
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
