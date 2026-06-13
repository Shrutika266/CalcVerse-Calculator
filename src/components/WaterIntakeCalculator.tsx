import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Droplet, Activity, ThermometerSun, RefreshCcw, Save, ShieldCheck } from 'lucide-react';
import { addHistoryItem } from '../utils/history';
import {
  ActivityLevel,
  ClimateType,
  WaterRecord,
  calculateDailyWaterIntake,
  hydrationLevel,
  hydrationTips,
  litersToGlasses,
} from '../utils/waterIntakeUtils';

interface WaterIntakeCalculatorProps {
  darkMode?: boolean;
}

const initialRecords: WaterRecord[] = [];

const activityOptions: Array<{ value: ActivityLevel; label: string }> = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'lightly_active', label: 'Lightly Active' },
  { value: 'moderately_active', label: 'Moderately Active' },
  { value: 'very_active', label: 'Very Active' },
];

const climateOptions: Array<{ value: ClimateType; label: string }> = [
  { value: 'cold', label: 'Cold' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hot', label: 'Hot' },
];

export default function WaterIntakeCalculator({ darkMode = true }: WaterIntakeCalculatorProps) {
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [age, setAge] = useState(28);
  const [weight, setWeight] = useState(62);
  const [height, setHeight] = useState(168);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active');
  const [climate, setClimate] = useState<ClimateType>('moderate');
  const [consumedLiters, setConsumedLiters] = useState(1.5);
  const [records, setRecords] = useState<WaterRecord[]>(initialRecords);
  const [error, setError] = useState('');

  const cardStyle = darkMode
    ? 'bg-[#0b132b] border border-slate-800 text-white'
    : 'bg-white border border-slate-200 text-slate-900';
  const inputStyle = darkMode
    ? 'w-full rounded-2xl border border-blue-900/30 bg-[#121c3d] px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500'
    : 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const dailyTarget = useMemo(
    () => calculateDailyWaterIntake(weight, age, activityLevel, climate),
    [weight, age, activityLevel, climate]
  );
  const totalGlasses = useMemo(() => litersToGlasses(dailyTarget), [dailyTarget]);
  const currentStatus = useMemo(() => hydrationLevel(consumedLiters, dailyTarget), [consumedLiters, dailyTarget]);
  const tips = useMemo(() => hydrationTips(consumedLiters, dailyTarget), [consumedLiters, dailyTarget]);
  const progress = Math.min(100, Math.round((consumedLiters / Math.max(dailyTarget, 0.1)) * 100));

  useEffect(() => {
    try {
      const raw = localStorage.getItem('water_intake_records');
      if (raw) {
        setRecords(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Unable to read saved water records', e);
    }
  }, []);

  const saveDailyRecord = () => {
    setError('');
    if (consumedLiters <= 0) {
      setError('Enter a positive water intake value to save.');
      return;
    }

    const record: WaterRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      date: new Date().toLocaleDateString(),
      intakeLiters: Number(consumedLiters.toFixed(2)),
    };
    const updated = [record, ...records].slice(0, 20);
    setRecords(updated);
    localStorage.setItem('water_intake_records', JSON.stringify(updated));
  };

  const clearRecords = () => {
    setRecords([]);
    localStorage.removeItem('water_intake_records');
  };

  const saveCalculation = () => {
    addHistoryItem(
      'Water Intake Calculator',
      `Target ${dailyTarget} L, Consumed ${consumedLiters} L, Status ${currentStatus}`
    );
  };

  return (
    <div id="water-intake-calculator" className={`w-full max-w-5xl mx-auto rounded-3xl p-6 md:p-8 shadow-2xl ${cardStyle}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-3xl bg-gradient-to-br from-cyan-500 to-sky-600 shadow-lg">
            <Droplet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold">Water Intake Calculator</h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Daily hydration calculator based on weight, activity level and climate conditions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <section className="rounded-3xl border border-blue-900/20 bg-slate-950/10 p-6">
          <h3 className="text-lg font-bold mb-4">Personal Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Gender
              <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')} className={inputStyle}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Age
              <input
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                type="number"
                min="1"
                className={inputStyle}
                placeholder="28"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Weight (kg)
              <input
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                type="number"
                min="1"
                className={inputStyle}
                placeholder="62"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Height (cm)
              <input
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                type="number"
                min="1"
                className={inputStyle}
                placeholder="168"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/20 bg-slate-950/10 p-6">
          <h3 className="text-lg font-bold mb-4">Lifestyle Context</h3>
          <div className="grid gap-4">
            <label className="space-y-2 text-sm text-slate-300">
              Activity Level
              <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)} className={inputStyle}>
                {activityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Climate
              <select value={climate} onChange={(e) => setClimate(e.target.value as ClimateType)} className={inputStyle}>
                {climateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
      </div>

      {error && (
        <div className="mb-5 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-blue-900/20 bg-[#081126]/80 p-6 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Daily Target</p>
            <h3 className="text-3xl font-extrabold">{dailyTarget} L</h3>
            <p className="text-sm text-slate-400">Recommended daily water intake based on your profile.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-950/40 p-4 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-[0.18em]">Glasses</p>
              <p className="mt-2 text-2xl font-bold text-white">{totalGlasses}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/40 p-4 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-[0.18em]">Status</p>
              <p className="mt-2 text-2xl font-bold text-cyan-300">{currentStatus}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/40 p-4 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-[0.18em]">Current Intake</p>
              <p className="mt-2 text-2xl font-bold text-white">{consumedLiters.toFixed(2)} L</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="h-3 overflow-hidden rounded-full bg-slate-900">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500"
            />
          </div>
          <p className="mt-3 text-sm text-slate-400">Target progress: {progress}%</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <section className="rounded-3xl border border-blue-900/20 bg-slate-950/10 p-6">
          <h3 className="text-lg font-bold mb-4">Water Consumption Tracker</h3>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300">
              Today's Intake (Liters)
              <input
                value={consumedLiters}
                onChange={(e) => setConsumedLiters(Number(e.target.value))}
                type="number"
                min="0"
                step="0.1"
                className={inputStyle}
                placeholder="1.5"
              />
            </label>
            <button
              type="button"
              onClick={saveDailyRecord}
              className="inline-flex items-center gap-2 rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              <Save className="w-4 h-4" />
              Save Daily Record
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-blue-900/20 bg-slate-950/10 p-6">
          <h3 className="text-lg font-bold mb-4">Performance Notes</h3>
          <div className="space-y-3 text-sm text-slate-300">
            <p>Gender: <span className="font-semibold text-white">{gender}</span></p>
            <p>Age: <span className="font-semibold text-white">{age}</span></p>
            <p>Activity: <span className="font-semibold text-white">{activityOptions.find((item) => item.value === activityLevel)?.label}</span></p>
            <p>Climate: <span className="font-semibold text-white">{climateOptions.find((item) => item.value === climate)?.label}</span></p>
          </div>
        </section>
      </div>

      <div className="rounded-3xl border border-blue-900/20 bg-[#081126]/80 p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">Hydration Tips</h3>
        <ul className="space-y-3 text-sm text-slate-300">
          {tips.map((tip, index) => (
            <li key={index} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Tip {index + 1}</span>
              </div>
              <p>{tip}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-blue-900/20 bg-slate-950/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Saved Daily Records</h3>
          <button
            type="button"
            onClick={clearRecords}
            className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            <RefreshCcw className="w-4 h-4" />
            Clear Records
          </button>
        </div>
        {records.length === 0 ? (
          <p className="text-sm text-slate-400">No daily hydration records saved yet. Save a record to start tracking.</p>
        ) : (
          <div className="space-y-3">
            {records.slice(0, 5).map((record) => (
              <div key={record.id} className="rounded-3xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <span>{record.date}</span>
                  <span className="font-semibold text-white">{record.intakeLiters.toFixed(2)} L</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={saveCalculation}
        className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-95"
      >
        <Activity className="w-5 h-5" />
        Save Calculation to History
      </button>
    </div>
  );
}
