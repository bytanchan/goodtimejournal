// ── STATE ────────────────────────────────────────────
const S = {
  day: 1, streak: 0, flow: false,
  obStep: 0,
  entries: [],
  // Journal filter state (persists within session, resets on reload)
  jSort: 'recent',   // 'recent' | 'energy' | 'engage'
  jFlow: 'all',      // 'all' | 'flow'
  // 14-day cycle tracking
  cycleStart: null,  // ISO date of cycle start, null = no entries
  cycleNum: 1,       // current cycle number (1-indexed)
};

// Returns local date as YYYY-MM-DD — use everywhere instead of toISOString() to avoid UTC drift
function localDateStr(date) {
  const d = date || new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

const TODS = ['morning','day','night'];
const TOD_LABELS = {morning:'Morning', day:'Day', night:'Night'};
const TOD_CLASSES = {morning:'tod-morning', day:'tod-day', night:'tod-night'};
// Empty state microcopy per tod (requirement #4)
const TOD_PLACEHOLDERS = {
  morning: 'A fresh start — anything worth noting yet?',
  day:     "What's been shaping your day so far?",
  night:   'Anything noteworthy from this evening?',
};

// Brand color tones for slider fill gradient
const SLIDER_COLORS = { energy: '#7B6EE8', engage: '#5C4FCF', track: '#EDE8DE' };

// ── ROUTING ──────────────────────────────────────────
function goto(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); window.scrollTo(0,0); }
}

function goApp() {
  goto('s-today');
  showNav();
}

function showNav() {
  document.getElementById('bnav').classList.add('show');
  document.getElementById('fab').classList.remove('gone');
  setGreeting();
  renderAll();
}

function tab(t) {
  ['today','journal','patterns'].forEach(x => {
    document.getElementById('ni-'+x).classList.remove('active');
    document.getElementById('s-'+x).classList.remove('active');
  });
  document.getElementById('ni-'+t).classList.add('active');
  document.getElementById('s-'+t).classList.add('active');
  // FAB visible on Today and Journal; hidden on Insights
  document.getElementById('fab').classList.toggle('gone', t === 'patterns');
  window.scrollTo(0,0);
}

// ── GREETING ─────────────────────────────────────────
function setGreeting() {
  const h = new Date().getHours();
  const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  // Personalized greeting if name stored (requirement #3)
  const name = localStorage.getItem('gtjUserName');
  document.getElementById('greeting-line').textContent = name ? `${time}, ${name}` : time;
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  document.getElementById('hero-date').textContent = days[new Date().getDay()];
}

// ── ONBOARDING ───────────────────────────────────────
// Hydration guard: app starts at opacity:0 in CSS, JS reveals after checking localStorage.
// This prevents the onboarding screen from flashing on page refresh (requirement #1).
function showOnboard() {
  // Already onboarded: skip straight to app (or auth if no session)
  if (localStorage.getItem('gtjHasSeenOnboarding')) {
    goApp();
    return;
  }
  goto('s-onboard');
  S.obStep = 0;
  updateOb();
}

function obNext() {
  if (S.obStep < 2) {
    S.obStep++;
    updateOb();
    return;
  }

  // Final onboarding step — save name
  const nameInput = document.getElementById('ob-name');
  const name = nameInput ? nameInput.value.trim() : '';
  if (name) localStorage.setItem('gtjUserName', name);

  // Supabase configured → show sign-in screen.
  // Show the "Continue without account" skip button since user just came from onboarding.
  if (window.dbGetSession) {
    const skipBtn = document.getElementById('auth-skip-btn');
    if (skipBtn) skipBtn.style.display = '';
    goto('s-auth');
    return;
  }

  // No Supabase — go straight to app
  localStorage.setItem('gtjHasSeenOnboarding', '1');
  goApp();
}

// Called from the "Continue without account" button on the auth screen.
// Only reachable after onboarding — sets flag so they go straight to app on return.
function skipAuth() {
  localStorage.setItem('gtjHasSeenOnboarding', '1');
  goApp();
}
window.skipAuth = skipAuth;

function updateOb() {
  for (let i = 0; i < 3; i++) {
    document.getElementById('obs-'+i).style.display = i === S.obStep ? 'block' : 'none';
    document.getElementById('obd-'+i).classList.toggle('on', i === S.obStep);
  }
  document.getElementById('ob-btn').textContent = S.obStep < 2 ? 'Continue' : 'Start my journal';
}

// ── RENDER ────────────────────────────────────────────
function renderAll() {
  computeCycles(); // must run first — sets S.day, S.cycleNum, assigns e.day to all entries
  renderProgress();
  renderToday();
  renderJournal();
  renderPatterns();
}

