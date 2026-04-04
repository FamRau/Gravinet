// ══ PLAN VIEW ══

function getPlan() {
  return getActiveProject()?.plan || [];
}

function updatePlanTabLabel() {
  const plan    = getActiveProject()?.plan || [];
  const planTab = document.getElementById('plan-tab');
  if (planTab) planTab.textContent = `📅 ${plan.length}-Jahres-Plan`;
}

function renderPlan() {
  const proj = getActiveProject();
  const plan = proj?.plan || [];
  const grid = document.getElementById('plan-grid'); if (!grid) return;
  updatePlanTabLabel();
  const lastId = plan.length ? plan[plan.length - 1].id : null;
  grid.innerHTML = plan.map(y => {
    const isFinal = y.id === lastId && plan.length >= 2;
    return `
    <div class="plan-year${isFinal ? ' plan-year-final' : ''}">
      <div class="plan-year-header">
        <div class="year-badge">${esc(y.label)}</div>
        <div class="plan-year-header-text">
          <div style="font-weight:600;font-size:.9rem">${esc(y.title)}</div>
          <div class="year-title">${esc(y.year)}</div>
        </div>
        ${isFinal ? '<span class="plan-final-crown" title="Endziel">🏆</span>' : ''}
        <button class="plan-header-btn" onclick="openPlanYearModal('${y.id}')" title="Jahr bearbeiten">✏</button>
      </div>
      ${y.items.map((item, idx) => `
        <div class="plan-item${item.done ? ' done' : ''}">
          <button class="plan-check" onclick="togglePlanItem('${y.id}',${idx})" title="${item.done ? 'Als offen markieren' : 'Abschließen'}">${item.done ? '✓' : ''}</button>
          <span class="plan-quarter">${esc(item.q)}</span>
          <span class="plan-item-text">${esc(item.text)}</span>
          <div class="plan-item-actions">
            <button class="plan-btn" onclick="openPlanItemModal('${y.id}',${idx})" title="Bearbeiten">✏</button>
            <button class="plan-btn del" onclick="deletePlanItem('${y.id}',${idx})" title="Löschen">✕</button>
          </div>
        </div>`).join('')}
      <div class="plan-add-row">
        <div class="plan-add-inputs">
          <select class="plan-add-q" id="padd-q-${y.id}">
            <option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option>
          </select>
          <input class="plan-add-text" id="padd-t-${y.id}" placeholder="Neue Maßnahme…"
            onkeydown="if(event.key==='Enter')addPlanItem('${y.id}')">
        </div>
      </div>
    </div>`;
  }).join('');
}

function addPlanItem(yearId) {
  const q = document.getElementById('padd-q-' + yearId).value;
  const t = document.getElementById('padd-t-' + yearId).value.trim();
  if (!t) return;
  const y = getPlan().find(p => p.id === yearId); if (!y) return;
  y.items.push({ q, text: t, done: false });
  saveNow(); renderPlan();
}

function deletePlanItem(yearId, idx) {
  const y = getPlan().find(p => p.id === yearId); if (!y) return;
  if (!confirm('Maßnahme löschen?')) return;
  y.items.splice(idx, 1);
  saveNow(); renderPlan();
}

function togglePlanItem(yearId, idx) {
  const y = getPlan().find(p => p.id === yearId); if (!y) return;
  y.items[idx].done = !y.items[idx].done;
  saveNow(); renderPlan();
}

function openPlanItemModal(yearId, idx) {
  const y    = getPlan().find(p => p.id === yearId); if (!y) return;
  const item = y.items[idx];
  document.getElementById('pi-year-id').value  = yearId;
  document.getElementById('pi-item-idx').value = idx;
  document.getElementById('pi-quarter').value  = item.q;
  document.getElementById('pi-text').value     = item.text;
  document.getElementById('plan-item-overlay').classList.add('open');
}

function savePlanItem() {
  const yearId = document.getElementById('pi-year-id').value;
  const idx    = parseInt(document.getElementById('pi-item-idx').value);
  const y      = getPlan().find(p => p.id === yearId); if (!y) return;
  y.items[idx] = {
    q:    document.getElementById('pi-quarter').value,
    text: document.getElementById('pi-text').value.trim(),
    done: y.items[idx].done || false
  };
  saveNow(); closePanel('plan-item-overlay'); renderPlan();
}

function openPlanYearModal(yearId) {
  const plan   = getPlan();
  const isEdit = !!yearId;
  document.getElementById('plan-year-modal-title').textContent = isEdit ? 'Jahr bearbeiten' : 'Jahr hinzufügen';
  document.getElementById('py-del-btn').style.display = isEdit ? '' : 'none';
  if (isEdit) {
    const y = plan.find(p => p.id === yearId); if (!y) return;
    document.getElementById('py-id').value    = yearId;
    document.getElementById('py-label').value = y.label;
    document.getElementById('py-year').value  = y.year;
    document.getElementById('py-title').value = y.title;
  } else {
    document.getElementById('py-id').value    = '';
    document.getElementById('py-label').value = 'Jahr ' + (plan.length + 1);
    document.getElementById('py-year').value  = String(2024 + plan.length + 1);
    document.getElementById('py-title').value = '';
  }
  document.getElementById('plan-year-overlay').classList.add('open');
}

function savePlanYear() {
  const proj  = getActiveProject(); if (!proj) return;
  const id    = document.getElementById('py-id').value;
  const label = document.getElementById('py-label').value.trim();
  const year  = document.getElementById('py-year').value.trim();
  const title = document.getElementById('py-title').value.trim();
  if (!label) { alert('Bitte Bezeichnung eingeben.'); return; }
  if (id) {
    const y = proj.plan.find(p => p.id === id); if (!y) return;
    y.label = label; y.year = year; y.title = title;
  } else {
    proj.plan.push({ id: 'p' + nextPlanId++, label, year, title, items: [] });
  }
  saveNow(); closePanel('plan-year-overlay'); renderPlan();
}

function deletePlanYear() {
  const proj = getActiveProject(); if (!proj) return;
  const id   = document.getElementById('py-id').value;
  const y    = proj.plan.find(p => p.id === id); if (!y) return;
  if (!confirm(`Jahr „${y.label}" und alle Maßnahmen löschen?`)) return;
  proj.plan = proj.plan.filter(p => p.id !== id);
  saveNow(); closePanel('plan-year-overlay'); renderPlan();
}
