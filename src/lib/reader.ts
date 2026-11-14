// The bite-sized lesson reader. A lesson is rendered as a list of <section class="bite">
// elements (see rehype-bites.mjs). This module shows them one at a time, or all at once,
// and remembers the reader's preferences and place. Browser only.

import { get, writable } from 'svelte/store';

export interface Bite {
  /** Heading text. */
  title: string;
  /** Id of the section's heading, used in the URL. */
  id: string;
  /** Rough reading time. */
  minutes: number;
  optional: boolean;
}

export interface ReaderState {
  ready: boolean;
  lessonId: string;
  mode: 'steps' | 'all';
  size: 'normal' | 'large';
  current: number;
  bites: Bite[];
}

const KEY = 'super-aos-reader';
const WORDS_PER_MINUTE = 170;

interface Prefs {
  mode?: 'steps' | 'all';
  size?: 'normal' | 'large';
  /** Where the reader stopped in each lesson. */
  at?: Record<string, number>;
}

export const reader = writable<ReaderState>({ ready: false, lessonId: '', mode: 'steps', size: 'normal', current: 0, bites: [] });

let root: HTMLElement | null = null;
let sections: HTMLElement[] = [];

function loadPrefs(): Prefs {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}
function savePrefs(change: (p: Prefs) => void) {
  try {
    const p = loadPrefs();
    change(p);
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // storage blocked: preferences just will not persist
  }
}

export const minutesFor = (words: number) => Math.max(1, Math.round(words / WORDS_PER_MINUTE));

function apply(state: ReaderState) {
  if (!root) return;
  root.classList.toggle('stepping', state.mode === 'steps');
  root.dataset.size = state.size;
  sections.forEach((s, i) => s.toggleAttribute('data-current', i === state.current));
  document.dispatchEvent(new CustomEvent('reader:change'));
}

const biteOf = (el: Element | null) => (el ? sections.indexOf(el.closest('.bite') as HTMLElement) : -1);

/** Finds the lesson on the page and takes over from the inline start-up script. */
export function initReader(lessonId: string) {
  root = document.querySelector<HTMLElement>('.lesson');
  if (!root) return;
  sections = [...root.querySelectorAll<HTMLElement>(':scope > .bite')];
  if (!sections.length) return;
  const prefs = loadPrefs();
  const bites: Bite[] = sections.map((s) => {
    const h = s.querySelector('h2');
    // Count the words a reader actually reads: not code, tables of numbers or widgets.
    const text = [...s.querySelectorAll(':scope > p, :scope > ul, :scope > ol, :scope > aside, :scope > blockquote')].map((e) => e.textContent ?? '').join(' ');
    return {
      title: h?.textContent?.trim() ?? 'Section',
      id: h?.id ?? '',
      minutes: minutesFor(text.split(/\s+/).filter(Boolean).length),
      optional: !!s.querySelector('[data-optional]'),
    };
  });
  let current = Math.min(prefs.at?.[lessonId] ?? 0, sections.length - 1);
  const fromHash = biteOf(location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null);
  if (fromHash >= 0) current = fromHash;
  const state: ReaderState = { ready: true, lessonId, mode: prefs.mode ?? 'steps', size: prefs.size ?? 'normal', current, bites };
  reader.set(state);
  apply(state);

  // In-page links (the table of contents, "#checkpoint") may point into a hidden bite.
  addEventListener('hashchange', () => {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    const i = biteOf(target);
    if (i < 0) return;
    show(i, false);
    target?.scrollIntoView();
  });
}

function show(index: number, scroll: boolean) {
  const s = get(reader);
  const current = Math.max(0, Math.min(index, s.bites.length - 1));
  const next = { ...s, current };
  reader.set(next);
  apply(next);
  savePrefs((p) => (p.at = { ...p.at, [s.lessonId]: current }));
  if (s.bites[current].id) history.replaceState(null, '', `#${s.bites[current].id}`);
  if (scroll) sections[current]?.scrollIntoView({ block: 'start' });
}

/** Moves to a section. In "all" mode this just scrolls to it. */
export const go = (index: number) => show(index, true);

export function setMode(mode: 'steps' | 'all') {
  const next = { ...get(reader), mode };
  reader.set(next);
  apply(next);
  savePrefs((p) => (p.mode = mode));
  sections[next.current]?.scrollIntoView({ block: 'start' });
}

export function setSize(size: 'normal' | 'large') {
  const next = { ...get(reader), size };
  reader.set(next);
  apply(next);
  savePrefs((p) => (p.size = size));
}