function renderProgress() {
  // Streak badge — uses unique calendar dates, not cycle days
  const uniqueDates = new Set(S.entries.map(e => e.entry_date || dateFromCreatedAt(e))).size;
  const badge = document.getElementById('streak-badge');
  if (badge) {
    if (S.streak >= 2 && uniqueDates >= 2) {
      badge.style.display = '';
      badge.textContent = '🔥 ' + S.streak + '-day streak';
    } else {
      badge.style.display = 'none';
    }
  }

  // Week view: Mon–Sun of the current calendar week (all local dates)
  const now = new Date();
  const todayStr = localDateStr(now);
  const dow = now.getDay(); // local day-of-week, 0=Sun
  const mondayOffset = dow === 0 ? -6 : 1 - dow;

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dots = document.getElementById('day-dots');
  if (!dots) return;
  dots.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + mondayOffset + i);
    const dateStr = localDateStr(d);
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    const hasEntry = S.entries.some(e => (e.entry_date || dateFromCreatedAt(e)) === dateStr);

    const stateClass = isToday ? 'today' : hasEntry ? 'done' : isFuture ? 'future' : 'past-empty';
    const el = document.createElement('div');
    el.className = 'day-dot-week' + (isToday ? ' today-col' : '') + (!isFuture ? ' tappable' : '');
    el.innerHTML = `<div class="week-dot-label">${DAY_LABELS[i]}</div><div class="week-dot-num ${stateClass}">${d.getDate()}</div>`;

    if (!isFuture) {
      el.onclick = () => window.openLogWithDate(dateStr);
    }
    dots.appendChild(el);
  }
}

// Time-of-day determination (requirement #4):
// Morning: 5am–11:59am | Day: 12pm–4:59pm | Night: 5pm–4:59am
function getTodFromHour(h) {
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'day';
  return 'night';
}

function renderToday() {
  const todayStr = localDateStr();
  const todayEntries = S.entries.filter(e => (e.entry_date || dateFromCreatedAt(e)) === todayStr);
  const container = document.getElementById('tod-container');

  // Always render all three tod sections — even if empty (requirement #4)
  let html = '';
  TODS.forEach(tod => {
    const entries = todayEntries.filter(e => e.tod === tod);
    html += `
      <div class="tod-section">
        <div class="tod-header ${TOD_CLASSES[tod]}">
          <div class="tod-label">${TOD_LABELS[tod]}</div>
          <button onclick="openLogWithTod('${tod}')" style="background:none;border:none;cursor:pointer;color:inherit;opacity:0.7;font-size:1.2rem;padding:0 4px;" aria-label="Add ${tod} entry">+</button>
        </div>
        ${entries.length
          ? `<div class="stack gap-8">${entries.map(e => entryRowHTML(e)).join('')}</div>`
          : `<div class="tod-empty">${TOD_PLACEHOLDERS[tod]}</div>`
        }
      </div>`;
  });
  container.innerHTML = html;
}

// Entry row
function entryRowHTML(e) {
  const scoreStr = v => Number.isInteger(v) ? v : v.toFixed(1);
  return `
    <div class="entry-row" onclick="openLogEdit(${e.id})">
      <div class="entry-content">
        <div class="entry-name">${escapeHTML(e.name)}</div>
        <div class="entry-pills">
          <span class="pill pill-energy">Energy ${scoreStr(e.energy)}</span>
          <span class="pill pill-engage">Engage ${scoreStr(e.engage)}</span>
          ${e.flow ? '<span class="pill pill-flow">Flow</span>' : ''}
        </div>
        ${e.note ? `<div class="entry-note">${escapeHTML(e.note)}</div>` : ''}
      </div>
    </div>`;
}

// Formats an ISO date string as e.g. "Mon, Apr 7"
function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ── JOURNAL SORT / FILTER ─────────────────────────────
function setJSort(s) {
  S.jSort = s;
  renderJournal();
}

function setJFlow(f) {
  // Toggle between 'all' and 'flow' when called with 'toggle', or set directly
  if (f === 'toggle') {
    S.jFlow = S.jFlow === 'flow' ? 'all' : 'flow';
  } else {
    S.jFlow = f;
  }
  renderJournal();
}

