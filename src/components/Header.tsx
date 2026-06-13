import { useEffect, useState } from 'react';
import { Sun, Moon, Volume2, VolumeX, Orbit } from 'lucide-react';
import { ActiveTab } from '../types';
import logoPath from '../../assets/calcverse.jpeg';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

export default function Header({ darkMode, toggleDarkMode, activeTab, setActiveTab, soundEnabled, toggleSound }: HeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const navItems = [
    { id: 'calc_std' as ActiveTab, label: 'Calculator' },
    { id: 'calc_sci' as ActiveTab, label: 'Scientific' },
    { id: 'home' as ActiveTab, label: '🏠 Home' },
    { id: 'history' as ActiveTab, label: 'History' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card-bg border-border-main/80 select-none shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-2 md:pb-1.5 flex flex-col items-center gap-2 md:gap-0.5">

        <div className="w-full flex items-center justify-between">
          {/* CalcVerse Brand Logo and Title */}
          <div 
            onClick={() => setActiveTab('calc_std')}
            className="flex items-center space-x-3 cursor-pointer hover:opacity-90 active:scale-98 transition-all"
          >
            <img
              src={logoPath}
              alt="CalcVerse logo"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl object-cover shadow-lg"
            />
            <div className="flex flex-col">
              <h2 className="text-[10px] sm:text-sm md:text-2xl font-extrabold leading-tight tracking-[0.12em] uppercase truncate max-w-30 sm:max-w-40 md:max-w-none text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 via-violet-500 to-indigo-700 drop-shadow-lg">
                CALCVERSE
              </h2>
              <span className="mt-1 text-[9px] md:text-xs font-bold px-2 py-0.5 rounded-md bg-brand-accent/20 text-brand-accent self-start">PRO</span>
            </div>
          </div>

          {/* Clock, Sound and Theme Switch Panel (top-right) */}
          <div className="flex items-center space-x-4 justify-end">
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right pr-2 min-w-20">
                <div className="tabular-nums font-extrabold text-xs md:text-base text-text-main leading-none tracking-wide">
                  {formatTime(time)}
                </div>
                <div className="text-[11px] font-bold text-text-dim/80 mt-1 leading-none">
                  {formatDate(time)}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button 
                  onClick={toggleSound}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    soundEnabled 
                      ? 'bg-brand-accent/10 border-brand-accent/30 text-brand-accent' 
                      : 'bg-card-bg hover:bg-card-hover border-border-main text-text-dim hover:text-text-main'
                  }`}
                  title={soundEnabled ? "Mute sound feedback" : "Unmute sound feedback"}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-text-mute" />
                  )}
                </button>

                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-xl bg-card-bg hover:bg-card-hover border border-border-main text-amber-500 transition-all cursor-pointer"
                  title="Toggle color mode"
                >
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500 animate-pulse" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Top-Most Navigation Bar - centered on its own line */}
        <nav className="w-full">
          <div className="flex justify-center">
            <div className="flex space-x-6 md:space-x-8 lg:space-x-10 flex-nowrap px-2">
            {navItems.map((item) => {
              const isCalcStdActive = activeTab === 'calc_std';
              const isCalcSciActive = activeTab === 'calc_sci';
              const isHomeActive = activeTab === 'home';
              const isHistoryActive = activeTab === 'history';

              let isActive = false;
              if (item.id === 'calc_std' && isCalcStdActive) isActive = true;
              else if (item.id === 'calc_sci' && isCalcSciActive) isActive = true;
              else if (item.id === 'home' && isHomeActive) isActive = true;
              else if (item.id === 'history' && isHistoryActive) isActive = true;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-2 md:py-1 px-2 md:px-0.5 text-xs md:text-base lg:text-lg font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-brand-accent'
                      : 'text-text-dim hover:text-text-main'
                  }`}
                  id={`top-nav-${item.id}`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-3.5 left-0 right-0 h-0.75 bg-brand-accent rounded-full animate-fade-in shadow-[0_-1px_6px_rgba(16,185,129,0.6)]" />
                  )}
                </button>
              );
            })}
            </div>
          </div>
        </nav>

      </div>
    </header>
  );
}
