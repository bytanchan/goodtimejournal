'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { insertEntry, updateEntry, getEntries } from '@/lib/entries';
import { signInWithGoogle, signOut, getSession, onAuthStateChange } from '@/lib/auth';

declare global {
  function showOnboard(): void;
  function goApp(): void;
  function obNext(): void;
  function goto(id: string): void;
  function tab(t: string): void;
  function openWrapped(): void;
  function openLog(): void;
  function openLogWithTod(tod: string): void;
  function openLogEdit(id: number): void;
  function closeLog(): void;
  function toggleFlow(): void;
  function saveEntry(): void;
  function copyLink(): void;
  function closeWrapped(): void;
  function saveReflection(): void;
  function editReflection(id: number): void;
  function openGoodTimeMap(): void;
  function closeGoodTimeMap(): void;
  function setJSort(s: string): void;
  function setJFlow(f: string): void;
  function openJournalFilter(): void;
  function closeJournalFilter(): void;
  function openLogWithDate(dateStr: string): void;
  function handleSignIn(): void;
  function handleSignOut(): void;
}

export default function Home() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    w.dbSaveEntry = insertEntry;
    w.dbUpdateEntry = updateEntry;
    w.dbLoadEntries = getEntries;
    w.dbSignIn = signInWithGoogle;
    w.dbSignOut = signOut;
    w.dbGetSession = getSession;
    w.dbOnAuthStateChange = onAuthStateChange;
  }, []);

  return (
    <>
      {/* iA Writer Duo loaded via globals.css @font-face — no external requests */}
      <style>{`
/* ── TOKENS ──────────────────────────────────────────── */
:root {
  /* Warm light palette */
  --bg:          #FAF8F4;
  --bg-2:        #F4F1EA;
  --bg-3:        #EDE8DE;
  --surface:     #FFFFFF;
  --surface-2:   #F9F7F2;

  --ink:         #1C1917;
  --ink-2:       #57534E;
  --ink-3:       #A8A29E;
  --ink-4:       #D6D3CF;

  --border:      rgba(28,25,23,0.08);
  --border-2:    rgba(28,25,23,0.14);

  /* Single brand color system — indigo-purple family */
  --accent:      #5C4FCF;
  --accent-2:    #7B6EE8;
  --accent-soft: rgba(92,79,207,0.08);
  --accent-glow: rgba(92,79,207,0.18);

  /* Energy = lighter brand tone; Engage = core brand tone */
  --energy:      #7B6EE8;
  --energy-soft: rgba(123,110,232,0.1);
  --engage:      #5C4FCF;
  --engage-soft: rgba(92,79,207,0.1);

  --morning:     #FEF3C7;
  --morning-ink: #92400E;
  --day:         #DBEAFE;
  --day-ink:     #1E40AF;
  --evening:     #EDE9FE;
  --evening-ink: #5B21B6;

  --success:     #059669;
  --error:       #DC2626;

  --radius-xs:   6px;
  --radius-sm:   10px;
  --radius-md:   14px;
  --radius-lg:   20px;
  --radius-xl:   28px;

  --shadow-xs:   0 1px 2px rgba(28,25,23,0.06);
  --shadow-sm:   0 2px 8px rgba(28,25,23,0.08);
  --shadow-md:   0 4px 16px rgba(28,25,23,0.1);
  --shadow-lg:   0 12px 40px rgba(28,25,23,0.14);

  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);

  /* Font system:
     --font-ui   = system sans for chrome, labels, navigation, buttons
     --font-body = iA Writer Duo for written content (entry names, notes, hero date) */
  --font-ui:   -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-body: 'iA Writer Duo', 'Courier New', monospace;
  /* Legacy aliases */
  --font-sans: var(--font-ui);
  --font-serif: var(--font-body);

  /* Type scale — Minor Third (1.2x) from 11px base */
  --text-2xs:  0.6875rem;   /* 11px — labels, metadata */
  --text-xs:   0.75rem;     /* 12px — secondary info */
  --text-sm:   0.8125rem;   /* 13px — captions, helper */
  --text-base: 0.9375rem;   /* 15px — body text */
  --text-md:   1.125rem;    /* 18px — section headers */
  --text-lg:   1.3125rem;   /* 21px — page titles */
  --text-xl:   1.5rem;      /* 24px — hero display */
}

/* ── RESET ────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html {
  height: 100%;
  /* Safari fix: setting overflow-x on both html AND body is required.
     overflow-x:hidden on body alone propagates to html in Safari, which
     changes the fixed-positioning reference from the viewport to the body's
     scroll container — breaking modals and allowing horizontal scroll. */
  overflow-x: hidden;
  -webkit-tap-highlight-color: transparent;
}
body {
  font-family: var(--font-ui);
  background: var(--bg);
  color: var(--ink);
  min-height: 100%;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
button { cursor: pointer; border: none; background: none; font-family: var(--font-ui); color: inherit; }
input, textarea { font-family: var(--font-ui); color: inherit; background: none; }

/* ── TYPE — Minor Third (×1.2) scale, 11px base ──────── */
/*  2xs:  11px  (--text-2xs)  — labels, metadata           */
/*  xs:   12px  (--text-xs)   — secondary info             */
/*  sm:   13px  (--text-sm)   — captions, helper           */
/*  base: 15px  (--text-base) — body text                  */
/*  md:   18px  (--text-md)   — section headers            */
/*  lg:   21px  (--text-lg)   — page titles                */
/*  xl:   24px  (--text-xl)   — hero display               */
/*  date: 30–40px (clamp)     — display/hero               */
/* iA Writer Duo for the hero date — it earns its place as a display typeface */
.t-date    { font-family: var(--font-body); font-size: clamp(1.875rem, 8vw, 2.5rem); font-weight: 400; letter-spacing: -0.01em; line-height: 1.1; }
/* System font for UI headings — lighter, more neutral */
.t-h1      { font-family: var(--font-ui); font-size: var(--text-lg); font-weight: 500; letter-spacing: -0.01em; line-height: 1.25; }
.t-h2      { font-family: var(--font-ui); font-size: var(--text-md); font-weight: 500; letter-spacing: -0.005em; line-height: 1.3; }
.t-h3      { font-family: var(--font-ui); font-size: var(--text-base); font-weight: 500; line-height: 1.4; }
.t-body    { font-size: var(--text-base); font-weight: 400; line-height: 1.65; }
.t-sm      { font-size: var(--text-sm);   font-weight: 400; line-height: 1.5; }
.t-xs      { font-size: var(--text-2xs);  font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; }
.ink-2     { color: var(--ink-2); }
.ink-3     { color: var(--ink-3); }

/* ── SCREENS ──────────────────────────────────────────── */
/* App starts invisible — JS reveals correct screen after checking localStorage (prevents onboarding flash) */
/* Safari fix: body is display:flex, so #app is a flex child.
   Flex children default to min-width:auto — they won't shrink below content width.
   width:100% + min-width:0 ensures #app never exceeds viewport width. */
#app { min-height: 100vh; opacity: 0; transition: opacity 0.15s; width: 100%; min-width: 0; }
.screen { display: none; min-height: 100vh; flex-direction: column; animation: fadeUp 0.3s var(--ease-out) both; padding-bottom: max(80px, calc(80px + env(safe-area-inset-bottom))); }
.screen.active { display: flex; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page { max-width: 430px; width: 100%; margin: 0 auto; padding: 0 20px; flex: 1; box-sizing: border-box; min-width: 0; }
.pb-nav { padding-bottom: calc(88px + max(8px, env(safe-area-inset-bottom))); }

/* ── NAV ──────────────────────────────────────────────── */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: rgba(250,248,244,0.92);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
  padding: 8px 0 max(8px, env(safe-area-inset-bottom));
  z-index: 100; display: none;
}
.bottom-nav.show { display: block; }
.nav-items { display: flex; max-width: 430px; margin: 0 auto; }
.nav-item {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 8px 0; border-radius: var(--radius-sm); color: var(--ink-3);
  transition: color 0.2s;
}
.nav-item.active { color: var(--accent); }
.nav-item svg { width: 22px; height: 22px; transition: transform 0.15s var(--ease-out); }
.nav-item:active svg { transform: scale(0.88); }
.nav-label { font-size: 0.625rem; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }

/* ── BUTTONS ──────────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border-radius: var(--radius-md); font-weight: 500; font-size: 0.9375rem;
  padding: 0 24px; height: 52px; transition: all 0.18s var(--ease-out);
  position: relative; overflow: hidden;
}
.btn:active { transform: scale(0.97); }
.btn-primary {
  background: var(--ink); color: var(--bg);
  box-shadow: var(--shadow-sm);
}
.btn-primary:hover { background: #2C2926; }
.btn-accent {
  background: var(--accent); color: #fff;
  box-shadow: 0 4px 20px var(--accent-glow);
}
.btn-accent:hover { background: var(--accent-2); }
.btn-secondary {
  background: var(--surface); color: var(--ink-2);
  border: 1.5px solid var(--border-2); box-shadow: var(--shadow-xs);
}
.btn-ghost { background: transparent; color: var(--ink-3); }
.btn-full { width: 100%; }
.btn-sm { height: 36px; padding: 0 14px; font-size: 0.8125rem; border-radius: var(--radius-sm); }

/* ── CARDS ────────────────────────────────────────────── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 18px;
  box-shadow: var(--shadow-xs);
}
.card-flat {
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 18px;
}

/* ── TIME-OF-DAY SECTION ──────────────────────────────── */
.tod-section { margin-bottom: 24px; }
.tod-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 10px; border-radius: var(--radius-sm);
  margin-bottom: 8px;
}
.tod-label {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--text-2xs); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;
}
.tod-morning { background: var(--morning); }
.tod-morning .tod-label { color: var(--morning-ink); }
.tod-day     { background: var(--day); }
.tod-day .tod-label     { color: var(--day-ink); }
.tod-night   { background: var(--evening); }
.tod-night .tod-label   { color: var(--evening-ink); }

/* ── TOD EMPTY ────────────────────────────────────────── */
.tod-empty {
  font-size: 0.8125rem; color: var(--ink-3);
  padding: 10px 12px; font-style: italic;
}

/* ── ENTRY ROW ────────────────────────────────────────── */
.entry-row {
  display: flex; align-items: flex-start; gap: 12px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: 12px 14px; /* tightened internal padding */
  box-shadow: var(--shadow-xs);
  transition: box-shadow 0.2s, transform 0.15s var(--ease-out);
  cursor: pointer;
}
.entry-row:hover { box-shadow: var(--shadow-sm); transform: translateY(-1px); }
.entry-row:active { transform: scale(0.99); }
.entry-content { flex: 1; min-width: 0; }
.entry-name {
  font-family: var(--font-body); /* iA Writer for written content */
  font-weight: 400;
  font-size: 0.9375rem;
  letter-spacing: 0;
  line-height: 1.35;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.entry-pills { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 5px; }
.pill {
  display: inline-flex; align-items: center; gap: 3px;
  border-radius: 100px; padding: 1px 7px;
  font-size: 0.6875rem; font-weight: 400; letter-spacing: 0.01em;
}
.pill-energy { background: rgba(28,25,23,0.06); color: var(--ink-3); }
.pill-engage { background: rgba(28,25,23,0.06); color: var(--ink-3); }
.pill-flow   { background: var(--accent-soft); color: var(--accent); font-weight: 500; }
.entry-note {
  font-family: var(--font-body); /* iA Writer for the note text itself */
  font-size: 0.8125rem;
  color: var(--ink-3);
  margin-top: 5px;
  line-height: 1.55;
}

/* ── WEEK STRIP ───────────────────────────────────────── */
.day-dots { display: flex; gap: 1px; min-width: 0; }
.day-dot-week {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 3px; padding: 2px 1px; border-radius: var(--radius-sm);
  cursor: default; transition: background 0.15s; min-width: 0;
}
.day-dot-week.tappable { cursor: pointer; }
.day-dot-week.tappable:hover { background: var(--accent-soft); }
.week-dot-label {
  font-size: 0.5rem; font-weight: 500; letter-spacing: 0.02em;
  text-transform: uppercase; color: var(--ink-3); line-height: 1;
}
.day-dot-week.today-col .week-dot-label { color: var(--accent); }
.week-dot-num {
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.625rem; font-weight: 500;
  background: var(--bg-3); color: var(--ink-3);
  transition: all 0.2s; flex-shrink: 0;
}
.week-dot-num.done      { background: var(--ink-2); color: var(--bg); }
.week-dot-num.today     { background: var(--accent); color: #fff; box-shadow: 0 2px 8px var(--accent-glow); }
.week-dot-num.future    { background: var(--bg-2); color: var(--ink-4); }
.week-dot-num.past-empty { background: var(--bg-3); color: var(--ink-4); }

.bar-track { height: 6px; background: var(--bg-3); border-radius: 100px; overflow: hidden; }
.bar-fill  { height: 100%; border-radius: 100px; background: var(--ink); transition: width 1s var(--ease-out); }

/* ── STREAK ───────────────────────────────────────────── */
.streak {
  display: inline-flex; align-items: center; gap: 5px;
  background: var(--energy-soft); border: 1px solid rgba(123,110,232,0.2);
  border-radius: 100px; padding: 4px 10px;
  font-size: 0.8125rem; font-weight: 400; color: var(--energy);
}

/* ── FLOW TOGGLE ──────────────────────────────────────── */
/* Clean toggle — brand color, no icons, subtle scale+glow on activation */
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface-2); border: 1.5px solid var(--border-2);
  border-radius: var(--radius-md); padding: 13px 16px; cursor: pointer;
  transition: background 0.22s var(--ease-out), border-color 0.22s var(--ease-out),
              box-shadow 0.22s var(--ease-out), transform 0.22s var(--ease-out);
}
.toggle-row.on {
  border-color: var(--accent); background: var(--accent-soft);
  box-shadow: 0 0 0 3px var(--accent-soft), 0 4px 16px var(--accent-glow);
  transform: scale(1.015);
}
.toggle-pill {
  width: 42px; height: 24px; background: var(--border-2); border-radius: 100px;
  position: relative; transition: background 0.22s; flex-shrink: 0;
}
.toggle-pill::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; background: #fff;
  border-radius: 50%; transition: transform 0.22s var(--ease-out), box-shadow 0.22s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle-row.on .toggle-pill { background: var(--accent); }
.toggle-row.on .toggle-pill::after {
  transform: translateX(18px);
  box-shadow: 0 2px 6px rgba(92,79,207,0.35);
}
/* Pop animation — triggered via JS reflow trick for repeat fires */
@keyframes flowPop {
  0%   { transform: scale(1.015); }
  40%  { transform: scale(1.024); }
  100% { transform: scale(1.015); }
}
.toggle-row.flow-pop { animation: flowPop 0.32s var(--ease-out) both; }

/* ── INPUT ────────────────────────────────────────────── */
.input-group { display: flex; flex-direction: column; gap: 5px; }
.input-label { font-size: var(--text-sm); font-weight: 400; color: var(--ink-2); }
.field {
  background: var(--surface-2); border: 1.5px solid var(--border-2);
  border-radius: var(--radius-md); padding: 13px 16px;
  font-size: 1rem; color: var(--ink); outline: none; width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box; min-width: 0;
}
.field::placeholder { color: var(--ink-3); }
.field:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); background: var(--surface); }
.field.error { border-color: var(--error); animation: shake 0.3s; }
@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }

/* ── MODAL — scroll contained within sheet, no overflow past top ── */
.overlay {
  position: fixed; inset: 0;
  background: rgba(28,25,23,0.5); backdrop-filter: blur(6px);
  z-index: 200; display: none; align-items: center; justify-content: center;
  padding: 16px; overflow: auto;
}
.overlay.open { display: flex; }
.sheet {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); width: 100%; max-width: 430px; box-sizing: border-box;
  max-height: calc(100svh - 48px);
  overflow-y: auto;
  overscroll-behavior: contain;
  animation: slideUp 0.32s var(--ease-out) both;
  padding: 20px 16px;
  padding-bottom: max(20px, calc(env(safe-area-inset-bottom) + 12px));
  box-shadow: var(--shadow-lg);
}
.sheet::-webkit-scrollbar { display: none; }
.sheet { scrollbar-width: none; }
.sheet-handle {
  width: 36px; height: 4px; background: var(--border-2);
  border-radius: 2px; margin: 0 auto 20px;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sheet-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.close-btn {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--bg-2); display: flex; align-items: center; justify-content: center;
  color: var(--ink-3); transition: all 0.15s;
}
.close-btn:hover { background: var(--bg-3); color: var(--ink); }

/* ── FAB ──────────────────────────────────────────────── */
.fab {
  position: fixed;
  bottom: calc(76px + max(8px, env(safe-area-inset-bottom)));
  right: 20px; width: 56px; height: 56px; border-radius: 50%;
  background: var(--ink); box-shadow: 0 6px 24px rgba(28,25,23,0.25);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s var(--ease-out); z-index: 50;
}
.fab:hover { transform: scale(1.08); box-shadow: 0 10px 32px rgba(28,25,23,0.3); }
.fab:active { transform: scale(0.95); }
.fab svg { color: var(--bg); width: 24px; height: 24px; }
.fab.gone { display: none; }

/* ── ONBOARD DOT ──────────────────────────────────────── */
.ob-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--bg-3); transition: all 0.3s; }
.ob-dot.on { width: 22px; border-radius: 4px; background: var(--ink); }

/* ── LANDING ──────────────────────────────────────────── */
.landing-blob {
  position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
}

/* ── PATTERN BARS ─────────────────────────────────────── */
.p-bar { height: 7px; border-radius: 100px; transition: width 1s var(--ease-out); }

/* ── WRAPPED CARD ─────────────────────────────────────── */
.wrapped {
  /* isolation:isolate forces a stacking context so filter:blur() blobs are clipped
     to the card boundary by WebKit's compositing engine, regardless of overflow */
  border-radius: var(--radius-xl); overflow: hidden; isolation: isolate; position: relative;
  min-height: 500px; display: flex; flex-direction: column; justify-content: space-between;
  padding: 28px 24px;
  background: linear-gradient(145deg, #1a0533 0%, #0d1b3e 45%, #031a12 100%);
}
.wrapped-blob { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.w-rel { position: relative; z-index: 1; }

/* ── NUDGE CARD ───────────────────────────────────────── */
.nudge {
  background: linear-gradient(135deg, var(--accent-soft) 0%, rgba(92,79,207,0.04) 100%);
  border: 1px solid rgba(92,79,207,0.2); border-radius: var(--radius-lg);
  padding: 16px; margin-bottom: 20px;
}

/* ── UTILS ────────────────────────────────────────────── */
.stack  { display: flex; flex-direction: column; }
.row    { display: flex; align-items: center; }
.divider { height: 1px; background: var(--border); margin: 20px 0; }
.gap-4  { gap: 4px; }  .gap-6  { gap: 6px; }   .gap-8  { gap: 8px; }
.gap-10 { gap: 10px; } .gap-12 { gap: 12px; }  .gap-16 { gap: 16px; }
.gap-18 { gap: 18px; } .gap-20 { gap: 20px; }  .gap-24 { gap: 24px; } .gap-28 { gap: 28px; }
.mt-8  { margin-top: 8px; }  .mt-12 { margin-top: 12px; } .mt-16 { margin-top: 16px; }
.mt-20 { margin-top: 20px; } .mt-24 { margin-top: 24px; } .mt-32 { margin-top: 32px; }
.mt-40 { margin-top: 40px; }

/* scrollbar */
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-thumb { background: var(--ink-4); border-radius: 2px; }

/* ── FLOW SHIMMER ─────────────────────────────────────── */
/* Shimmer sweep animation when flow toggle is turned on   */
@keyframes flowShimmer {
  0%   { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
  50%  { opacity: 0.6; }
  100% { transform: translateX(200%) skewX(-15deg); opacity: 0; }
}
.toggle-row { overflow: hidden; position: relative; }
.toggle-row.flow-shimmer::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%);
  animation: flowShimmer 0.55s var(--ease-out) forwards;
  pointer-events: none;
  border-radius: inherit;
}

/* ── JOURNAL FILTER BAR ───────────────────────────────── */
/* ── JOURNAL SORT/FILTER ──────────────────────────────── */
/* Compact trigger button — shows current sort state inline */
.sort-filter-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 0 12px; height: 32px; border-radius: 100px;
  background: var(--surface); border: 1.5px solid var(--border-2);
  font-size: var(--text-sm); font-weight: 500; color: var(--ink-2);
  cursor: pointer; transition: all 0.15s; flex-shrink: 0; white-space: nowrap;
}
.sort-filter-btn:hover { background: var(--bg-3); }

/* Bottom-sheet options — radio-style rows with active state */
.jf-section-label {
  font-size: var(--text-2xs); font-weight: 600; letter-spacing: 0.07em;
  text-transform: uppercase; color: var(--ink-3); margin-bottom: 8px;
}
.jf-option {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 16px; border-radius: var(--radius-md); width: 100%;
  background: var(--surface-2); border: 1.5px solid var(--border);
  font-size: var(--text-base); font-weight: 400; color: var(--ink-2);
  text-align: left; cursor: pointer; transition: all 0.15s;
}
.jf-option:hover { background: var(--bg-3); }
.jf-option.active {
  background: var(--accent-soft); color: var(--accent);
  border-color: rgba(92,79,207,0.25); font-weight: 600;
}
.jf-option.active::after {
  content: '';
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent); flex-shrink: 0;
}

/* ── SLIDERS ──────────────────────────────────────────── */
/*
 * Polished range inputs:
 * - 6px rounded track with smooth fill gradient via JS
 * - 22px thumb with white border + brand-color glow per slider
 * - Energy = lighter brand tone (#7B6EE8)
 * - Engagement = core brand tone (#5C4FCF)
 */
.slider-field {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 6px; border-radius: 100px;
  background: var(--bg-3); outline: none; cursor: pointer; border: none;
  transition: background 0.15s;
}
.slider-field::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--ink); cursor: pointer;
  border: 2px solid rgba(255,255,255,0.85);
  box-shadow: 0 2px 6px rgba(0,0,0,0.14);
  transition: transform 0.15s var(--ease-out), box-shadow 0.15s;
}
.slider-field:hover::-webkit-slider-thumb  { box-shadow: 0 3px 10px rgba(0,0,0,0.2); }
.slider-field:active::-webkit-slider-thumb { transform: scale(1.18); }
.slider-field::-moz-range-thumb {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--ink); cursor: pointer;
  border: 2px solid rgba(255,255,255,0.85);
  box-shadow: 0 2px 6px rgba(0,0,0,0.14);
}
.slider-energy::-webkit-slider-thumb { background: var(--energy); box-shadow: 0 2px 8px rgba(123,110,232,0.32); }
.slider-energy::-moz-range-thumb    { background: var(--energy); }
.slider-engage::-webkit-slider-thumb { background: var(--engage); box-shadow: 0 2px 8px rgba(92,79,207,0.32); }
.slider-engage::-moz-range-thumb    { background: var(--engage); }

/* ── GTM EXAMPLE CARD TILT ────────────────────────────── */
/* 3D tilt on hover (desktop) and touch-drag (mobile) — JS handles rotation values */
#gtm-example-card {
  cursor: default;
  transition: transform 0.18s var(--ease-out), box-shadow 0.18s var(--ease-out);
  will-change: transform;
  transform-style: preserve-3d;
}


/* ── TOAST ────────────────────────────────────────────── */
#toast {
  /* Safari fix: avoid left:50% + translateX(-50%) on fixed elements.
     When body's scroll context is mis-sized (Safari overflow bug), left:50%
     resolves to the wrong reference, pushing the toast right and creating
     invisible overflow. Instead use left/right+margin:auto — Safari-safe. */
  position: fixed; bottom: 96px;
  left: 16px; right: 16px;
  margin: 0 auto;
  width: max-content; max-width: calc(100% - 32px);
  transform: translateY(12px);
  background: var(--ink); color: var(--bg);
  border-radius: 100px; padding: 9px 18px;
  font-size: 0.875rem; font-weight: 500;
  box-shadow: var(--shadow-md); z-index: 999;
  opacity: 0; transition: all 0.28s var(--ease-out);
  white-space: nowrap; pointer-events: none;
}
      `}</style>

      <div id="app">

        {/* ══════════════════════════════════════════════════ */}
        {/* LANDING                                            */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="screen" id="s-land">
          {/* overflow:clip (not hidden) — clip does a true paint clip so filter:blur() on
              absolute children cannot bleed through the boundary. overflow:hidden creates
              a scroll container which WebKit may not honour for blurred children. */}
          <div style={{position:'relative',overflow:'clip',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
            <div className="landing-blob" style={{width:'420px',height:'420px',background:'rgba(92,79,207,0.12)',top:'-100px',right:'-100px'}}></div>
            <div className="landing-blob" style={{width:'320px',height:'320px',background:'rgba(123,110,232,0.09)',bottom:'-60px',left:'-80px'}}></div>

            <div className="page" style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',paddingTop:'72px',paddingBottom:'48px'}}>
              <div style={{marginBottom:'12px'}}>
                <span style={{fontSize:'0.6875rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--ink-3)'}}>Designing Your Life · Stanford</span>
              </div>

              <h1 className="t-date" style={{marginBottom:'16px',color:'var(--ink)'}}>
                What actually<br /><em style={{fontStyle:'italic',color:'var(--accent)'}}>energizes</em> you?
              </h1>

              <p className="t-body ink-2" style={{maxWidth:'340px',marginBottom:'40px',lineHeight:1.75}}>
                Log your activities. Track three signals — energy, engagement, and flow. Patterns emerge as you log.
              </p>

              <div style={{maxWidth:'340px'}}>
                <button className="btn btn-accent btn-full" onClick={() => window.showOnboard()}>Start</button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* AUTH — shown when Supabase is configured but       */}
        {/*        no active session                           */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="screen" id="s-auth">
          <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 20px',maxWidth:'430px',margin:'0 auto',width:'100%',boxSizing:'border-box'}}>
            <div style={{marginBottom:'40px',textAlign:'center'}}>
              <div style={{fontSize:'0.75rem',fontWeight:500,letterSpacing:'0.06em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:'20px'}}>Good Time Journal</div>
              <h1 style={{fontFamily:'var(--font-ui)',fontSize:'1.5rem',fontWeight:500,letterSpacing:'-0.01em',lineHeight:1.2,marginBottom:'12px',color:'var(--ink)'}}>
                Save your journal
              </h1>
              <p style={{fontSize:'0.9375rem',color:'var(--ink-3)',lineHeight:1.65,maxWidth:'280px',margin:'0 auto'}}>
                Sign in to sync across devices and keep your data safe.
              </p>
            </div>
            <div style={{width:'100%',maxWidth:'320px',display:'flex',flexDirection:'column',gap:'10px'}}>
              <button
                id="google-signin-btn"
                style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',width:'100%',height:'52px',borderRadius:'var(--radius-md)',background:'var(--surface)',border:'1.5px solid var(--border-2)',fontSize:'1rem',fontWeight:500,color:'var(--ink)',cursor:'pointer',transition:'all 0.18s var(--ease-out)',boxShadow:'var(--shadow-xs)'}}
                onClick={() => window.handleSignIn()}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              {/* Skip option — shown only after onboarding (returning signed-out users never see it) */}
              <button
                id="auth-skip-btn"
                style={{display:'none',width:'100%',height:'44px',borderRadius:'var(--radius-md)',background:'none',border:'none',fontSize:'0.875rem',fontWeight:400,color:'var(--ink-3)',cursor:'pointer'}}
                onClick={() => window.skipAuth()}
              >
                Continue without account
              </button>
              <p style={{fontSize:'0.75rem',color:'var(--ink-4)',textAlign:'center',lineHeight:1.6,marginTop:'4px'}}>
                Your data is private and only visible to you.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* ONBOARDING                                         */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="screen" id="s-onboard">
          <div className="page" style={{display:'flex',flexDirection:'column',justifyContent:'center',minHeight:'100vh',paddingTop:'56px',paddingBottom:'48px'}}>
            {/* Step progress dots */}
            <div className="row gap-6" id="ob-dots" style={{marginBottom:'44px'}}>
              <div className="ob-dot on" id="obd-0"></div>
              <div className="ob-dot" id="obd-1"></div>
              <div className="ob-dot" id="obd-2"></div>
            </div>

            {/* Step 0 — What is this */}
            <div id="obs-0">
              <h1 className="t-h1" style={{marginBottom:'14px'}}>The Good Time Journal</h1>
              <p className="t-body ink-2" style={{lineHeight:1.75}}>
                From <em>Designing Your Life</em> by Stanford&apos;s Bill Burnett and Dave Evans. Log your activities and track three things: <strong style={{color:'var(--ink)'}}>energy</strong>, <strong style={{color:'var(--ink)'}}>engagement</strong>, and <strong style={{color:'var(--ink)'}}>flow</strong>. Patterns emerge as you log.
              </p>
            </div>

            {/* Step 1 — Two signals (no icons per spec) */}
            <div id="obs-1" style={{display:'none'}}>
              <h1 className="t-h1" style={{marginBottom:'20px'}}>Three signals</h1>
              <div className="stack gap-10">
                <div className="card-flat">
                  <div className="t-h3" style={{color:'var(--energy)',marginBottom:'3px'}}>Energy</div>
                  <div className="t-sm ink-2">Did this fill your tank or drain it?</div>
                </div>
                <div className="card-flat">
                  <div className="t-h3" style={{color:'var(--engage)',marginBottom:'3px'}}>Engagement</div>
                  <div className="t-sm ink-2">Were you absorbed, or going through the motions?</div>
                </div>
                <div className="card-flat">
                  <div className="t-h3" style={{color:'var(--accent)',marginBottom:'3px'}}>Flow</div>
                  <div className="t-sm ink-2">Did time disappear completely?</div>
                </div>
              </div>
            </div>

            {/* Step 2 — Name input */}
            <div id="obs-2" style={{display:'none'}}>
              <h1 className="t-h1" style={{marginBottom:'14px'}}>Almost ready</h1>
              <p className="t-body ink-2" style={{marginBottom:'24px',lineHeight:1.75}}>
                What should we call you?
              </p>
              <div className="input-group">
                <input className="field" id="ob-name" type="text" placeholder="Your name…" autoComplete="given-name" />
              </div>
            </div>

            <div className="mt-40 stack gap-10">
              <button className="btn btn-primary btn-full" id="ob-btn" onClick={() => window.obNext()}>Continue</button>
              <button className="btn btn-ghost btn-full" onClick={() => window.goto('s-land')}>Back</button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* TODAY                                              */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="screen" id="s-today">
          <div className="page pb-nav">
            <div style={{paddingTop:'52px'}}>

              {/* Greeting + streak + sign-out */}
              <div className="row" style={{justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}>
                <div className="t-xs ink-3" id="greeting-line">Good morning</div>
                <div className="row gap-8">
                  <div className="streak" id="streak-badge" style={{display:'none'}}></div>
                  <button id="signout-btn" style={{display:'none',fontSize:'0.6875rem',fontWeight:400,color:'var(--ink-4)',background:'none',border:'none',cursor:'pointer',padding:'2px 0'}} onClick={() => window.handleSignOut()}>Sign out</button>
                </div>
              </div>

              {/* Serif date hero */}
              <div className="t-date" id="hero-date" style={{marginBottom:'20px'}}>Thursday</div>

              {/* This week */}
              <div className="card" style={{marginBottom:'24px'}}>
                <div className="t-xs ink-3" style={{marginBottom:'12px'}}>This week</div>
                <div className="day-dots" id="day-dots"></div>
              </div>

              {/* Time-of-day sections — always rendered (Morning / Day / Night) */}
              <div id="tod-container"></div>

            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* JOURNAL                                            */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="screen" id="s-journal">
          <div className="page pb-nav">
            <div style={{paddingTop:'52px'}}>
              <div className="row" style={{justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <h1 className="t-h1">Journal</h1>
                <button className="sort-filter-btn" onClick={() => window.openJournalFilter()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                  </svg>
                  <span id="journal-sort-label">Most recent</span>
                </button>
              </div>
              <div className="stack gap-28" id="journal-list"></div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* INSIGHTS                                           */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="screen" id="s-patterns">
          <div className="page pb-nav">
            <div style={{paddingTop:'52px'}}>

              {/* Header — always visible */}
              <div className="row" style={{justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
                <h1 className="t-h1">Insights</h1>
                {/* Share button — shown by JS when 14+ entries */}
                <button className="btn btn-sm btn-secondary" id="pat-share-btn" onClick={() => window.openWrapped()} style={{display:'none'}}>Share</button>
              </div>

              {/* Progressive content — rendered by renderPatterns() based on S.entries.length */}
              <div id="pat-container"></div>

              {/* Reflect — always available */}
              <div className="divider" style={{marginTop:'8px'}}></div>
              <div className="card">
                <div className="t-xs ink-3" style={{marginBottom:'10px'}}>Reflect</div>
                <div className="t-body ink-2" style={{marginBottom:'14px',lineHeight:1.7}}>What&apos;s one thing you could do more of? What would you reduce?</div>
                <textarea className="field" id="reflection-text" rows={3} placeholder="Write your reflection here…" style={{resize:'none'}}></textarea>
                <button className="btn btn-primary btn-full" style={{marginTop:'12px'}} onClick={() => window.saveReflection()}>Save reflection</button>
              </div>
              <div id="reflection-history" style={{marginTop:'16px'}}></div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* BOTTOM NAV                                         */}
        {/* ══════════════════════════════════════════════════ */}
        <nav className="bottom-nav" id="bnav">
          <div className="nav-items">
            <button className="nav-item active" id="ni-today" onClick={() => window.tab('today')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="nav-label">Today</span>
            </button>
            <button className="nav-item" id="ni-journal" onClick={() => window.tab('journal')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span className="nav-label">Journal</span>
            </button>
            <button className="nav-item" id="ni-patterns" onClick={() => window.tab('patterns')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span className="nav-label">Insights</span>
            </button>
          </div>
        </nav>

        {/* FAB — shown on Today and Journal, hidden on Insights */}
        <button className="fab gone" id="fab" onClick={() => window.openLog()} aria-label="Log activity">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* ══════════════════════════════════════════════════ */}
        {/* SHEET: LOG / EDIT ENTRY                            */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="overlay" id="log-overlay">
          <div className="sheet">
            <div className="sheet-handle"></div>
            <div className="sheet-header">
              <h2 className="t-h2" id="log-overlay-title">Log activity</h2>
              <button className="close-btn" onClick={() => window.closeLog()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="stack gap-18">

              <div className="input-group">
                <label className="input-label">What did you do?</label>
                <input className="field" id="log-name" type="text" placeholder="e.g. Team standup, Design sprint, Lunch with a friend…" autoComplete="off" />
              </div>

              {/* Date — defaults to today, can be changed for retroactive logging */}
              <div className="input-group">
                <label className="input-label">Date</label>
                <input className="field" id="log-date" type="date" />
              </div>

              {/* Energy slider — lighter brand tone (#7B6EE8) */}
              <div className="input-group">
                <div className="row" style={{justifyContent:'space-between',marginBottom:'10px'}}>
                  <label className="input-label" style={{color:'var(--energy)'}}>Energy</label>
                  <span className="t-sm" style={{color:'var(--energy)',fontWeight:700,minWidth:'24px',textAlign:'right'}} id="energy-val">3</span>
                </div>
                <input className="slider-field slider-energy" id="energy-slider" type="range" min="1" max="5" step="0.5" defaultValue="3" />
                <div className="row" style={{justifyContent:'space-between',marginTop:'6px'}}>
                  <span className="t-xs ink-3">Drained</span>
                  <span className="t-xs ink-3">Energized</span>
                </div>
              </div>

              {/* Engagement slider — core brand tone (#5C4FCF) */}
              <div className="input-group">
                <div className="row" style={{justifyContent:'space-between',marginBottom:'10px'}}>
                  <label className="input-label" style={{color:'var(--engage)'}}>Engagement</label>
                  <span className="t-sm" style={{color:'var(--engage)',fontWeight:700,minWidth:'24px',textAlign:'right'}} id="engage-val">3</span>
                </div>
                <input className="slider-field slider-engage" id="engage-slider" type="range" min="1" max="5" step="0.5" defaultValue="3" />
                <div className="row" style={{justifyContent:'space-between',marginTop:'6px'}}>
                  <span className="t-xs ink-3">Checked out</span>
                  <span className="t-xs ink-3">Absorbed</span>
                </div>
              </div>

              {/* Flow toggle — label outside for flush-left alignment, brand color, scale+glow+shimmer animation */}
              <div className="input-group">
                <label className="input-label">Flow state</label>
                <button className="toggle-row" id="flow-btn" onClick={() => window.toggleFlow()}>
                  <div className="t-sm ink-3" id="flow-subtitle">Time disappeared completely</div>
                  <div className="toggle-pill"></div>
                </button>
              </div>

              {/* Quick note — expanded textarea for richer reflection */}
              <div className="input-group">
                <label className="input-label">Note <span style={{fontWeight:400,color:'var(--ink-3)'}}>(optional)</span></label>
                <textarea className="field" id="log-note" placeholder="Any context or reflection…" rows={5} style={{resize:'none'}}></textarea>
              </div>

              <button className="btn btn-accent btn-full" onClick={() => window.saveEntry()} style={{marginTop:'4px'}}>Save activity</button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* SHEET: JOURNAL SORT & FILTER                       */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="overlay" id="journal-filter-overlay">
          <div className="sheet">
            <div className="sheet-handle"></div>
            <div className="sheet-header">
              <h2 className="t-h2">Sort &amp; Filter</h2>
              <button className="close-btn" onClick={() => window.closeJournalFilter()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="jf-section-label">Sort</div>
            <div className="stack gap-6" style={{marginBottom:'24px'}}>
              <button className="jf-option active" id="jf-recent"    onClick={() => { window.setJSort('recent');  window.closeJournalFilter(); }}>Most recent</button>
              <button className="jf-option"        id="jf-energy"    onClick={() => { window.setJSort('energy');  window.closeJournalFilter(); }}>Energy — low to high</button>
              <button className="jf-option"        id="jf-engage"    onClick={() => { window.setJSort('engage');  window.closeJournalFilter(); }}>Engagement — low to high</button>
            </div>

            <div className="jf-section-label">Filter</div>
            <div className="stack gap-6">
              <button className="jf-option active" id="jf-all"       onClick={() => { window.setJFlow('all');     window.closeJournalFilter(); }}>All entries</button>
              <button className="jf-option"        id="jf-flow-only" onClick={() => { window.setJFlow('flow');    window.closeJournalFilter(); }}>Flow only</button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* SHEET: SHARE / ENERGY MAP CARD                     */}
        {/* Populated by renderWrapped() from real S.entries   */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="overlay" id="wrapped-overlay" style={{alignItems:'center'}}>
          <div style={{width:'100%',maxWidth:'360px',padding:'0 4px',boxSizing:'border-box'}}>
            <div className="wrapped">
              <div className="wrapped-blob" style={{width:'280px',height:'280px',background:'rgba(92,79,207,0.55)',top:'-80px',left:'-60px'}}></div>
              <div className="wrapped-blob" style={{width:'220px',height:'220px',background:'rgba(123,110,232,0.35)',bottom:'-60px',right:'-40px'}}></div>
              <div className="wrapped-blob" style={{width:'160px',height:'160px',background:'rgba(92,79,207,0.3)',bottom:'80px',left:'20px'}}></div>

              <div className="w-rel stack gap-2">
                <div style={{fontSize:'0.6875rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.4)'}}>
                  Good Time Journal
                </div>
                <div style={{fontFamily:'var(--font-sans)',fontSize:'1.75rem',fontWeight:700,color:'#fff',lineHeight:1.15,letterSpacing:'-0.02em'}}>
                  Your Energy<br />Map
                </div>
              </div>

              {/* Top energizers — rendered by renderWrapped() from real data only */}
              <div className="w-rel stack gap-10" id="wrapped-top" style={{minHeight:'60px'}}></div>

              <div className="w-rel">
                {/* Data summary — deterministic, no AI-generated text */}
                <div id="wrapped-summary" style={{fontSize:'0.875rem',fontWeight:500,color:'rgba(255,255,255,0.65)',lineHeight:1.55}}></div>
                <div style={{fontSize:'0.6875rem',color:'rgba(255,255,255,0.2)',marginTop:'12px',letterSpacing:'0.04em'}}>goodtimejournal.app</div>
              </div>
            </div>

            <div className="stack gap-8 mt-12">
              <button className="btn btn-primary btn-full" onClick={() => window.copyLink()}>Copy shareable link</button>
              <button className="btn btn-secondary btn-full" onClick={() => window.closeWrapped()}>Done</button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* MODAL: GOOD TIME MAP                               */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="overlay" id="gtm-overlay" style={{alignItems:'center'}}>
          <div className="sheet" style={{maxWidth:'430px'}}>
            <div className="sheet-handle"></div>
            <div className="sheet-header">
              <h2 className="t-h2">Your Good Time Map</h2>
              <button className="close-btn" onClick={() => window.closeGoodTimeMap()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="t-body ink-2" style={{marginBottom:'20px',lineHeight:1.7}}>
              Your Good Time Map reveals what consistently energizes and engages you — so you can design more of what matters into your life.
            </p>

            {/* Example preview — clearly labeled, uses no real user data. JS adds 3D tilt on hover/drag. */}
            <div id="gtm-example-card" style={{background:'linear-gradient(145deg,#1a0533 0%,#0d1b3e 60%)',borderRadius:'var(--radius-lg)',padding:'16px 18px',marginBottom:'20px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:'-30px',right:'-30px',width:'120px',height:'120px',background:'rgba(92,79,207,0.6)',borderRadius:'50%',filter:'blur(35px)'}}></div>
              <div style={{position:'absolute',bottom:'-20px',left:'-20px',width:'100px',height:'100px',background:'rgba(123,110,232,0.4)',borderRadius:'50%',filter:'blur(25px)'}}></div>
              <div style={{position:'relative',zIndex:1}}>
                <div style={{fontSize:'0.625rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.35)',marginBottom:'14px'}}>Example</div>
                {[
                  {label:'Deep work sessions', score:'4.8', width:'93%', color:'#A78BFA'},
                  {label:'1:1 meetings',        score:'4.3', width:'80%', color:'#7B6EE8'},
                  {label:'Coffee chats',        score:'4.0', width:'74%', color:'#9F8FEF'},
                  {label:'Status reports',      score:'1.9', width:'32%', color:'#F87171'},
                ].map(({label,score,width,color}) => (
                  <div key={label} style={{marginBottom:'10px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px',alignItems:'center'}}>
                      <span style={{fontSize:'0.8125rem',color:'rgba(255,255,255,0.85)',fontWeight:500}}>{label}</span>
                      <span style={{fontSize:'0.8125rem',fontWeight:800,color}}>{score}</span>
                    </div>
                    <div style={{height:'4px',background:'rgba(255,255,255,0.08)',borderRadius:'2px',overflow:'hidden'}}>
                      <div style={{height:'100%',width,background:color,borderRadius:'2px'}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="t-xs ink-3" style={{marginBottom:'12px'}}>What your map will show</div>
            <div className="stack gap-10" style={{marginBottom:'24px'}}>
              {[
                'Most energizing activities',
                'Most engaging activities',
                'Flow patterns',
                'Where to spend more time',
              ].map((label) => (
                <div key={label} className="row gap-10">
                  <span style={{width:'5px',height:'5px',borderRadius:'50%',background:'var(--accent)',flexShrink:0,marginTop:'1px'}}></span>
                  <span className="t-body ink-2">{label}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-primary btn-full" onClick={() => window.closeGoodTimeMap()}>Got it</button>
          </div>
        </div>

        {/* Toast */}
        <div id="toast"></div>

      </div>

      <Script src="/gtj-script.js" strategy="afterInteractive" />
    </>
  );
}