function renderJournal() {
  // Update compact sort-filter button label
  const sortLabel = document.getElementById('journal-sort-label');
  if (sortLabel) {
    const labels = { recent: 'Most recent', energy: 'Energy ↑', engage: 'Engagement ↑' };
    sortLabel.textContent = labels[S.jSort] || 'Most recent';
  }

  // Sync jf-option active states in the bottom sheet
  ['jf-recent','jf-energy','jf-engage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', el.id === 'jf-' + S.jSort);
  });
  const jfAll      = document.getElementById('jf-all');
  const jfFlowOnly = document.getElementById('jf-flow-only');
  if (jfAll)      jfAll.classList.toggle('active',      S.jFlow === 'all');
  if (jfFlowOnly) jfFlowOnly.classList.toggle('active', S.jFlow === 'flow');

  // Apply flow filter
  let filtered = S.jFlow === 'flow' ? S.entries.filter(e => e.flow) : [...S.entries];

  // Apply sort
  if (S.jSort === 'energy') {
    filtered.sort((a, b) => b.energy - a.energy);
  } else if (S.jSort === 'engage') {
    filtered.sort((a, b) => b.engage - a.engage);
  } else {
    // recent: sort by entry_date desc, then by id desc as tiebreaker
    filtered.sort((a, b) => {
      const da = a.entry_date || dateFromCreatedAt(a);
      const db = b.entry_date || dateFromCreatedAt(b);
      if (da > db) return -1;
      if (da < db) return 1;
      return (b.id || 0) - (a.id || 0);
    });
  }

  const listEl = document.getElementById('journal-list');

  // Empty state for flow filter
  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="t-sm ink-3" style="padding:32px 0;text-align:center;">
      ${S.jFlow === 'flow' ? 'No flow entries yet — log one when time dissolves.' : 'No entries yet — start logging!'}
    </div>`;
    return;
  }

  // For 'recent' sort: group by entry_date for readable day headers
  if (S.jSort === 'recent') {
    const dateGroups = {};
    filtered.forEach(e => {
      const dateStr = e.entry_date || dateFromCreatedAt(e);
      if (!dateGroups[dateStr]) dateGroups[dateStr] = [];
      dateGroups[dateStr].push(e);
    });
    const sortedDates = Object.keys(dateGroups).sort((a, b) => b.localeCompare(a));
    listEl.innerHTML = sortedDates.map(dateStr => {
      const isToday = dateStr === localDateStr();
      const entries = dateGroups[dateStr];
      const label = isToday ? 'Today' : formatDateLabel(dateStr);
      return `
        <div>
          <div class="row gap-8" style="margin-bottom:10px;align-items:center;">
            <div class="t-xs ink-3">${label}</div>
          </div>
          <div class="stack gap-8">${entries.map(e => entryRowHTML(e)).join('')}</div>
        </div>`;
    }).join('');
  } else {
    // For energy/engage sorts: flat list, no day grouping
    listEl.innerHTML = `<div class="stack gap-8">${filtered.map(e => entryRowHTML(e)).join('')}</div>`;
  }
}

// Human-readable insight from actual quantitative data — no AI-style language
function generateInsight() {
  if (S.entries.length < 7) return null;

  const sorted = [...S.entries].sort((a,b) => (b.energy + b.engage) - (a.energy + a.engage));
  const top    = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const flowEntries = S.entries.filter(e => e.flow);
  const avgEnergy = S.entries.reduce((s,e) => s + e.energy, 0) / S.entries.length;
  const avgEngage = S.entries.reduce((s,e) => s + e.engage, 0) / S.entries.length;

  const parts = [];
  if (top) {
    const score = ((top.energy + top.engage) / 2).toFixed(1);
    parts.push(`"${escapeHTML(top.name)}" is your highest-rated activity (avg ${score}/5).`);
  }
  if (bottom && bottom.id !== top?.id) {
    const score = ((bottom.energy + bottom.engage) / 2).toFixed(1);
    parts.push(`"${escapeHTML(bottom.name)}" scores lowest at ${score}/5.`);
  }
  if (flowEntries.length > 0) {
    const names = flowEntries.map(e => `"${escapeHTML(e.name)}"`).slice(0, 2).join(' and ');
    parts.push(`Flow happened during ${names}.`);
  } else {
    parts.push('No flow moments yet — notice what gets you closest.');
  }
  if (avgEnergy >= 3.5 && avgEngage >= 3.5) {
    parts.push(`Overall energy (${avgEnergy.toFixed(1)}) and engagement (${avgEngage.toFixed(1)}) are both above the midpoint.`);
  } else if (avgEnergy < 3 && avgEngage < 3) {
    parts.push(`Both energy (${avgEnergy.toFixed(1)}) and engagement (${avgEngage.toFixed(1)}) average below midpoint — look for what you can reduce.`);
  }
  return parts.join(' ');
}

// Progressive insight reveal — no gating, no locks, more depth with more data
function renderPatterns() {
  const n = S.entries.length;
  const container = document.getElementById('pat-container');
  if (!container) return;

  // Share button — appear at ≥14 entries
  const shareBtn = document.getElementById('pat-share-btn');
  if (shareBtn) shareBtn.style.display = n >= 14 ? '' : 'none';

  // 0 entries
  if (n === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 0 24px;">
        <p class="t-body ink-2" style="line-height:1.75;">Log your first activity and insights will start to appear here.</p>
      </div>`;
    renderReflections();
    return;
  }

  let html = '';

  // ≥1 — overall metrics (energy, engagement, flow count across all entries)
  const avgE  = (S.entries.reduce((s,e)=>s+e.energy,0)/n).toFixed(1);
  const avgEn = (S.entries.reduce((s,e)=>s+e.engage,0)/n).toFixed(1);
  const flowCount = S.entries.filter(e=>e.flow).length;
  const entryLabel = n === 1 ? '1 entry' : n + ' entries';

  html += `
    <div style="margin-bottom:20px;">
      <div class="t-xs ink-3" style="margin-bottom:10px;">${entryLabel}</div>
      <div class="row gap-8">
        <div class="card-flat" style="flex:1;text-align:center;padding:14px 10px;">
          <div style="font-size:1.5rem;font-weight:800;color:var(--energy);line-height:1;">${avgE}</div>
          <div class="t-xs ink-3" style="margin-top:5px;">Energy</div>
        </div>
        <div class="card-flat" style="flex:1;text-align:center;padding:14px 10px;">
          <div style="font-size:1.5rem;font-weight:800;color:var(--engage);line-height:1;">${avgEn}</div>
          <div class="t-xs ink-3" style="margin-top:5px;">Engagement</div>
        </div>
        <div class="card-flat" style="flex:1;text-align:center;padding:14px 10px;">
          <div style="font-size:1.5rem;font-weight:800;color:var(--accent);line-height:1;">${flowCount}</div>
          <div class="t-xs ink-3" style="margin-top:5px;">Flow</div>
        </div>
      </div>
    </div>`;

  // ≥3 — best single activity
  if (n >= 3) {
    const sorted = [...S.entries].sort((a,b)=>(b.energy+b.engage)-(a.energy+a.engage));
    const best = sorted[0];
    const bestScore = ((best.energy+best.engage)/2).toFixed(1);
    html += `
      <div class="divider"></div>
      <div class="t-xs ink-3" style="margin-bottom:10px;">Highest rated</div>
      <div class="stack gap-8" style="margin-bottom:4px;">
        ${patRow(best,'top')}
      </div>`;
  }

  // ≥5 — top energizers + drains list
  if (n >= 5) {
    const sorted = [...S.entries].sort((a,b)=>(b.energy+b.engage)-(a.energy+a.engage));
    const confidenceNote = n < 10
      ? '<span style="font-size:0.6875rem;color:var(--ink-3);font-style:italic;font-weight:400;text-transform:none;letter-spacing:0;">early signal</span>'
      : '';
    html += `
      <div class="divider"></div>
      <div class="row gap-8" style="align-items:center;margin-bottom:10px;">
        <div class="t-xs ink-3">Top energizers</div>${confidenceNote}
      </div>
      <div class="stack gap-8" style="margin-bottom:16px;">
        ${sorted.slice(0,3).map(e=>patRow(e,'top')).join('')}
      </div>
      <div class="t-xs ink-3" style="margin-bottom:10px;">Biggest drains</div>
      <div class="stack gap-8" style="margin-bottom:4px;">
        ${[...sorted].reverse().slice(0,3).map(e=>patRow(e,'drain')).join('')}
      </div>`;
  }

  // ≥7 — flow moments + pattern insight
  if (n >= 7) {
    const flow = S.entries.filter(e=>e.flow);
    html += `
      <div class="divider"></div>
      <div class="t-xs ink-3" style="margin-bottom:10px;">Flow moments</div>
      <div class="stack gap-8" style="margin-bottom:16px;">
        ${flow.length
          ? flow.map(e=>`
              <div class="row gap-12" style="align-items:center;">
                <div style="flex:1;"><div class="t-h3">${escapeHTML(e.name)}</div><div class="t-sm ink-3">${e.entry_date ? formatDateLabel(e.entry_date) : ''}</div></div>
                <span class="pill pill-flow">Flow</span>
              </div>`).join('<div class="divider" style="margin:8px 0;"></div>')
          : '<div class="t-sm ink-3">No flow moments logged yet.</div>'}
      </div>
      <div class="card-flat" style="border-color:rgba(92,79,207,0.2);margin-bottom:4px;">
        <div class="t-xs" style="color:var(--accent);margin-bottom:8px;">✦ Pattern insight</div>
        <div class="t-body" style="line-height:1.7;">${generateInsight() || 'Keep logging to see your full pattern emerge.'}</div>
      </div>`;
  }

  // ≥14 — full energy map + share
  if (n >= 14) {
    html += `
      <div class="divider"></div>
      <button class="btn btn-secondary btn-full" style="margin-bottom:4px;" onclick="window.openWrapped()">View your Energy Map ↗</button>`;
  }

  container.innerHTML = html;
  renderReflections();
}

