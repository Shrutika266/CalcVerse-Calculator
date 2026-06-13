import { useState, useEffect } from 'react';
import Splash from './components/Splash';
import Header from './components/Header';
import Navbar from './components/Navbar';
import CalculatorView from './components/CalculatorView';
import Converters from './components/Converters';
import HistoryDashboard from './components/HistoryDashboard';
import { ActiveTab } from './types';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('calc_std');
  const [prevTab, setPrevTab] = useState<ActiveTab | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('omnicalc_theme');
      if (savedTheme) {
        setDarkMode(savedTheme === 'dark');
      }

      const savedSound = localStorage.getItem('calcverse_sound');
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    try {
      localStorage.setItem('omnicalc_theme', darkMode ? 'dark' : 'light');
    } catch (e) {
      console.error(e);
    }
  }, [darkMode]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
  }, [activeTab]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const newVal = !prev;
      try {
        localStorage.setItem('calcverse_sound', String(newVal));
      } catch (err) {}
      return newVal;
    });
  };

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen pt-20 bg-canvas-bg text-text-main flex flex-col font-sans transition-colors duration-300 antialiased">
      <Header
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setPrevTab(activeTab);
          setActiveTab(tab);
        }}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
      />

      <main className="flex-1 flex flex-col justify-center">
        {activeTab !== 'calc_std' &&
          activeTab !== 'calc_sci' &&
          activeTab !== 'history' && (
            <Navbar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setPrevTab(activeTab);
                setActiveTab(tab);
              }}
              prevTab={prevTab}
            />
          )}

        <div
          className={`flex-1 w-full mx-auto pb-12 transition-all duration-300 flex flex-col justify-center items-center ${
            activeTab === 'calc_std' || activeTab === 'calc_sci'
              ? 'max-w-none px-4 md:px-8 lg:px-12'
              : 'max-w-7xl px-4 md:px-6'
          }`}
        >
          {activeTab === 'calc_std' && (
            <CalculatorView
              initialScientific={false}
              soundEnabled={soundEnabled}
            />
          )}

          {activeTab === 'calc_sci' && (
            <CalculatorView
              initialScientific={true}
              soundEnabled={soundEnabled}
            />
          )}

          {activeTab === 'history' && <HistoryDashboard />}

          {activeTab !== 'home' &&
            activeTab !== 'calc_std' &&
            activeTab !== 'calc_sci' &&
            activeTab !== 'history' && (
              <Converters activeTab={activeTab} darkMode={darkMode} />
            )}
        </div>
      </main>

      <footer className="py-6 text-center border-t border-border-main/50 bg-card-bg text-[11px] font-semibold text-text-dim tracking-wider uppercase select-none">
        <div>CalcVerse Pro Suite • Local Session Protected</div>
      </footer>
    </div>
  );
}