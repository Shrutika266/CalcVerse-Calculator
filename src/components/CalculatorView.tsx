import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  RotateCcw, 
  History,
  Copy,
  Mic,
  Delete
} from 'lucide-react';
import { HistoryItem } from '../types';

interface CalculatorViewProps {
  initialScientific?: boolean;
  soundEnabled?: boolean;
}

// Adaptive styling classes for seamless Light / Dark mode visual transitions - Elegantly balanced rectangular sizing
const BTN_STD_NUM = "w-full h-full flex items-center justify-center font-medium text-lg md:text-xl bg-btn-num-bg text-btn-num-text hover:bg-btn-num-hover border border-border-main/50 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer shadow-sm focus:outline-none";
const BTN_STD_OP = "w-full h-full flex items-center justify-center font-semibold text-xl md:text-2xl bg-btn-op-bg text-btn-op-text hover:bg-btn-op-hover border border-[#c7d2fe]/35 dark:border-border-main/50 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer shadow-sm focus:outline-none";
const BTN_STD_ACTION = "w-full h-full flex items-center justify-center font-semibold text-lg md:text-xl bg-btn-action-bg text-btn-action-text hover:bg-btn-action-hover border border-border-main/50 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer shadow-sm focus:outline-none";
const BTN_STD_UTIL = "w-full h-full flex items-center justify-center font-medium text-sm md:text-base bg-btn-util-bg text-btn-util-text hover:bg-btn-util-hover border border-[#ddd6fe]/30 dark:border-border-main/40 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer shadow-xs focus:outline-none";

const BTN_SCI_KEY = "w-full h-full flex items-center justify-center font-normal text-xs md:text-sm bg-btn-util-bg text-btn-util-text hover:bg-btn-util-hover border border-[#ddd6fe]/30 dark:border-border-main/30 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer text-center focus:outline-none shadow-xs";
const BTN_SCI_NUM = "w-full h-full flex items-center justify-center font-medium text-sm md:text-base bg-btn-num-bg text-btn-num-text hover:bg-btn-num-hover border border-border-main/50 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer shadow-xs focus:outline-none";
const BTN_SCI_OP = "w-full h-full flex items-center justify-center font-semibold text-sm md:text-base bg-btn-op-bg text-btn-op-text hover:bg-btn-op-hover border border-[#c7d2fe]/35 dark:border-border-main/50 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer shadow-xs text-center focus:outline-none";
const BTN_SCI_ACTION = "w-full h-full flex items-center justify-center font-semibold text-xs md:text-sm bg-btn-action-bg text-btn-action-text hover:bg-btn-action-hover border border-border-main/40 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none shadow-xs";