function patRow(e, type) {
  const score = ((e.energy+e.engage)/2).toFixed(1);
  const pct   = ((e.energy+e.engage)/10)*100;
  const color = type === 'top'
    ? 'linear-gradient(90deg,var(--accent),var(--accent-2))'
    : 'linear-gradient(90deg,var(--error),#F87171)';
  // Score shown prominently: larger font-size, heavier weight
  return `
    <div class="card" style="padding:14px;">
      <div class="row gap-10" style="margin-bottom:8px;align-items:center;">
        <span style="flex:1;font-weight:600;font-size:0.9375rem;">${e.name}</span>
        <span style="font-weight:800;font-size:1rem;color:${type==='top'?'var(--accent)':'var(--error)'};">${score}</span>
      </div>
      <div class="bar-track"><div class="p-bar" style="width:${pct}%;background:${color};"></div></div>
    </div>`;
}

// ── CYCLE MODEL ───────────────────────────────────────
// 14-day cycles starting from the user's first logged entry date.
// Assigns e.day and e.cycleNum to all entries in S.entries.

function dateFromCreatedAt(e) {
  if (e.created_at) return localDateStr(new Date(e.created_at));
  return localDateStr();
}

function computeCycles() {
  if (!S.entries.length) {
    S.cycleStart = null;
    S.cycleNum = 1;
    S.day = 1;
    return;
  }

  // Find the earliest entry date (use entry_date if available, else created_at)
  const dates = S.entries.map(e => e.entry_date || dateFromCreatedAt(e)).sort();
  const firstDateStr = dates[0];
  const firstDate = new Date(firstDateStr + 'T00:00:00');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = Math.floor((today - firstDate) / 86400000); // 0-indexed days since first entry
  S.cycleNum = Math.floor(totalDays / 14) + 1;
  const cycleStartOffset = (S.cycleNum - 1) * 14;
  const cycleStartDate = new Date(firstDate);
  cycleStartDate.setDate(cycleStartDate.getDate() + cycleStartOffset);
  S.cycleStart = cycleStartDate.toISOString().split('T')[0];

  const dayInCycle = totalDays - cycleStartOffset + 1; // 1–14
  S.day = Math.max(1, Math.min(14, dayInCycle));

  // Assign each entry its cycleNum and day within that cycle
  S.entries.forEach(e => {
    const eDateStr = e.entry_date || dateFromCreatedAt(e);
    const eDate = new Date(eDateStr + 'T00:00:00');
    const eDays = Math.floor((eDate - firstDate) / 86400000);
    e.cycleNum = Math.floor(eDays / 14) + 1;
    e.day = (eDays % 14) + 1; // 1–14
  });
}

