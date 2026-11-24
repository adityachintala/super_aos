// Per-question study status for the past-quiz (PYQ) page, kept in the browser.
// incomplete -> completed -> revisit -> incomplete (one button cycles through them).
import { writable } from 'svelte/store';

const KEY = 'super-aos-pyq-status-v1';

export type PyqStatus = 'incomplete' | 'completed' | 'revisit';

/** Question id -> status. Missing ids are 'incomplete'. */
export const pyqStatus = writable<Record<string, PyqStatus>>({});

const NEXT: Record<PyqStatus, PyqStatus> = { incomplete: 'completed', completed: 'revisit', revisit: 'incomplete' };

let loaded = false;

/** Call from onMount, so server render and first paint stay consistent. */
export function loadPyqStatus() {
  if (loaded || typeof localStorage === 'undefined') return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) pyqStatus.set(JSON.parse(raw));
  } catch {
    // unreadable storage: start empty
  }
  pyqStatus.subscribe((s) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      // storage full or blocked: status just will not persist
    }
  });
}

export function cycleStatus(id: string) {
  pyqStatus.update((s) => {
    const next = NEXT[s[id] ?? 'incomplete'];
    const copy = { ...s };
    if (next === 'incomplete') delete copy[id];
    else copy[id] = next;
    return copy;
  });
}

export function resetStatus(ids: string[]) {
  pyqStatus.update((s) => {
    const copy = { ...s };
    for (const id of ids) delete copy[id];
    return copy;
  });
}
