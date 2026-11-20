// Leonida Legend — GTA VI trophy tracker.
// Loads app/data/trophies.json (the only runtime fetch, a file of this app),
// saves earned trophies in localStorage, and renders the checklist, the
// detail pane, the platinum roadmap and the missables page. No network use.
const KEY = 'gta6-trophy-checklist';
const PREFS_KEY = 'gta6-trophy-prefs';
const params = new URLSearchParams(location.search);

// Fixed demo set for screenshots only (?seed=13): 13 early trophies.
const SEED_IDS = [2, 3, 8, 18, 20, 21, 28, 33, 35, 44, 46, 52, 53];
const KIND_LABELS = {
  story: 'Story', side: 'Side quests', activities: 'Activities',
  collectibles: 'Collectibles', exploration: 'Exploration',
  combat: 'Combat', money: 'Money', platinum: 'Platinum',
};
const KIND_FILTERS = [
  ['all', 'All'], ['story', 'Story'], ['missable', 'Missable'],
  ['collectibles', 'Collectibles'], ['activities', 'Activities'],
  ['side', 'Side quests'], ['exploration', 'Exploration'],
  ['combat', 'Combat'], ['money', 'Money'], ['online', 'Online'],
];
const STAGES = [
  { n: 1, title: 'Play the story', body: 'Chapters 1–4 plus the final mission, in order. Twelve story trophies unlock here and none can be missed. While you play, build the habits that pay off later: meditate at every spot you find (the one possibly missable trophy), try activities as you pass them, and scan new things with WAiNK.' },
  { n: 2, title: 'Side strands and strangers', body: 'Finish the five named character strands (Andy, Kenton, Billy, Randy, Tyrone) and eight stranger mission strands across Leonida. Strands appear on the map as the story opens up the state; clear them as they appear rather than leaving them all for the end.' },
  { n: 3, title: 'Activities, skills and combat', body: 'The big skill grinds live here: 250 stunts, gold in all 42 Shooting Range challenges, drone races at all 14 locations, 20 different race wins, 50 of 80 challenges, and the combat set — Combat Focus, tanks, vaults, armored trucks, gang operations and the partner robberies.' },
  { n: 4, title: 'Collectibles, exploration and money', body: 'Meditation spots (18), card sets (3 of 18), WAiNK scans (100), exploring every area of Leonida, discovering 100 vehicles, laundering $250,000 in Marked Bills, spending $100,000 in shops, buying all 8 garages and registering 10 vehicles to Scooter Bros.' },
  { n: 5, title: 'Cleanup and the platinum', body: 'Check the 100% completion checklist under Progress > Stats and close out whatever is left — it needs 300 stunts, all 8 bank vaults and the rest of the checklist. When it hits 100%, A Long Road (gold) pops, and Vice Got a Price! (platinum) follows automatically.' },
];

let doc = null;
let earned = new Set();
let prefs = { kind: 'all', grade: 'all', hideEarned: false, spoiler: false, q: '' };
let selectedId = null;

try { earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); } catch { earned = new Set(); }
try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}')); } catch { /* keep defaults */ }
if (params.get('seed') === '13') earned = new Set(SEED_IDS.map(String));
if (params.get('spoiler') === 'on') prefs.spoiler = true;
if (params.get('view')) prefs.view = params.get('view');
if (params.get('open')) selectedId = Number(params.get('open'));

const rowsEl = document.getElementById('rows');
const detailEl = document.getElementById('detail');