// ── LOG SHEET ─────────────────────────────────────────
let logTod = 'day';
let editingId = null;

function openLog() {
  openLogWithTod(getTodFromHour(new Date().getHours()));
}

// Opens log form with a specific date pre-filled — used by day-dot backfill taps
function openLogWithDate(dateStr) {
  openLogWithTod(getTodFromHour(new Date().getHours()));
  const dateField = document.getElementById('log-date');
  if (dateField) dateField.value = dateStr;
}

function openLogWithTod(tod) {
  editingId = null;
  logTod = tod;
  S.flow = false;
  const btn = document.getElementById('flow-btn');
  btn.classList.remove('on', 'flow-pop', 'flow-shimmer');
  document.getElementById('log-name').value = '';
  document.getElementById('log-note').value = '';
  document.getElementById('energy-slider').value = 3;
  document.getElementById('engage-slider').value = 3;
  // Default date to today (local) for new entries
  const dateField = document.getElementById('log-date');
  if (dateField) dateField.value = localDateStr();
  // Reset flow subtitle to default
  const sub = document.getElementById('flow-subtitle');
  if (sub) sub.textContent = 'Time disappeared completely';
  updateSliderFill();
  const title = document.getElementById('log-overlay-title');
  if (title) title.textContent = 'Log activity';
  document.getElementById('log-overlay').classList.add('open');
  setTimeout(() => document.getElementById('log-name').focus(), 320);
}

// Edit existing entry — pre-fills all form values (requirement #10)
function openLogEdit(id) {
  const entry = S.entries.find(e => e.id === id);
  if (!entry) return;
  editingId = id;
  logTod = entry.tod;
  S.flow = entry.flow || false;
  const btn = document.getElementById('flow-btn');
  btn.classList.toggle('on', S.flow);
  btn.classList.remove('flow-pop', 'flow-shimmer');
  document.getElementById('log-name').value = entry.name;
  document.getElementById('log-note').value = entry.note || '';
  document.getElementById('energy-slider').value = entry.energy;
  document.getElementById('engage-slider').value = entry.engage;
  // Pre-fill date from entry_date, or fall back to dateFromCreatedAt
  const dateField = document.getElementById('log-date');
  if (dateField) dateField.value = entry.entry_date || dateFromCreatedAt(entry);
  // Update flow subtitle to reflect current state
  const sub = document.getElementById('flow-subtitle');
  if (sub) sub.textContent = S.flow ? 'In flow — time dissolved.' : 'Time disappeared completely';
  updateSliderFill();
  const title = document.getElementById('log-overlay-title');
  if (title) title.textContent = 'Edit activity';
  document.getElementById('log-overlay').classList.add('open');
  setTimeout(() => document.getElementById('log-name').focus(), 320);
}

function closeLog() { document.getElementById('log-overlay').classList.remove('open'); }

