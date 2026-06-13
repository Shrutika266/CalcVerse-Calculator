import { useState, useEffect } from 'react';
import { Trash2, Copy, Check, Calendar, Search, ArrowLeft, Calculator } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDashboardProps {
  onSelectEquation?: (eq: string) => void;
}

export default function HistoryDashboard({ onSelectEquation }: HistoryDashboardProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('omnicalc_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.error('Failed to load calculation history', e);
    }
  };

  const deleteItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem('omnicalc_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete history item', e);
    }
  };

  const clearAllHistory = () => {
    setShowConfirmClear(true);
  };

  const confirmClearHistory = () => {
    setShowConfirmClear(false);
    setHistory([]);
    try {
      localStorage.setItem('omnicalc_history', JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  };

  const cancelClearHistory = () => {
    setShowConfirmClear(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

  const filteredHistory = history.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.expression.toLowerCase().includes(query) ||
      item.result.toLowerCase().includes(query) ||
      (item.timestamp && item.timestamp.toLowerCase().includes(query))
    );
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6" id="history-manager-panel">
      {/* Title block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest bg-brand-primary-bg px-2.5 py-1 rounded-full mb-1 inline-block">
            Archived logs
          </span>
          <h2 className="text-2xl font-extrabold text-text-main tracking-tight">
            Calculation History
          </h2>
          <p className="text-xs text-text-dim">
            View, filter, and management panel for previous calculations
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {history.length > 0 && (
            <button
              onClick={clearAllHistory}
              className="flex items-center justify-center space-x-1.5 py-2 px-3.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/20 hover:border-transparent text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              id="clear-all-history-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All History</span>
            </button>
          )}
          {/* Back to Hub button removed per UX update; use header nav to return */}
        </div>
      </div>

      {/* Grid Filter Options */}
      <div className="bg-card-bg border border-border-main rounded-2xl p-4.5 mb-6 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-mute" />
          <input
            type="text"
            placeholder="Search equations, operations or results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-canvas-bg border border-border-main text-text-main placeholder-text-mute text-sm rounded-xl focus:outline-none focus:ring-1.5 focus:ring-brand-primary transition-all font-medium"
            id="history-search-input"
          />
        </div>

        <div className="text-xs text-text-dim whitespace-nowrap font-semibold">
          Showing {filteredHistory.length} of {history.length} operations
        </div>
      </div>

      {/* Main calculation record lists */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-card-bg border border-border-main p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-text-main mb-3">Do you really want to clear all history?</h3>
            <p className="text-sm text-text-dim mb-6">This will permanently remove all saved calculation logs. This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={cancelClearHistory}
                className="px-4 py-2 rounded-xl border border-border-main bg-card-bg text-text-main hover:bg-card-hover transition-all"
              >
                No
              </button>
              <button
                onClick={confirmClearHistory}
                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                Yes, clear
              </button>
            </div>
          </div>
        </div>
      )}
      {filteredHistory.length === 0 ? (
        <div className="bg-card-bg border border-border-main/70 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-brand-primary-bg rounded-2xl flex items-center justify-center text-brand-primary mb-4 opacity-80">
            <Calculator className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-text-main mb-1">
            {history.length === 0 ? 'No calculation history' : 'No matching results'}
          </h3>
          <p className="text-xs text-text-dim max-w-sm mx-auto leading-relaxed mb-4">
            {history.length === 0 
              ? 'Calculations performed in Standard or Scientific calculator modes are securely logged locally in your current session.' 
              : 'Try refining your filter search terms or perform additional calculations in the core modes to see record logs.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="group relative bg-card-bg border border-border-main hover:border-brand-primary/40 rounded-2xl p-4.5 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              id={`history-item-row-${item.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2.5 mb-2">
                  <span className="text-[10px] uppercase font-bold text-brand-primary tracking-wider flex items-center bg-brand-primary-bg px-2 py-0.5 rounded-md">
                    Math Engine
                  </span>
                  {item.timestamp && (
                    <div className="flex items-center space-x-1 text-[10px] text-text-mute font-semibold">
                      <Calendar className="w-3 h-3 text-brand-accent/70" />
                      <span>{item.timestamp}</span>
                    </div>
                  )}
                </div>

                <div className="font-mono text-sm text-text-dim break-all tracking-tight leading-relaxed select-all">
                  {item.expression}
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-brand-primary mt-1 break-all tracking-tight select-all">
                  = {item.result}
                </div>
              </div>

              {/* Actions tile drawer */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => copyToClipboard(item.result, item.id)}
                  className="p-2 bg-canvas-bg hover:bg-brand-primary-bg border border-border-main text-text-dim hover:text-brand-primary rounded-xl transition-all cursor-pointer"
                  title="Copy calculation result"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 bg-canvas-bg hover:bg-red-500/10 border border-border-main text-text-dim hover:text-red-500 rounded-xl transition-all cursor-pointer"
                  title="Delete log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