export default function CalculatorView({ initialScientific = false, soundEnabled = true }: CalculatorViewProps) {
  const [isScientific] = useState(initialScientific);
  const [display, setDisplay] = useState('');
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [isRadian, setIsRadian] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isError, setIsError] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const displayEndRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);
  const activeRecognitionRef = useRef<any>(null);

  // Sound play oscillator synthesizer for real button click feedback
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(380, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.06); 

      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.06);
    } catch (err) {
      console.error('Audio synthesizer feedback error', err);
    }
  };

  // Robust client-side Google Chrome and web Speech Recognition handler 
  const startSpeechRecognition = () => {
    playBeep();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const msg = "Voice recognition error: Web Speech API unsupported in this browser frame. Open in a new tab to run.";
      setDisplay(msg);
      setIsError(true);
      return;
    }

    if (isRecording && activeRecognitionRef.current) {
      try {
        activeRecognitionRef.current.stop();
      } catch (err) {}
      setIsRecording(false);
      return;
    }

    const rec = new SpeechRecognition();
    activeRecognitionRef.current = rec;
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsRecording(true);
    };

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      if (resultText) {
        let parsedText = resultText.toLowerCase();

        // Map spoken digits to numbers to solve word detection issues
        parsedText = parsedText
          .replace(/\bzero\b/g, '0')
          .replace(/\bone\b/g, '1')
          .replace(/\btwo\b/g, '2')
          .replace(/\bthree\b/g, '3')
          .replace(/\bfour\b/g, '4')
          .replace(/\bfive\b/g, '5')
          .replace(/\bsix\b/g, '6')
          .replace(/\bseven\b/g, '7')
          .replace(/\beight\b/g, '8')
          .replace(/\bnine\b/g, '9');

        // Map spoken operations to calculator chars
        parsedText = parsedText
          .replace(/\bplus\b/g, '+')
          .replace(/\band\b/g, '+')
          .replace(/\badd\b/g, '+')
          .replace(/\bminus\b/g, '−')
          .replace(/\bsubtract\b/g, '−')
          .replace(/\bless\b/g, '−')
          .replace(/\btimes\b/g, '×')
          .replace(/\bmultiplied\b/g, '×')
          .replace(/\bmultiply\b/g, '×')
          .replace(/\binto\b/g, '×')
          .replace(/\bdivided\b/g, '÷')
          .replace(/\bdivide\b/g, '÷')
          .replace(/\bover\b/g, '÷')
          .replace(/\bby\b/g, '')
          .replace(/\bpercent\b/g, '%')
          .replace(/\bpoint\b/g, '.')
          .replace(/\bdot\b/g, '.')
          .replace(/\bopen bracket\b/g, '(')
          .replace(/\bclose bracket\b/g, ')')
          .replace(/\bparenthesis\b/g, '(')
          .replace(/\*/g, '×')
          .replace(/\//g, '÷')
          .replace(/-/g, '−');

        let cleanExpr = '';
        for (let i = 0; i < parsedText.length; i++) {
          const char = parsedText[i];
          if (/[0-9.−+×÷%()^-]/.test(char)) {
            // Normalize standard minus right away
            if (char === '-') {
              cleanExpr += '−';
            } else {
              cleanExpr += char;
            }
          }
        }

        if (cleanExpr) {
          if (isError) {
            setDisplay(cleanExpr);
            setIsError(false);
          } else {
            setDisplay((prev) => prev + cleanExpr);
          }
          if (parsedText.includes('equal') || parsedText.includes('calculate') || parsedText.includes('result') || parsedText.includes('is')) {
            setTimeout(() => {
              calculateResult();
            }, 100);
          }
        }
      }
    };

    rec.onerror = (err: any) => {
      console.error('Speech recognition error', err);
      setIsRecording(false);
      if (err.error === 'not-allowed') {
        setDisplay("Mic permission blocked: Grant access in browser or open in a new tab.");
        setIsError(true);
      }
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    try {
      rec.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  // Cleanup effect for active voice instances on unmount
  useEffect(() => {
    return () => {
      if (activeRecognitionRef.current) {
        try {
          activeRecognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Load History from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('omnicalc_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('omnicalc_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const key = e.key;
      if (/[0-9]/.test(key)) {
        appendChar(key);
      } else if (key === '.') {
        appendChar('.');
      } else if (key === '+') {
        appendChar('+');
      } else if (key === '-') {
        appendChar('−');
      } else if (key === '*') {
        appendChar('×');
      } else if (key === '/') {
        appendChar('÷');
      } else if (key === '(' || key === ')') {
        appendChar(key);
      } else if (key === '^') {
        appendChar('^');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculateResult();
      } else if (key === 'Backspace') {
        deleteLast();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, isRadian]);

  // Auto scroll
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (displayEndRef.current && display) {
      displayEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [display]);

  const clearAll = () => {
    playBeep();
    setDisplay('');
    setLastResult(null);
    setIsError(false);
  };

  const deleteLast = () => {
    playBeep();
    if (isError) {
      clearAll();
      return;
    }
    // Delete functions or single char recursively
    const words = [
      'asin(', 'acos(', 'atan(', 'log2(', 'cbrt(', 'sqrt(', 'log(', 'abs(', 'exp(', 'sin(', 'cos(', 'tan(', 'ln('
    ];
    for (const word of words) {
      if (display.endsWith(word)) {
        setDisplay(display.slice(0, -word.length));
        return;
      }
    }
    if (display.length > 0) {
      setDisplay(display.slice(0, -1));
    }
  };

  const appendChar = (char: string) => {
    playBeep();
    if (isError) {
      clearAll();
    }
    setDisplay((prev) => prev + char);
  };

  const appendFunc = (func: string) => {
    playBeep();
    if (isError) {
      clearAll();
    }
    setDisplay((prev) => prev + func + '(');
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n > 170) return Infinity; // prevent overflow
    if (n === 0 || n === 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  };

  const calculateResult = () => {
    playBeep();
    if (!display.trim()) return;

    try {
      // Evaluate expression using scoped math functions for safety and reliability
      let raw = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**');

      // Recursively replace factorial matches
      raw = raw.replace(/(\d+)!/g, (_, num) => {
        return `fact(${num})`;
      });

      // Declare mathematical context functions to evaluate gracefully
      const sin = (x: number) => Math.sin(isRadian ? x : (x * Math.PI) / 180);
      const cos = (x: number) => Math.cos(isRadian ? x : (x * Math.PI) / 180);
      const tan = (x: number) => Math.tan(isRadian ? x : (x * Math.PI) / 180);
      const asin = (x: number) => isRadian ? Math.asin(x) : (Math.asin(x) * 180) / Math.PI;
      const acos = (x: number) => isRadian ? Math.acos(x) : (Math.acos(x) * 180) / Math.PI;
      const atan = (x: number) => isRadian ? Math.atan(x) : (Math.atan(x) * 180) / Math.PI;
      const sqrt = (x: number) => Math.sqrt(x);
      const cbrt = (x: number) => Math.cbrt(x);
      const exp = (x: number) => Math.exp(x);
      const abs = (x: number) => Math.abs(x);
      const log1e = (x: number) => Math.log10(x); // alias log
      const log2 = (x: number) => Math.log2(x);
      const ln = (x: number) => Math.log(x);
      const fact = (n: number) => factorial(n);

      // Create runner compiler context
      const runner = new Function(
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 
        'sqrt', 'cbrt', 'exp', 'abs', 'log', 'log2', 'ln', 'fact', 
        `return (${raw})`
      );

      const evaluated = runner(
        sin, cos, tan, asin, acos, atan, 
        sqrt, cbrt, exp, abs, log1e, log2, ln, fact
      );

      if (isNaN(evaluated) || !isFinite(evaluated)) {
        setIsError(true);
        setDisplay('Error');
        return;
      }

      // Format output nicely
      const finalRes = Number(evaluated.toFixed(8)).toString();
      setLastResult(finalRes);

      // Add to session history
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        expression: display,
        result: finalRes,
        timestamp,
      };

      saveHistory([newHistoryItem, ...history]);
      setDisplay(finalRes);
    } catch (err) {
      setIsError(true);
      setDisplay('Error');
    }
  };

  const computeRealTimeResult = (): string => {
    if (!display.trim() || isError || display === 'Error') return '';
    if (/[+−×÷(^]$/.test(display)) return '';

    try {
      let raw = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**');

      raw = raw.replace(/(\d+)!/g, (_, num) => {
        return `fact(${num})`;
      });

      const sin = (x: number) => Math.sin(isRadian ? x : (x * Math.PI) / 180);
      const cos = (x: number) => Math.cos(isRadian ? x : (x * Math.PI) / 180);
      const tan = (x: number) => Math.tan(isRadian ? x : (x * Math.PI) / 180);
      const asin = (x: number) => isRadian ? Math.asin(x) : (Math.asin(x) * 180) / Math.PI;
      const acos = (x: number) => isRadian ? Math.acos(x) : (Math.acos(x) * 180) / Math.PI;
      const atan = (x: number) => isRadian ? Math.atan(x) : (Math.atan(x) * 180) / Math.PI;
      const sqrt = (x: number) => Math.sqrt(x);
      const cbrt = (x: number) => Math.cbrt(x);
      const exp = (x: number) => Math.exp(x);
      const abs = (x: number) => Math.abs(x);
      const log1e = (x: number) => Math.log10(x);
      const log2 = (x: number) => Math.log2(x);
      const ln = (x: number) => Math.log(x);
      const fact = (n: number) => factorial(n);

      const runner = new Function(
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 
        'sqrt', 'cbrt', 'exp', 'abs', 'log', 'log2', 'ln', 'fact', 
        `return (${raw})`
      );

      const evaluated = runner(
        sin, cos, tan, asin, acos, atan, 
        sqrt, cbrt, exp, abs, log1e, log2, ln, fact
      );

      if (isNaN(evaluated) || !isFinite(evaluated)) return '';
      return Number(evaluated.toFixed(6)).toString();
    } catch {
      return '';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(display || '0');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const speakDisplayState = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(true);
      const text = display === 'Error' ? 'Error' : (display || '0');
      const readable = text
        .replace(/×/g, ' multiplied by ')
        .replace(/÷/g, ' divided by ')
        .replace(/−/g, ' minus ')
        .replace(/\+/g, ' plus ')
        .replace(/\^/g, ' to the power ');
      const utterance = new SpeechSynthesisUtterance(readable);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Memory keys handlers
  const handleMC = () => {
    playBeep();
    setMemory(0);
  };

  const handleMR = () => {
    playBeep();
    if (isError) clearAll();
    setDisplay((prev) => prev + memory.toString());
  };

  const handleMPlus = () => {
    playBeep();
    try {
      const currentVal = eval(
        display
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
      );
      if (!isNaN(currentVal) && isFinite(currentVal)) {
        setMemory((prev) => prev + currentVal);
      }
    } catch {}
  };

  const handleMMinus = () => {
    playBeep();
    try {
      const currentVal = eval(
        display
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
      );
      if (!isNaN(currentVal) && isFinite(currentVal)) {
        setMemory((prev) => prev - currentVal);
      }
    } catch {}
  };

  const handleSignToggle = () => {
    playBeep();
    if (!display || display === 'Error') return;
    if (display.startsWith('-')) {
      setDisplay(display.substring(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const realTimeRes = computeRealTimeResult();

  const wrapperMaxWidth = showHistory
    ? 'max-w-6xl'
    : 'max-w-[500px]';

  return (
    <div className="w-full flex justify-center items-center py-2 md:py-4 bg-transparent">
      <div className={`w-full flex flex-col xl:flex-row items-center xl:items-start justify-center gap-6 lg:gap-8 transition-all duration-300 ${wrapperMaxWidth}`}>
        
        {/* Main Calculator Body */}
        <div 
          className="bg-card-bg rounded-xl border border-border-main shadow-2xl overflow-hidden flex flex-col transition-all duration-300 relative select-none"
          style={{ width: '478.4px', height: '766.31px', maxWidth: '100%' }}
        >
          
          {/* Screens: expression & result with cosmic ambient look */}
          <div 
            className="bg-canvas-bg dark:bg-card-bg p-5 flex flex-col justify-between text-right border-b border-border-main select-none relative overflow-hidden transition-colors duration-300"
            style={{ height: '180px', minHeight: '180px' }}
          >
          
          {/* Subtle grid background for high fidelity terminal vibe */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98103_1px,transparent_1px),linear-gradient(to_bottom,#10b98103_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none" />

          {/* Top Line indicating angular standard (DEG/RAD) */}
          <div className="flex justify-between items-center z-10 select-none">
            <button 
              onClick={() => {
                if (isScientific) {
                  playBeep();
                  setIsRadian(!isRadian);
                }
              }}
              disabled={!isScientific}
              className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md border transition-all ${
                isScientific 
                  ? 'bg-card-bg border-border-main text-brand-accent hover:border-brand-accent/50 cursor-pointer' 
                  : 'bg-transparent border-transparent text-text-dim/60 opacity-60 cursor-not-allowed'
              }`}
            >
              {isScientific ? (isRadian ? 'RAD' : 'DEG') : 'DEG'}
            </button>
            <div className="w-2" />
          </div>

          <div className="w-full text-text-dim font-mono text-sm overflow-x-auto whitespace-nowrap scrollbar-none py-1.5 leading-none z-10 transition-all mt-4 select-text">
            {display || '0'}
            <span className="text-brand-accent animate-pulse font-normal">|</span>
            <div ref={displayEndRef} />
          </div>

          <div className="flex items-center justify-between mt-1 z-10 select-none">
            {/* Left aligned widgets inside screens: Copy & Voice */}
            <div className="flex space-x-2 select-none">
              <button 
                onClick={copyToClipboard}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`py-1 px-2.5 rounded-lg font-bold text-[10px] flex items-center space-x-1.5 bg-card-bg border transition-all cursor-pointer group select-none ${
                  copied 
                    ? 'text-brand-accent border-brand-accent/30 bg-brand-accent/10' 
                    : 'text-text-dim border-border-main hover:text-text-main hover:bg-card-hover'
                }`}
              >
                <Copy className="w-3 h-3 text-text-dim/60 group-hover:text-brand-accent transition-colors select-none" />
                <span className="select-none">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button 
                onClick={startSpeechRecognition}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`py-1 px-2.5 rounded-lg font-bold text-[10px] flex items-center space-x-1.5 border transition-all cursor-pointer group select-none ${
                  isRecording 
                    ? 'text-red-400 bg-red-400/10 border-red-500/30 animate-pulse' 
                    : 'text-text-dim bg-card-bg border-border-main hover:text-text-main hover:bg-card-hover'
                }`}
                title="Speak to insert math expressions like '899 plus 445'"
              >
                <Mic className={`w-3 h-3 transition-colors select-none ${isRecording ? 'text-red-400' : 'text-text-dim/60 group-hover:text-brand-accent'}`} />
                <span className="select-none">{isRecording ? 'Listening...' : 'Voice Rec'}</span>
              </button>
            </div>

            <div className="flex items-center select-text">
              <AnimatePresence>
                {realTimeRes && display !== realTimeRes && (
                  <motion.span
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 0.5, y: 0 }}
                     exit={{ opacity: 0 }}
                     className="text-sm text-text-dim font-mono italic pr-3 opacity-60 select-none"
                  >
                     ={realTimeRes}
                  </motion.span>
                )}
              </AnimatePresence>

              <span className="text-4xl font-black font-mono tracking-tight text-text-main transition-all overflow-x-auto whitespace-nowrap scrollbar-none leading-none select-text font-sans">
                {display === 'Error' ? (
                  <span className="text-red-500 font-sans">Error</span>
                ) : (
                  display || '0'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="p-4 bg-transparent flex flex-col select-none flex-1 overflow-hidden" h-id="calc-buttons-container">
          
          {/* Scientific Mode Panel Keyboard Grid (5 Cols) */}
          {isScientific ? (
            <div 
              id="scientific-grid"
              className="select-none h-full w-full"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(9, minmax(0, 1fr))',
                gap: '8px',
                height: '100%',
                width: '100%'
              }}
            >
              {/* Row 1 */}
              <button id="btn-sin" onClick={() => appendFunc('sin')} className={BTN_SCI_KEY}>sin</button>
              <button id="btn-cos" onClick={() => appendFunc('cos')} className={BTN_SCI_KEY}>cos</button>
              <button id="btn-tan" onClick={() => appendFunc('tan')} className={BTN_SCI_KEY}>tan</button>
              <button id="btn-log" onClick={() => appendFunc('log')} className={BTN_SCI_KEY}>log</button>
              <button id="btn-ln" onClick={() => appendFunc('ln')} className={BTN_SCI_KEY}>ln</button>

              {/* Row 2 */}
              <button id="btn-asin" onClick={() => appendFunc('asin')} className={BTN_SCI_KEY}>sin⁻¹</button>
              <button id="btn-acos" onClick={() => appendFunc('acos')} className={BTN_SCI_KEY}>cos⁻¹</button>
              <button id="btn-atan" onClick={() => appendFunc('atan')} className={BTN_SCI_KEY}>tan⁻¹</button>
              <button id="btn-log2" onClick={() => appendFunc('log2')} className={BTN_SCI_KEY}>log₂</button>
              <button id="btn-exp" onClick={() => appendFunc('exp')} className={BTN_SCI_KEY}>eˣ</button>

              {/* Row 3 */}
              <button id="btn-sqrt" onClick={() => appendFunc('sqrt')} className={BTN_SCI_KEY}>√x</button>
              <button id="btn-cbrt" onClick={() => appendFunc('cbrt')} className={BTN_SCI_KEY}>∛x</button>
              <button id="btn-x2" onClick={() => appendChar('^2')} className={BTN_SCI_KEY}>x²</button>
              <button id="btn-x3" onClick={() => appendChar('^3')} className={BTN_SCI_KEY}>x³</button>
              <button id="btn-fact" onClick={() => appendChar('!')} className={BTN_SCI_KEY}>n!</button>

              {/* Row 4 */}
              <button id="btn-pi" onClick={() => appendChar('π')} className={BTN_SCI_KEY}>π</button>
              <button id="btn-e" onClick={() => appendChar('e')} className={BTN_SCI_KEY}>e</button>
              <button id="btn-pow" onClick={() => appendChar('^')} className={BTN_SCI_KEY}>xʸ</button>
              <button id="btn-recip" onClick={() => appendChar('1/')} className={BTN_SCI_KEY}>1/x</button>
              <button id="btn-abs" onClick={() => appendFunc('abs')} className={BTN_SCI_KEY}>|x|</button>

              {/* Row 5 */}
              <button id="btn-sci-ac" onClick={clearAll} className={BTN_SCI_ACTION}>AC</button>
              <button id="btn-sci-pm" onClick={handleSignToggle} className={BTN_SCI_ACTION}>±</button>
              <button id="btn-sci-pct" onClick={() => appendChar('%')} className={BTN_SCI_ACTION}>%</button>
              <button id="btn-sci-div" onClick={() => appendChar('÷')} className={BTN_SCI_OP}>÷</button>
              <button id="btn-sci-del" onClick={deleteLast} className={BTN_SCI_ACTION}>
                <Delete className="w-4 h-4" />
              </button>

              {/* Row 6 */}
              <button id="btn-sci-7" onClick={() => appendChar('7')} className={BTN_SCI_NUM}>7</button>
              <button id="btn-sci-8" onClick={() => appendChar('8')} className={BTN_SCI_NUM}>8</button>
              <button id="btn-sci-9" onClick={() => appendChar('9')} className={BTN_SCI_NUM}>9</button>
              <button id="btn-sci-mul" onClick={() => appendChar('×')} className={BTN_SCI_OP}>×</button>
              <button id="btn-sci-lparen" onClick={() => appendChar('(')} className={BTN_SCI_NUM + " !font-bold"}>(</button>

              {/* Row 7 */}
              <button id="btn-sci-4" onClick={() => appendChar('4')} className={BTN_SCI_NUM}>4</button>
              <button id="btn-sci-5" onClick={() => appendChar('5')} className={BTN_SCI_NUM}>5</button>
              <button id="btn-sci-6" onClick={() => appendChar('6')} className={BTN_SCI_NUM}>6</button>
              <button id="btn-sci-sub" onClick={() => appendChar('−')} className={BTN_SCI_OP}>−</button>
              <button id="btn-sci-rparen" onClick={() => appendChar(')')} className={BTN_SCI_NUM + " !font-bold"}>)</button>

              {/* Rows 8 & 9 combined */}
              <button id="btn-sci-1" onClick={() => appendChar('1')} className={BTN_SCI_NUM}>1</button>
              <button id="btn-sci-2" onClick={() => appendChar('2')} className={BTN_SCI_NUM}>2</button>
              <button id="btn-sci-3" onClick={() => appendChar('3')} className={BTN_SCI_NUM}>3</button>
              <button id="btn-sci-add" onClick={() => appendChar('+')} className={BTN_SCI_OP}>+</button>
              
              {/* Vertical span-2 equals button taking full height */}
              <button 
                id="btn-sci-eq"
                onClick={calculateResult} 
                className="row-span-2 bg-btn-eq-bg hover:opacity-95 active:scale-98 text-btn-eq-text border border-btn-eq-border font-semibold text-lg md:text-xl rounded-lg flex items-center justify-center transition-all shadow-md dark:shadow-[0_4px_10px_rgba(129,140,248,0.15)] cursor-pointer focus:outline-none h-full w-full py-0 self-stretch"
              >
                =
              </button>

              {/* Row 9 */}
              <button id="btn-sci-0" onClick={() => appendChar('0')} className="col-span-2 text-center font-medium text-sm md:text-base lg:text-lg bg-btn-num-bg text-btn-num-text hover:bg-btn-num-hover border border-border-main/50 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer shadow-xs focus:outline-none w-full h-full flex items-center justify-center">0</button>
              <button id="btn-sci-dot" onClick={() => appendChar('.')} className={BTN_SCI_NUM}>.</button>
              <button id="btn-sci-pow-y" onClick={() => appendChar('^')} className={BTN_SCI_OP}>^</button>
            </div>
          ) : (
            /* Standard Mode Panel Keyboard Grid (4 Cols) */
            <div 
              id="standard-grid"
              className="select-none h-full w-full"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
                gap: '8px',
                height: '100%',
                width: '100%'
              }}
            >
              {/* Row 1 - Memory Buttons Row */}
              <button id="btn-mc" onClick={handleMC} className="rounded-lg border border-border-main/40 bg-btn-op-bg hover:bg-btn-op-hover text-xs font-semibold tracking-wider text-btn-op-text transition-all cursor-pointer focus:outline-none w-full h-full flex items-center justify-center">MC</button>
              <button id="btn-mr" onClick={handleMR} className="rounded-lg border border-border-main/40 bg-btn-op-bg hover:bg-btn-op-hover text-xs font-semibold tracking-wider text-btn-op-text transition-all cursor-pointer focus:outline-none w-full h-full flex items-center justify-center">MR</button>
              <button id="btn-mplus" onClick={handleMPlus} className="rounded-lg border border-border-main/40 bg-btn-op-bg hover:bg-btn-op-hover text-xs font-semibold tracking-wider text-btn-op-text transition-all cursor-pointer focus:outline-none w-full h-full flex items-center justify-center">M+</button>
              <button id="btn-mminus" onClick={handleMMinus} className="rounded-lg border border-border-main/40 bg-btn-op-bg hover:bg-btn-op-hover text-xs font-semibold tracking-wider text-btn-op-text transition-all cursor-pointer focus:outline-none w-full h-full flex items-center justify-center">M-</button>

              {/* Row 2 */}
              <button id="btn-ac" onClick={clearAll} className={BTN_STD_ACTION}>AC</button>
              <button id="btn-pm" onClick={handleSignToggle} className={BTN_STD_ACTION}>±</button>
              <button id="btn-pct" onClick={() => appendChar('%')} className={BTN_STD_ACTION}>%</button>
              <button id="btn-div" onClick={() => appendChar('÷')} className={BTN_STD_OP}>÷</button>

              {/* Row 3 */}
              <button id="btn-7" onClick={() => appendChar('7')} className={BTN_STD_NUM}>7</button>
              <button id="btn-8" onClick={() => appendChar('8')} className={BTN_STD_NUM}>8</button>
              <button id="btn-9" onClick={() => appendChar('9')} className={BTN_STD_NUM}>9</button>
              <button id="btn-mul" onClick={() => appendChar('×')} className={BTN_STD_OP}>×</button>

              {/* Row 4 */}
              <button id="btn-4" onClick={() => appendChar('4')} className={BTN_STD_NUM}>4</button>
              <button id="btn-5" onClick={() => appendChar('5')} className={BTN_STD_NUM}>5</button>
              <button id="btn-6" onClick={() => appendChar('6')} className={BTN_STD_NUM}>6</button>
              <button id="btn-sub" onClick={() => appendChar('−')} className={BTN_STD_OP}>−</button>

              {/* Row 5 */}
              <button id="btn-1" onClick={() => appendChar('1')} className={BTN_STD_NUM}>1</button>
              <button id="btn-2" onClick={() => appendChar('2')} className={BTN_STD_NUM}>2</button>
              <button id="btn-3" onClick={() => appendChar('3')} className={BTN_STD_NUM}>3</button>
              <button id="btn-add" onClick={() => appendChar('+')} className={BTN_STD_OP}>+</button>

              {/* Row 6 */}
              <button id="btn-0" onClick={() => appendChar('0')} className="col-span-2 text-center font-medium text-lg md:text-xl bg-btn-num-bg text-btn-num-text hover:bg-btn-num-hover border border-border-main/50 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer shadow-sm focus:outline-none w-full h-full flex items-center justify-center">0</button>
              <button id="btn-dot" onClick={() => appendChar('.')} className={BTN_STD_NUM}>.</button>
              <button id="btn-eq" onClick={calculateResult} className="text-center font-semibold text-xl md:text-2xl bg-btn-eq-bg hover:opacity-95 text-btn-eq-text border border-btn-eq-border rounded-lg transition-all duration-200 active:scale-95 cursor-pointer shadow-[0_4px_10px_rgba(99,102,241,0.25)] dark:shadow-[0_4px_10px_rgba(129,140,248,0.15)] w-full h-full flex items-center justify-center">=</button>

              {/* Row 7 */}
              <button id="btn-del" onClick={deleteLast} className={BTN_STD_UTIL + " flex items-center justify-center text-[#6366f1] dark:text-brand-accent"}>
                <Delete className="w-4 h-4 mr-1 text-[#6366f1] dark:text-brand-primary" />
                <span>Del</span>
              </button>
              <button id="btn-sqrt" onClick={() => appendFunc('sqrt')} className={BTN_STD_UTIL}>√</button>
              <button id="btn-sq" onClick={() => appendChar('^2')} className={BTN_STD_UTIL}>x²</button>
              <button id="btn-pow" onClick={() => appendChar('^')} className={BTN_STD_UTIL}>xʸ</button>
            </div>
          )}
        </div>
      </div>

      {/* History Side Log Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full xl:w-96 bg-card-bg rounded-xl border border-border-main p-5 shadow-2xl flex flex-col h-auto max-h-[750px]"
          >
            <div className="flex items-center justify-between border-b border-border-main pb-3 mb-4">
              <span className="font-bold text-text-main flex items-center space-x-2 text-xs uppercase tracking-wider">
                <History className="w-4 h-4 text-brand-accent" />
                <span>Session History</span>
              </span>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="p-1 px-2.5 rounded-lg border border-red-500/10 text-red-400 bg-red-400/5 hover:bg-red-400/10 text-[10px] tracking-wide uppercase font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {history.length === 0 ? (
                <div className="text-center py-12 text-text-dim/60 text-xs font-medium">
                  <RotateCcw className="w-7 h-7 mx-auto stroke-1 mb-2 text-text-dim/30" />
                  No calculation history yet
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setDisplay(item.expression);
                      setLastResult(item.result);
                      setIsError(false);
                    }}
                    className="w-full text-right p-3.5 rounded-2xl bg-canvas-bg/60 hover:bg-card-hover border border-border-main transition-colors cursor-pointer group flex flex-col items-end"
                  >
                    <span className="text-xs text-text-dim font-mono line-clamp-1 group-hover:text-brand-accent mb-1 transition-colors">
                      {item.expression}
                    </span>
                    <span className="text-base font-black font-mono text-text-main leading-tight">
                      = {item.result}
                    </span>
                    <span className="text-[9px] text-text-dim font-bold mt-1 uppercase tracking-wider font-sans">
                      {item.timestamp}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