// Slider fill: renders colored gradient up to thumb position
function updateSliderFill() {
  const pairs = [
    { el: document.getElementById('energy-slider'), color: SLIDER_COLORS.energy, valEl: document.getElementById('energy-val') },
    { el: document.getElementById('engage-slider'), color: SLIDER_COLORS.engage, valEl: document.getElementById('engage-val') },
  ];
  pairs.forEach(({ el, color, valEl }) => {
    if (!el) return;
    const pct = ((parseFloat(el.value) - parseFloat(el.min)) / (parseFloat(el.max) - parseFloat(el.min))) * 100;
    el.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, ${SLIDER_COLORS.track} ${pct}%, ${SLIDER_COLORS.track} 100%)`;
    if (valEl) {
      const v = parseFloat(el.value);
      valEl.textContent = Number.isInteger(v) ? String(v) : v.toFixed(1);
    }
  });
}

// Flow toggle — brand color, clean toggle, scale+glow+shimmer animation
// Uses reflow trick so animations re-fire each time toggled on.
function toggleFlow() {
  S.flow = !S.flow;
  const btn = document.getElementById('flow-btn');
  btn.classList.toggle('on', S.flow);

  // Update state-aware subtitle text
  const sub = document.getElementById('flow-subtitle');
  if (sub) {
    sub.textContent = S.flow ? 'In flow — time dissolved.' : 'Time disappeared completely';
  }

  if (S.flow) {
    // Shimmer sweep — reflow trick ensures it re-fires on repeat toggles
    btn.classList.remove('flow-shimmer');
    void btn.offsetWidth;
    btn.classList.add('flow-shimmer');
    btn.addEventListener('animationend', () => btn.classList.remove('flow-shimmer'), { once: true });

    // Haptic feedback on mobile
    if (navigator.vibrate) navigator.vibrate(8);

    // Pop animation
    btn.classList.remove('flow-pop');
    void btn.offsetWidth;
    btn.classList.add('flow-pop');
  }
}

async function saveEntry(e) {
  if (e) e.preventDefault();

  const name = document.getElementById('log-name').value.trim();
  if (!name) {
    const f = document.getElementById('log-name');
    f.classList.add('error');
    setTimeout(() => f.classList.remove('error'), 600);
    f.focus();
    return;
  }

  const energy = parseFloat(document.getElementById('energy-slider').value);
  const engage = parseFloat(document.getElementById('engage-slider').value);
  const note   = document.getElementById('log-note').value.trim();
  // Read entry_date from date field; fall back to today
  const dateFieldVal = document.getElementById('log-date')?.value;
  const entry_date = dateFieldVal || new Date().toISOString().split('T')[0];

  // Update existing entry and save to Supabase (requirement #10)
  if (editingId !== null) {
    const idx = S.entries.findIndex(e => e.id === editingId);
    if (idx !== -1) {
      S.entries[idx] = { ...S.entries[idx], name, energy, engage, flow: S.flow, note, entry_date };
      closeLog();
      renderAll();
      toast('Activity updated ✓');
      if (window.dbUpdateEntry) {
        try {
          await window.dbUpdateEntry(editingId, { name, energy, engage, flow: S.flow, note, entry_date });
        } catch (err) {
          console.error('Supabase update failed:', err?.message ?? err);
        }
      }
    }
    return;
  }

  const entry = { name, energy, engage, flow: S.flow, note, day: S.day, tod: logTod, entry_date };

  if (window.dbSaveEntry) {
    try {
      const data = await window.dbSaveEntry(entry);
      S.entries.unshift({ ...entry, id: data.id });
      closeLog();
      renderAll();
      toast('Activity saved ✓');
    } catch (err) {
      // Supabase not configured or unavailable — save locally so the user isn't blocked
      console.warn('Supabase unavailable, saving locally:', err?.message ?? err);
      S.entries.unshift({ ...entry, id: Date.now() });
      closeLog();
      renderAll();
      toast('Activity saved ✓');
    }
  } else {
    S.entries.unshift({ ...entry, id: Date.now() });
    closeLog();
    renderAll();
    toast('Activity saved ✓');
  }
}

// ── REFLECTIONS ───────────────────────────────────────
function saveReflection() {
  const textarea = document.getElementById('reflection-text');
  const text = textarea ? textarea.value.trim() : '';
  if (!text) return;

  const reflections = JSON.parse(localStorage.getItem('gtjReflections') || '[]');
  reflections.unshift({ id: Date.now(), text, created_at: new Date().toISOString() });
  localStorage.setItem('gtjReflections', JSON.stringify(reflections));
  textarea.value = '';
  renderReflections();
  toast('Reflection saved ✓');
}

function editReflection(id) {
  const reflections = JSON.parse(localStorage.getItem('gtjReflections') || '[]');
  const ref = reflections.find(r => r.id === id);
  if (!ref) return;
  const textarea = document.getElementById('reflection-text');
  if (textarea) textarea.value = ref.text;
  const updated = reflections.filter(r => r.id !== id);
  localStorage.setItem('gtjReflections', JSON.stringify(updated));
  renderReflections();
  if (textarea) textarea.focus();
}

function renderReflections() {
  const historyEl = document.getElementById('reflection-history');
  if (!historyEl) return;
  const reflections = JSON.parse(localStorage.getItem('gtjReflections') || '[]');
  if (!reflections.length) { historyEl.innerHTML = ''; return; }

  historyEl.innerHTML = `
    <div class="t-xs ink-3" style="margin-bottom:10px;">Past reflections</div>
    <div class="stack gap-8">
      ${reflections.map(r => `
        <div class="card-flat" style="padding:14px;">
          <div class="t-body" style="line-height:1.6;margin-bottom:8px;">${r.text}</div>
          <div class="row" style="justify-content:space-between;align-items:center;">
            <div class="t-xs ink-3">${new Date(r.created_at).toLocaleDateString()}</div>
            <button onclick="editReflection(${r.id})" style="font-size:0.75rem;font-weight:600;color:var(--accent);background:none;border:none;cursor:pointer;">Edit</button>
          </div>
        </div>`).join('')}
    </div>`;
}

// ── JOURNAL SORT/FILTER SHEET ─────────────────────────
function openJournalFilter() {
  // Sync active states before opening so they match current state
  renderJournal();
  const overlay = document.getElementById('journal-filter-overlay');
  if (overlay) overlay.classList.add('open');
}

function closeJournalFilter() {
  const overlay = document.getElementById('journal-filter-overlay');
  if (overlay) overlay.classList.remove('open');
}

// ── GOOD TIME MAP ─────────────────────────────────────
function openGoodTimeMap() {
  document.getElementById('gtm-overlay').classList.add('open');
  initGTMTilt();
}
function closeGoodTimeMap() {
  document.getElementById('gtm-overlay').classList.remove('open');
}

// Tilt animation on the example card — hover (desktop) + touch-drag (mobile)
function initGTMTilt() {
  const card = document.getElementById('gtm-example-card');
  if (!card || card._tiltInit) return;
  card._tiltInit = true;
  const MAX = 10; // max tilt degrees

  function applyTilt(clientX, clientY) {
    const r = card.getBoundingClientRect();
    const rx = ((clientY - (r.top  + r.height / 2)) / (r.height / 2)) * -MAX;
    const ry = ((clientX - (r.left + r.width  / 2)) / (r.width  / 2)) *  MAX;
    card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.025)`;
  }
  function resetTilt() {
    card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)';
  }

  card.addEventListener('mousemove',  e => applyTilt(e.clientX, e.clientY));
  card.addEventListener('mouseleave', resetTilt);
  card.addEventListener('touchmove',  e => {
    const t = e.touches[0];
    applyTilt(t.clientX, t.clientY);
  }, { passive: true });
  card.addEventListener('touchend', resetTilt);
}