function saveProgress() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}
function savePrefs() {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
function isEarned(t) { return earned.has(String(t.id)); }
function isHidden(t) { return t.kind === 'story' && prefs.spoiler && !isEarned(t); }
function gradeName(g) { return g[0].toUpperCase() + g.slice(1); }

function filteredTrophies() {
  const q = prefs.q.trim().toLowerCase();
  return doc.trophies.filter((t) => {
    if (prefs.kind === 'missable' && !t.missable) return false;
    if (prefs.kind === 'online') return false;
    if (prefs.kind !== 'all' && prefs.kind !== 'missable' && t.kind !== prefs.kind) return false;
    if (prefs.grade !== 'all' && t.grade !== prefs.grade) return false;
    if (prefs.hideEarned && isEarned(t)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + (t.guide || '')).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderProgress() {
  const total = doc.trophies.length;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  document.getElementById('earnedCount').textContent = n;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = n + ' of ' + total + ' earned — ' + pct + '%';
  const counts = {};
  for (const t of doc.trophies) if (isEarned(t)) counts[t.grade] = (counts[t.grade] || 0) + 1;
  document.getElementById('gradeCounts').textContent =
    'Platinum ' + (counts.platinum || 0) + '/1 · Gold ' + (counts.gold || 0) + '/2 · Silver ' +
    (counts.silver || 0) + '/6 · Bronze ' + (counts.bronze || 0) + '/46';
}

function renderChips() {
  const box = document.getElementById('kindChips');
  box.replaceChildren();
  for (const [key, label] of KIND_FILTERS) {
    const count = key === 'all' ? doc.trophies.length
      : key === 'missable' ? doc.trophies.filter((t) => t.missable).length
      : key === 'online' ? 0
      : doc.trophies.filter((t) => t.kind === key).length;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (prefs.kind === key ? ' active' : '');
    b.textContent = label + ' ';
    const n = document.createElement('span');
    n.className = 'n';
    n.textContent = '(' + count + ')';
    b.append(n);
    b.addEventListener('click', () => { prefs.kind = key; savePrefs(); renderAll(); });
    box.append(b);
  }
}

function renderRows() {
  const list = filteredTrophies();
  rowsEl.replaceChildren();
  document.getElementById('listHint').textContent =
    'Showing ' + list.length + ' of ' + doc.trophies.length + ' trophies' +
    (prefs.kind === 'online' ? ' — the game has no online trophies, so this list is empty by design.' : '') +
    (prefs.spoiler ? ' Spoiler-free is on: un-earned story trophies are hidden.' : '');
  for (const t of list) {
    const tr = document.createElement('tr');
    tr.className = (isEarned(t) ? 'earned-row ' : '') + (selectedId === t.id ? 'selected' : '');
    const hidden = isHidden(t);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'tick';
    box.checked = isEarned(t);
    box.setAttribute('aria-label', 'Earned: ' + t.name);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(String(t.id)); else earned.delete(String(t.id));
      saveProgress(); renderAll();
    });
    box.addEventListener('click', (e) => e.stopPropagation());
    const tdBox = document.createElement('td'); tdBox.append(box); tr.append(tdBox);
    const tdName = document.createElement('td');
    const name = document.createElement('div');
    name.className = 't-name';
    name.textContent = hidden ? 'Hidden story trophy' : t.name;
    const desc = document.createElement('div');
    desc.className = 't-desc';
    desc.textContent = hidden ? 'Earn this trophy to reveal its name and description.' : t.description;
    tdName.append(name, desc);
    if (t.target && !hidden) {
      const tg = document.createElement('div');
      tg.className = 't-target';
      tg.textContent = 'Target: ' + t.target;
      tdName.append(tg);
    }
    if (t.missable) {
      const b = document.createElement('span');
      b.className = 'badge miss'; b.textContent = 'MISSABLE';
      name.append(b);
    }
    if (t.hidden && !hidden) {
      const b = document.createElement('span');
      b.className = 'badge hidden-badge'; b.textContent = 'HIDDEN';
      name.append(b);
    }
    tr.append(tdName);
    const tdGrade = document.createElement('td');
    tdGrade.className = 'grade-' + t.grade;
    tdGrade.innerHTML = '';
    const dot = document.createElement('span'); dot.className = 'grade-dot'; tdGrade.append(dot, document.createTextNode(gradeName(t.grade)));
    tr.append(tdGrade);
    const tdKind = document.createElement('td');
    tdKind.textContent = KIND_LABELS[t.kind] || t.kind;
    tr.append(tdKind);
    tr.addEventListener('click', () => { selectedId = t.id; renderAll(); });
    rowsEl.append(tr);
  }
}

function renderDetail() {
  const t = doc.trophies.find((x) => x.id === selectedId) || filteredTrophies()[0] || doc.trophies[0];
  if (!t) { detailEl.replaceChildren(); return; }
  selectedId = t.id;
  detailEl.replaceChildren();
  const hidden = isHidden(t);
  const h = document.createElement('h2');
  h.textContent = hidden ? 'Hidden story trophy' : t.name;
  detailEl.append(h);
  const grade = document.createElement('p');
  grade.className = 'meta';
  const dot = document.createElement('span'); dot.className = 'grade-dot dot-' + t.grade;
  grade.append(dot, document.createTextNode(gradeName(t.grade) + ' · ' + (KIND_LABELS[t.kind] || t.kind) +
    (t.missable ? ' · ⚠ possibly missable' : '') + (t.hidden ? ' · hidden on PSN' : '')));
  detailEl.append(grade);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = hidden ? 'Name and description hidden until earned (spoiler-free is on).' : '“' + t.description + '” — official description, as PlayStation publishes it.';
  detailEl.append(official);
  if (t.target && !hidden) {
    const tg = document.createElement('p');
    tg.className = 'meta'; tg.textContent = 'PSN progress target: ' + t.target;
    detailEl.append(tg);
  }
  const gh = document.createElement('h3'); gh.textContent = 'Guide'; detailEl.append(gh);
  const g = document.createElement('p');
  g.className = 'guide-text';
  g.textContent = hidden ? 'Earn this story trophy to reveal its guide.' : t.guide;
  detailEl.append(g);
  if (!hidden) {
    const sh = document.createElement('h3'); sh.textContent = 'Sources'; detailEl.append(sh);
    const ul = document.createElement('ul');
    for (const s of t.sources || []) {
      const li = document.createElement('li'); li.textContent = s; ul.append(li);
    }
    detailEl.append(ul);
    const pick = document.createElement('p');
    pick.className = 'pick';
    pick.textContent = 'Guides here are written in our own words for this entry and cite their sources; nothing is copied from another guide.';
    detailEl.append(pick);
  } else {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Spoiler-free is on. Untick it above to reveal story trophies before you earn them.';
    detailEl.append(note);
  }
}

function renderRoadmap() {
  const box = document.getElementById('stages');
  box.replaceChildren();
  for (const s of STAGES) {
    const members = doc.trophies.filter((t) => t.stage === s.n);
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = 'Stage ' + s.n + ' — ' + s.title;
    const c = document.createElement('span'); c.className = 'count';
    c.textContent = members.length + ' trophies · ' + members.filter((t) => isEarned(t)).length + ' earned';
    h.append(c);
    const p = document.createElement('p'); p.textContent = s.body;
    const names = document.createElement('p'); names.className = 'trophy-names';
    names.textContent = members.map((t) => (isEarned(t) ? '✓ ' : '') + t.name + ' (' + gradeName(t.grade) + ')').join(' · ');
    li.append(h, p, names);
    box.append(li);
  }
}

function renderMissables() {
  const box = document.getElementById('missableList');
  box.replaceChildren();
  for (const t of doc.trophies.filter((x) => x.missable)) {
    const card = document.createElement('div');
    card.className = 'miss-card';
    const h = document.createElement('h3');
    h.textContent = '⚠ ' + t.name + ' — ' + gradeName(t.grade);
    const d = document.createElement('p');
    d.textContent = '“' + t.description + '”';
    const g = document.createElement('p');
    g.textContent = t.guide;
    const s = document.createElement('p');
    s.className = 'meta';
    s.textContent = 'Sources: ' + (t.sources || []).join(' | ');
    card.append(h, d, g, s);
    box.append(card);
  }
}

function renderAll() {
  renderProgress(); renderChips(); renderRows(); renderDetail(); renderRoadmap(); renderMissables();
}

function showView(name) {
  prefs.view = name; savePrefs();
  for (const b of document.querySelectorAll('.tab')) b.classList.toggle('active', b.dataset.view === name);
  for (const v of document.querySelectorAll('.view')) v.hidden = v.id !== 'view-' + name;
}

const res = await fetch('data/trophies.json');
doc = await res.json();

document.getElementById('search').value = prefs.q || '';
document.getElementById('grade').value = prefs.grade;
document.getElementById('hideEarned').checked = !!prefs.hideEarned;
document.getElementById('spoiler').checked = !!prefs.spoiler;

document.getElementById('search').addEventListener('input', (e) => { prefs.q = e.target.value; savePrefs(); renderRows(); });
document.getElementById('grade').addEventListener('change', (e) => { prefs.grade = e.target.value; savePrefs(); renderAll(); });
document.getElementById('hideEarned').addEventListener('change', (e) => { prefs.hideEarned = e.target.checked; savePrefs(); renderAll(); });
document.getElementById('spoiler').addEventListener('change', (e) => { prefs.spoiler = e.target.checked; savePrefs(); renderAll(); });
for (const b of document.querySelectorAll('.tab')) b.addEventListener('click', () => showView(b.dataset.view));

document.getElementById('export').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].map(Number) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(doc.trophies.map((t) => String(t.id)));
    earned = new Set(ids.map(String).filter((id) => valid.has(id)));
    saveProgress(); renderAll();
  } catch { alert('That file could not be imported: it is not valid trophy progress JSON.'); }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies in this browser?')) { earned = new Set(); saveProgress(); renderAll(); }
});

showView(prefs.view || 'checklist');
renderAll();
window.__shotReady = true;
