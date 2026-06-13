export interface SimpleHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export function addHistoryItem(expression: string, result: string) {
  try {
    const key = 'omnicalc_history';
    const raw = localStorage.getItem(key);
    const items: SimpleHistoryItem[] = raw ? JSON.parse(raw) : [];
    const item: SimpleHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      expression,
      result,
      timestamp: new Date().toLocaleString(),
    };
    items.unshift(item);
    // keep a reasonable cap
    const capped = items.slice(0, 200);
    localStorage.setItem(key, JSON.stringify(capped));
  } catch (e) {
    console.error('Failed to save history item', e);
  }
}
