import { useState } from 'react';
import { motion } from 'motion/react';
import { ScatterChart } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { addHistoryItem } from '../utils/history';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ScientificGraphProps {
  darkMode?: boolean;
}

export default function ScientificGraphVisualizer({ darkMode = true }: ScientificGraphProps) {
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(['sine']);
  const [xRange, setXRange] = useState(20);
  const [csvData, setCSVData] = useState('');
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState('');

  const tabCardStyle = darkMode
    ? "bg-[#0b132b] rounded-3xl p-6 md:p-8 border border-blue-900/30 shadow-2xl text-white"
    : "bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-lg text-slate-900";

  const inputStyle = darkMode
    ? "w-full p-3 rounded-2xl border border-blue-900/30 bg-[#121c3d] text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
    : "w-full p-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none";

  const textareaStyle = darkMode
    ? "w-full p-3 rounded-2xl border border-blue-900/30 bg-[#121c3d] text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-sm"
    : "w-full p-3 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm";

  const functionPresets: Record<string, (x: number) => number> = {
    sine: (x) => Math.sin(x),
    cosine: (x) => Math.cos(x),
    tangent: (x) => Math.tan(x),
    exponential: (x) => Math.exp(x / 10),
  };

  const plot = () => {
    setError('');
    try {
      const datasets: any[] = [];
      const colors = ['#06b6d4', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

      const xMin = -xRange / 2;
      const xMax = xRange / 2;
      const step = xRange / 100;
      const labels: string[] = [];
      const xValues: number[] = [];

      for (let x = xMin; x <= xMax; x += step) {
        xValues.push(x);
        labels.push(x.toFixed(1));
      }

      // Plot selected functions
      selectedFunctions.forEach((func, idx) => {
        if (func in functionPresets) {
          const yData = xValues.map((x) => {
            try {
              const y = functionPresets[func](x);
              return isFinite(y) ? y : null;
            } catch {
              return null;
            }
          });

          datasets.push({
            label: func.charAt(0).toUpperCase() + func.slice(1),
            data: yData,
            borderColor: colors[idx % colors.length],
            backgroundColor: colors[idx % colors.length] + '20',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: false,
          });
        }
      });

      // Parse CSV data if provided
      if (csvData.trim()) {
        try {
          const lines = csvData.trim().split('\n');
          const xData: number[] = [];
          const yData: number[] = [];

          lines.forEach((line) => {
            const [x, y] = line.split(',').map((v) => parseFloat(v.trim()));
            if (!isNaN(x) && !isNaN(y)) {
              xData.push(x);
              yData.push(y);
            }
          });

          if (xData.length > 0) {
            datasets.push({
              label: 'CSV Data',
              data: yData,
              borderColor: '#e879f9',
              backgroundColor: '#e879f920',
              borderWidth: 2,
              pointRadius: 5,
              pointBackgroundColor: '#e879f9',
              tension: 0,
              fill: false,
            });
            labels.length = 0;
            xData.forEach((_, i) => labels.push(i.toString()));
          }
        } catch (e) {
          setError('Invalid CSV format. Use: x,y format per line');
          return;
        }
      }

      if (datasets.length === 0) {
        setError('No data to plot. Select a function or add CSV data.');
        return;
      }

      setChartData({ labels, datasets });
      try {
        addHistoryItem(`Scientific Plot: ${selectedFunctions.join(',')}`, 'plotted');
      } catch (e) {}
    } catch (e) {
      setError(`Error: ${(e as Error).message}`);
    }
  };

  const handleFunctionToggle = (func: string) => {
    setSelectedFunctions((prev) =>
      prev.includes(func) ? prev.filter((f) => f !== func) : [...prev, func]
    );
  };

  return (
    <div id="scientific-graph" className={`w-full max-w-4xl mx-auto ${tabCardStyle}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <ScatterChart className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Scientific Graph Visualizer</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Plot scientific functions and custom data</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Function Selection */}
        <div>
          <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Select Functions</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(functionPresets).map((func) => (
              <motion.button
                key={func}
                onClick={() => handleFunctionToggle(func)}
                className={`py-2 px-3 rounded-lg font-bold transition-all text-sm ${
                  selectedFunctions.includes(func)
                    ? 'bg-purple-600 text-white shadow-lg'
                    : darkMode
                    ? 'bg-[#121c3d] text-slate-300 hover:bg-[#192652]'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {func.charAt(0).toUpperCase() + func.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* X Range */}
        <div>
          <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>X-Axis Range (±{xRange / 2})</label>
          <input
            type="range"
            min="5"
            max="100"
            value={xRange}
            onChange={(e) => setXRange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* CSV Data Input */}
        <div>
          <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            Custom Data (CSV Format, optional)
          </label>
          <textarea
            value={csvData}
            onChange={(e) => setCSVData(e.target.value)}
            className={textareaStyle}
            placeholder="x1,y1&#10;x2,y2&#10;x3,y3"
            rows={4}
          />
          <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Format: One data point per line as x,y
          </p>
        </div>

        {/* Plot Button */}
        <motion.button
          onClick={plot}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Visualize
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
                ? 'bg-black border-purple-500/50'
                : 'bg-slate-50 border-purple-300'
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
                      font: { size: 11, weight: 'bold' }
                    }
                  },
                  title: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    grid: { color: darkMode ? '#0b0b0b' : '#e2e8f0' },
                    ticks: { color: darkMode ? '#cbd5e1' : '#64748b', font: { size: 9 } }
                  },
                  y: {
                    grid: { color: darkMode ? '#0b0b0b' : '#e2e8f0' },
                    ticks: { color: darkMode ? '#cbd5e1' : '#64748b', font: { size: 9 } }
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