// ── WRAPPED ───────────────────────────────────────────
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderWrapped() {
  const topEl     = document.getElementById('wrapped-top');
  const summaryEl = document.getElementById('wrapped-summary');
  if (!topEl || !summaryEl) return;

  if (!S.entries.length) {
    topEl.innerHTML = '';
    summaryEl.textContent = 'Log activities to generate your energy map.';
    return;
  }

  // Top 3 by combined energy + engagement score
  const sorted = [...S.entries].sort((a, b) => (b.energy + b.engage) - (a.energy + a.engage));
  const top3 = sorted.slice(0, 3);

  topEl.innerHTML = top3.map(e => {
    const avg = ((e.energy + e.engage) / 2).toFixed(1);
    const flowBadge = e.flow
      ? '<span style="font-size:0.6rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;background:rgba(255,255,255,0.18);border-radius:100px;padding:2px 7px;margin-left:6px;">FLOW</span>'
      : '';
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div style="font-size:0.8125rem;font-weight:600;color:rgba(255,255,255,0.9);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(e.name)}${flowBadge}</div>
        <div style="font-size:0.875rem;font-weight:800;color:#fff;flex-shrink:0;">${avg}</div>
      </div>`;
  }).join('');

  // Deterministic summary: counts and averages only — no AI-style language
  const avgE  = (S.entries.reduce((s, e) => s + e.energy, 0) / S.entries.length).toFixed(1);
  const avgEn = (S.entries.reduce((s, e) => s + e.engage, 0) / S.entries.length).toFixed(1);
  const flowCount = S.entries.filter(e => e.flow).length;
  const parts = [
    `${S.entries.length} ${S.entries.length === 1 ? 'activity' : 'activities'} logged.`,
    `Avg energy ${avgE} · engagement ${avgEn}.`,
  ];
  if (flowCount > 0) {
    parts.push(`${flowCount} flow ${flowCount === 1 ? 'moment' : 'moments'}.`);
  }
  summaryEl.textContent = parts.join(' ');
}

function openWrapped()  {
  renderWrapped();
  document.getElementById('wrapped-overlay').classList.add('open');
}
function closeWrapped() { document.getElementById('wrapped-overlay').classList.remove('open'); }
function copyLink() {
  const url = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      toast('Link copied to clipboard 📋');
    }).catch(() => {
      // Clipboard permission denied — fall back to prompt
      prompt('Copy this link:', url);
    });
  } else {
    prompt('Copy this link:', url);
  }
  closeWrapped();
}

// ── TOAST ─────────────────────────────────────────────
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateY(0)';
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(12px)';
  }, 2200);
}

// ── CLOSE ON BACKDROP CLICK ───────────────────────────
['log-overlay','wrapped-overlay','gtm-overlay','journal-filter-overlay'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', function(ev) {
    if (ev.target === this) this.classList.remove('open');
  });
});

// ── SLIDER LISTENERS ──────────────────────────────────
const energySlider = document.getElementById('energy-slider');
const engageSlider = document.getElementById('engage-slider');
if (energySlider) energySlider.addEventListener('input', updateSliderFill);
if (engageSlider) engageSlider.addEventListener('input', updateSliderFill);

// ── AUTH ──────────────────────────────────────────────
async function handleSignIn() {
  const btn = document.getElementById('google-signin-btn');
  if (btn) { btn.textContent = 'Signing in…'; btn.disabled = true; }
  try {
    await window.dbSignIn();
    // Page will redirect to Google and back — onAuthStateChange handles the return
  } catch (err) {
    console.error('Sign-in failed:', err?.message ?? err);
    if (btn) { btn.textContent = 'Try again'; btn.disabled = false; }
    toast('Sign-in failed — please try again.');
  }
}
window.handleSignIn = handleSignIn;

async function handleSignOut() {
  try {
    if (window.dbSignOut) await window.dbSignOut();
  } catch (err) {
    console.warn('Sign-out error:', err?.message ?? err);
  }
  // Clear session state — keep gtjHasSeenOnboarding so returning user sees auth, not onboarding again
  S.entries = [];
  localStorage.removeItem('gtjUserName');
  document.getElementById('bnav').classList.remove('show');
  document.getElementById('fab').classList.add('gone');
  // Hide skip button — returning signed-out users should be nudged to sign in, not skip
  const skipBtn = document.getElementById('auth-skip-btn');
  if (skipBtn) skipBtn.style.display = 'none';
  goto('s-auth');
}
window.handleSignOut = handleSignOut;

// ── INIT ─────────────────────────────────────────────
setGreeting();
const appEl = document.getElementById('app');
if (appEl) appEl.style.opacity = '1';

async function initApp() {
  const hasOnboarded = !!localStorage.getItem('gtjHasSeenOnboarding');

  // If Supabase isn't configured (no env vars), skip auth entirely
  if (!window.dbGetSession) {
    if (hasOnboarded) { goApp(); } else { goto('s-land'); }
    return;
  }

  try {
    // Subscribe to auth state changes — handles both initial load and OAuth redirect return
    window.dbOnAuthStateChange(function(session) {
      if (session) {
        // Signed in — show sign-out button, load data, go to app
        const signoutBtn = document.getElementById('signout-btn');
        if (signoutBtn) signoutBtn.style.display = '';
        localStorage.setItem('gtjHasSeenOnboarding', '1'); // signing in implies onboarded
        goApp();
      } else {
        // No session
        document.getElementById('bnav').classList.remove('show');
        document.getElementById('fab').classList.add('gone');
        if (hasOnboarded) {
          // Returning user who signed out — go straight to sign-in, no skip button
          const skipBtn = document.getElementById('auth-skip-btn');
          if (skipBtn) skipBtn.style.display = 'none';
          goto('s-auth');
        } else {
          // Brand new user — show landing, let them reach auth via onboarding
          goto('s-land');
        }
      }
    });

    // Kick off initial session check — callback above fires synchronously if session cached
    const session = await window.dbGetSession();
    if (!session) {
      // No cached session — route based on onboarding state
      if (hasOnboarded) {
        const skipBtn = document.getElementById('auth-skip-btn');
        if (skipBtn) skipBtn.style.display = 'none';
        goto('s-auth');
      } else {
        goto('s-land');
      }
    }
  } catch (err) {
    console.warn('Auth init failed, falling back to no-auth mode:', err?.message ?? err);
    if (hasOnboarded) { goApp(); } else { goto('s-land'); }
  }
}

initApp();

// ── LOAD FROM DB ──────────────────────────────────────
async function loadFromDB() {
  let attempts = 0;
  while (!window.dbLoadEntries && attempts < 10) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }
  if (!window.dbLoadEntries) {
    console.warn('loadFromDB: window.dbLoadEntries not available, using demo data');
    computeDayAndStreakFromDemoData();
    return;
  }
  try {
    const rows = await window.dbLoadEntries();
    if (rows.length) {
      // Map each entry — preserve entry_date if present, else derive from created_at
      // computeCycles() will assign day numbers based on entry_date
      S.entries = rows.map(r => {
        const entryDate = new Date(r.created_at);
        const tod = r.tod === 'evening' ? 'night' : (r.tod || getTodFromHour(entryDate.getHours()));
        // Ensure entry_date is always set — use created_at date as fallback
        const entry_date = r.entry_date || new Date(r.created_at).toISOString().split('T')[0];
        return { ...r, id: r.id ?? Date.now(), tod, entry_date };
      });

      // Compute streak from unique calendar dates (uses entry_date if available)
      S.streak = computeStreakFromRows(rows);

      // computeCycles() is called by renderAll() — sets S.day, S.cycleNum, assigns e.day
      renderAll();
    } else {
      // No DB entries — compute from demo data
      computeDayAndStreakFromDemoData();
    }
  } catch (err) {
    console.warn('Supabase load failed:', err?.message ?? err);
    computeDayAndStreakFromDemoData();
  }
}

// Computes streak from rows using entry_date (or created_at as fallback)
function computeStreakFromRows(rows) {
  if (!rows.length) return 0;
  const todayStr = localDateStr();
  const uniqueDates = new Set(rows.map(r => r.entry_date || localDateStr(new Date(r.created_at))));
  let streak = 0;
  const check = new Date();
  while (uniqueDates.has(localDateStr(check))) {
    streak++;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

// Fallback: infer day and streak from demo/local data.
// If entries have entry_date, computeCycles() will handle them properly.
// Otherwise fall back to the integer day field.
function computeDayAndStreakFromDemoData() {
  if (S.entries.length) {
    // Ensure entries that lack entry_date get one derived from day number
    // (local entries created before retroactive logging feature)
    // computeCycles() handles entries that have entry_date; for those without it,
    // we set a synthetic entry_date based on today minus (S.day - e.day) days.
    const hasEntryDates = S.entries.some(e => e.entry_date);
    if (!hasEntryDates) {
      // No entry_dates — fall back to numeric day field for legacy compatibility
      const maxDay = Math.max(...S.entries.map(e => e.day || 1));
      S.day = maxDay;
      const uniqueDays = new Set(S.entries.map(e => e.day));
      let streak = 0, d = S.day;
      while (uniqueDays.has(d)) { streak++; d--; }
      S.streak = streak;
    }
    // computeCycles() is called within renderAll()
  }
  renderAll();
}

loadFromDB();
