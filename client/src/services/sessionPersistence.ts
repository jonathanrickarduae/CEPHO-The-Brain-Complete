/**
 * Session Persistence Service
 * Saves drafts, scroll positions, and form state to localStorage
 */

const STORAGE_PREFIX = 'brain-session-';

interface DraftData {
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
}

// Draft Management
export function saveDraft(key: string, content: string, metadata?: Record<string, any>): void {
  const data: DraftData = {
    content,
    timestamp: Date.now(),
    metadata,
  };
  localStorage.setItem(`${STORAGE_PREFIX}draft-${key}`, JSON.stringify(data));
}

export function getDraft(key: string): DraftData | null {
  const stored = localStorage.getItem(`${STORAGE_PREFIX}draft-${key}`);
  if (!stored) return null;
  
  try {
    const data = JSON.parse(stored) as DraftData;
    // Expire drafts after 24 hours
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
      clearDraft(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearDraft(key: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}draft-${key}`);
}

export function hasDraft(key: string): boolean {
  return getDraft(key) !== null;
}

// Scroll Position Management
export function saveScrollPosition(route: string, position: { x: number; y: number }): void {
  const data: ScrollPosition = {
    ...position,
    timestamp: Date.now(),
  };
  localStorage.setItem(`${STORAGE_PREFIX}scroll-${route}`, JSON.stringify(data));
}

export function getScrollPosition(route: string): ScrollPosition | null {
  const stored = localStorage.getItem(`${STORAGE_PREFIX}scroll-${route}`);
  if (!stored) return null;
  
  try {
    const data = JSON.parse(stored) as ScrollPosition;
    // Expire scroll positions after 1 hour
    if (Date.now() - data.timestamp > 60 * 60 * 1000) {
      localStorage.removeItem(`${STORAGE_PREFIX}scroll-${route}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// Form State Management
export function saveFormState<T extends Record<string, any>>(formId: string, state: T): void {
  const data = {
    state,
    timestamp: Date.now(),
  };
  localStorage.setItem(`${STORAGE_PREFIX}form-${formId}`, JSON.stringify(data));
}

export function getFormState<T extends Record<string, any>>(formId: string): T | null {
  const stored = localStorage.getItem(`${STORAGE_PREFIX}form-${formId}`);
  if (!stored) return null;
  
  try {
    const data = JSON.parse(stored);
    // Expire form state after 1 hour
    if (Date.now() - data.timestamp > 60 * 60 * 1000) {
      clearFormState(formId);
      return null;
    }
    return data.state as T;
  } catch {
    return null;
  }
}

export function clearFormState(formId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}form-${formId}`);
}

// Tab/Window State
export function saveTabState(key: string, value: any): void {
  sessionStorage.setItem(`${STORAGE_PREFIX}tab-${key}`, JSON.stringify(value));
}

export function getTabState<T>(key: string): T | null {
  const stored = sessionStorage.getItem(`${STORAGE_PREFIX}tab-${key}`);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

// Recent Items
export function addRecentItem(category: string, item: { id: string; title: string; timestamp?: number }): void {
  const key = `${STORAGE_PREFIX}recent-${category}`;
  const stored = localStorage.getItem(key);
  let items: Array<{ id: string; title: string; timestamp: number }> = [];
  
  if (stored) {
    try {
      items = JSON.parse(stored);
    } catch {
      items = [];
    }
  }
  
  // Remove existing entry if present
  items = items.filter(i => i.id !== item.id);
  
  // Add new item at the beginning
  items.unshift({
    ...item,
    timestamp: item.timestamp || Date.now(),
  });
  
  // Keep only last 10 items
  items = items.slice(0, 10);
  
  localStorage.setItem(key, JSON.stringify(items));
}

export function getRecentItems(category: string): Array<{ id: string; title: string; timestamp: number }> {
  const key = `${STORAGE_PREFIX}recent-${category}`;
  const stored = localStorage.getItem(key);
  
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Clear all session data
export function clearAllSessionData(): void {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear session storage too
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      sessionStorage.removeItem(key);
    }
  }
}

// React hooks for session persistence
import { useState, useEffect, useCallback } from 'react';

export function useDraft(key: string, initialValue: string = '') {
  const [value, setValue] = useState(() => {
    const draft = getDraft(key);
    return draft?.content || initialValue;
  });
  const [hasSavedDraft, setHasSavedDraft] = useState(() => hasDraft(key));

  const save = useCallback((content: string, metadata?: Record<string, any>) => {
    setValue(content);
    if (content.trim()) {
      saveDraft(key, content, metadata);
      setHasSavedDraft(true);
    } else {
      clearDraft(key);
      setHasSavedDraft(false);
    }
  }, [key]);

  const clear = useCallback(() => {
    setValue('');
    clearDraft(key);
    setHasSavedDraft(false);
  }, [key]);

  return { value, save, clear, hasSavedDraft };
}

export function useScrollRestore(route: string) {
  useEffect(() => {
    // Restore scroll position on mount
    const position = getScrollPosition(route);
    if (position) {
      window.scrollTo(position.x, position.y);
    }

    // Save scroll position on unmount
    return () => {
      saveScrollPosition(route, {
        x: window.scrollX,
        y: window.scrollY,
      });
    };
  }, [route]);
}

export function useFormPersistence<T extends Record<string, any>>(
  formId: string,
  initialState: T
) {
  const [state, setState] = useState<T>(() => {
    const saved = getFormState<T>(formId);
    return saved || initialState;
  });

  const updateState = useCallback((updates: Partial<T>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      saveFormState(formId, newState);
      return newState;
    });
  }, [formId]);

  const resetState = useCallback(() => {
    setState(initialState);
    clearFormState(formId);
  }, [formId, initialState]);

  return { state, updateState, resetState };
}
