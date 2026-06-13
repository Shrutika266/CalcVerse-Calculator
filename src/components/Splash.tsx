import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Percent, Coins, Scale, Thermometer } from 'lucide-react';
import logoPath from '../../assets/calcverse.jpeg';

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 300);
          return 100;
        }
        return prev + 1; // Takes exactly 5 seconds (50ms * 100 steps)
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-50 select-none">
      <div className="absolute inset-0 bg-radial-gradient from-slate-900/40 to-slate-950 pointer-events-none" />

      {/* Hero logo showcase */}
      <div className="relative flex flex-col items-center justify-center mb-10">
        <motion.img
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          src={logoPath}
          alt="CalcVerse logo"
          className="w-36 h-36 md:w-44 md:h-44 rounded-3xl object-cover shadow-2xl shadow-indigo-600/30 border border-indigo-400/25 mb-6"
        />
        {/* Decorative icons removed as requested */}
      </div>

      {/* Text Info */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-5xl md:text-6xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-violet-500 to-indigo-700 font-sans text-center mb-5 uppercase drop-shadow-lg"
      >
        CALCVERSE
      </motion.h1>
      <motion.p
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 0.6 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-base md:text-lg text-slate-300 text-center mb-12 max-w-3xl"
      >
        Everything you need to calculate smarter-finance, health, conversions, measurements, and advanced mathematics, all in one place.
      </motion.p>

      {/* Slim progress bar */}
      <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 p-[1px]">
        <motion.div
          className="h-full bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
