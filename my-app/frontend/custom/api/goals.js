// Ngày hiện tại (thay bằng new Date() khi dùng thực tế)
const TODAY = new Date();

let activeDepId = null; // ID mục tiêu đang nạp tiền
let selectedCI = 0;    // Màu đang chọn trong form

let goals = [];
let nextId = 1;
const goalId = new URLSearchParams(location.search).get("id");

/** Phần trăm hoàn thành (0–100) */
function calcPct(goal) {
  return Math.min(100, Math.round((goal.saved / goal.target) * 100));
}

/** Định dạng số VNĐ đầy đủ: 1.500.000 đ */
function fmtFull(n) {
  return Math.round(n).toLocaleString('vi-VN') + ' đ';
}

/** Định dạng ngắn: 1.5tr, 500k */
function fmtShort(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + ' tr';
  return Math.round(n / 1000) + 'k';
}

/** Chuyển chuỗi "dd/mm/yyyy" → Date (hoặc null nếu không hợp lệ) */
function parseDate(str) {
  if (!str) return null;
  const [d, m, y] = str.split('/');
  if (!d || !m || !y) return null;
  return new Date(+y, +m - 1, +d);
}

/** Số ngày còn lại đến deadline (âm = quá hạn) */
function daysLeft(deadline) {
  const d = parseDate(deadline);
  if (!d) return null;
  return Math.ceil((d - TODAY) / 864e5);
}

/** Số tháng còn lại (tối thiểu 1 nếu còn > 0 ngày) */
function monthsLeft(deadline) {
  const dl = daysLeft(deadline);
  if (dl === null) return null;
  if (dl <= 0) return 0;
  return Math.max(1, Math.ceil(dl / 30.44));
}

/** Số tiền cần tiết kiệm mỗi tháng để kịp deadline */
function calcMonthlyNeeded(goal) {
  const rem = goal.target - goal.saved;
  if (rem <= 0) return 0;
  const m = monthsLeft(goal.deadline);
  if (m === null) return 0;
  if (m === 0) return rem; // quá hạn → cần toàn bộ ngay
  return rem / m;
}

/**
 * Tạo SVG giọt nước với mức nước theo tỷ lệ hoàn thành.
 * @param {object} goal  - mục tiêu
 * @param {number} W     - chiều rộng (px)
 * @param {number} H     - chiều cao (px)
 */
function buildDrop(goal, W, H) {
  const p = calcPct(goal) / 100;
  const c = COLORS[goal.ci];
  const cx = W / 2, tipY = 2, bY = H - 2;
  const bR = W * 0.46, cpY = H * 0.30;
  const id = 'clip-' + goal.id;

  // Path hình giọt nước
  const dropPath = [
    `M${cx},${tipY}`,
    `C${cx - W * 0.15},${cpY} ${cx - bR},${H * 0.4} ${cx - bR},${H * 0.68}`,
    `Q${cx - bR},${bY} ${cx},${bY}`,
    `Q${cx + bR},${bY} ${cx + bR},${H * 0.68}`,
    `C${cx + bR},${H * 0.4} ${cx + W * 0.15},${cpY} ${cx},${tipY}Z`,
  ].join(' ');

  // Vùng nước (hình sóng)
  const fillTop = bY - p * (H * 0.78);
  const wA = W * 0.07;
  const wt = fillTop + wA;
  const wave1 = `M${cx - bR},${wt} Q${cx - bR / 2},${wt - wA} ${cx},${wt} Q${cx + bR / 2},${wt + wA} ${cx + bR},${wt} L${cx + bR},${bY} L${cx - bR},${bY}Z`;
  const wave2 = `M${cx - bR},${wt} Q${cx - bR / 2},${wt + wA} ${cx},${wt} Q${cx + bR / 2},${wt - wA} ${cx + bR},${wt} L${cx + bR},${bY} L${cx - bR},${bY}Z`;

  const animAttr = p > 0 && p < 1
    ? `<animate attributeName="d" values="${wave1};${wave2};${wave1}" dur="2.8s" repeatCount="indefinite"/>`
    : '';

  const waterLayer = p > 0
    ? `<g clip-path="url(#${id})">
         <path d="${wave1}" fill="${c.fill}">${animAttr}</path>
       </g>`
    : '';

  return `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
         style="width:${W}px;height:${H}px;display:block">
      <defs>
        <clipPath id="${id}"><path d="${dropPath}"/></clipPath>
      </defs>
      <path d="${dropPath}" fill="${c.light}"/>
      ${waterLayer}
      <path d="${dropPath}" fill="none" stroke="${c.fill}" stroke-width="1.5"/>
    </svg>`;
}


function renderAll() {
  const grid = document.getElementById('grid');
  grid.innerHTML = goals.map(renderCard).join('') + renderAddCard();
}

function renderCard(g) {
  const p = calcPct(g);
  const c = COLORS[g.ci];
  const done = p >= 100;
  const dl = daysLeft(g.deadline);
  const overdue = dl !== null && dl < 0 && !done;
  const rem = g.target - g.saved;
  const mn = calcMonthlyNeeded(g);

  // Badge
  const badgeClass = done ? 'badge-done' : overdue ? 'badge-overdue' : 'badge-active';
  const badgeText = done ? 'Hoàn thành' : overdue ? 'Quá hạn' : 'Đang tiết kiệm';

  // Ngày còn lại
  let daysHtml = '';
  if (done) {
    daysHtml = `<span class="days-left" style="color:#6c5ce7">✓ Đã hoàn thành</span>`;
  } else if (overdue) {
    daysHtml = `<span class="days-left" style="color:#c0392b">Đã quá hạn ${Math.abs(dl)} ngày</span>`;
  } else if (dl !== null) {
    const color = dl <= 30 ? '#e67e22' : c.fill;
    daysHtml = `<span class="days-left" style="color:${color}">Còn ${dl} ngày</span>`;
  }

  // Ô tiết kiệm / tháng
  let monthlyHtml = '';
  if (!done && mn > 0 && g.deadline) {
    const bg = overdue ? '#feecec' : dl <= 30 ? '#fff5e6' : c.light;
    const col = overdue ? '#c0392b' : dl <= 30 ? '#d35400' : c.fill;
    monthlyHtml = `
      <div class="monthly-box" style="background:${bg}">
        <span class="monthly-label">Cần tiết kiệm / tháng</span>
        <span class="monthly-val" style="color:${col}">${fmtShort(mn)}</span>
      </div>`;
  }

  return `
    <div class="card">
      <!-- Tên + badge -->
      <div class="card-head">
        <span class="card-name">${g.name}</span>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>

      <!-- Hover actions -->
      <div class="card-actions">
        <button class="act-btn" title="Nạp tiền"   onclick="openDeposit(${g.id})"><i class="ti ti-plus"></i></button>
        <button class="act-btn" title="Chỉnh sửa"  onclick="openEdit(${g.id})">   <i class="ti ti-edit"></i></button>
        <button class="act-btn" title="Xóa"         onclick="deleteGoal(${g.id})"> <i class="ti ti-trash"></i></button>
      </div>

      <!-- Giọt nước + thông tin -->
      <div class="card-body">
        <div class="drop-side">
          ${buildDrop(g, 80, 96)}
          <div class="drop-pct">${p}%</div>
        </div>
        <div class="info-table">
          <div class="info-row">
            <span class="info-label">Ngày tạo</span>
            <span class="info-val">${g.created}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Hoàn tất</span>
            <span class="info-val">${g.deadline || '—'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Đã tiết kiệm</span>
            <span class="info-val" style="color:${c.fill}">${fmtFull(g.saved)}</span>
          </div>
        </div>
      </div>

      <hr class="divider"/>

      <!-- Mục tiêu + thanh tiến trình -->
      <div class="target-row">
        <span class="target-label">Mục tiêu</span>
        <span class="target-val">${fmtFull(g.target)}</span>
      </div>
      <div class="prog-track">
        <div class="prog-fill" style="width:${p}%;background:${c.fill}"></div>
      </div>
      <div class="remain-row">
        <span>Còn thiếu</span>
        <span>${rem > 0 ? fmtFull(rem) : 'Đạt mục tiêu!'}</span>
      </div>

      ${monthlyHtml}

      <hr class="divider"/>

      <!-- Footer -->
      <div class="card-foot">
        <span class="foot-date">Tạo ${g.created}</span>
        ${daysHtml}
      </div>
    </div>`;
}

function renderAddCard() {
  return `
    <div class="add-card" onclick="openNew()">
      <div class="add-icon"><i class="ti ti-plus"></i></div>
      <span>Thêm mục tiêu mới</span>
    </div>`;
}

function openModal(html) {
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('overlay').classList.add('on');
}

function closeModal() {
  document.getElementById('overlay').classList.remove('on');
  activeDepId = null;
}

// Đóng modal khi click nền
document.getElementById('overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('overlay')) closeModal();
});


function toInputDate(str) {
  if (!str) return '';

  const [d, m, y] = str.split('/');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function buildGoalForm(g) {
  const isEdit = !!g;
  selectedCI = isEdit ? g.ci : 0;
  const TODAY = new Date();

  const colorDots = COLORS.map((c, i) => `
    <div class="cp ${i === selectedCI ? 'sel' : ''}"
         style="background:${c.fill}"
         onclick="pickColor(${i}, this)"></div>
  `).join('');

  return `
    <div class="modal-title">${isEdit ? 'Chỉnh sửa mục tiêu' : 'Thêm mục tiêu tiết kiệm'}</div>
    <div class="modal-sub">Điền thông tin để ${isEdit ? 'cập nhật' : 'tạo'} mục tiêu mới</div>
    <button class="close-btn" onclick="closeModal()"><i class="ti ti-x"></i></button>

    <div class="field">
      <label>Tên mục tiêu</label>
      <input type="text" id="f-name"
             value="${isEdit ? g.name : ''}"
             placeholder="vd: Mua xe máy, Du lịch Đà Nẵng..."
             oninput="updatePreview()"/>
    </div>

    <div class="two-col">
      <div class="field">
        <label>Ngày tạo</label>
        <input type="date" id="f-created"
               value="${isEdit ? toInputDate(g.created) : ''}"
               oninput="updatePreview()"/>
      </div>
      <div class="field">
        <label>Ngày hoàn tất</label>
        <input type="date" id="f-deadline"
               value="${isEdit ? toInputDate(g.deadline) : ''}"
               oninput="updatePreview()"/>
      </div>
    </div>

    <div class="two-col">
      <div class="field">
        <label>Số tiền mục tiêu (đ)</label>
        <input type="number" id="f-target"
               value="${isEdit ? g.target : ''}"
               placeholder="vd: 30000000" min="0"
               oninput="updatePreview()"/>
      </div>
      <div class="field">
        <label>Đã tiết kiệm được (đ)</label>
        <input
          type="number"
          id="f-saved"
          value="${isEdit ? g.saved : 0}"
          min="0"
          ${isEdit ? 'disabled' : ''}
        />

        ${isEdit ? `
          <div class="field-hint">
             Số tiền đã tiết kiệm được cập nhật từ lịch sử giao dịch. Để tăng số dư, hãy sử dụng chức năng Nạp tiền.
          </div>
        ` : `
          <div class="field-hint">
            Nhập số tiền tiết kiệm ban đầu (nếu có).
          </div>
        `}
      </div>
    </div>

    <div class="field">
      <label>Màu sắc</label>
      <div class="color-row">${colorDots}</div>
    </div>

    <hr class="divider-form"/>
    <div class="preview-label">Xem trước</div>
    <div class="preview-box">
      <div style="flex-shrink:0;position:relative;width:64px;height:78px">
        <div id="prev-drop"></div>
        <div id="prev-pct"
             style="position:absolute;inset:0;display:flex;align-items:center;
                    justify-content:center;font-size:13px;font-weight:500;color:#111">
          0%
        </div>
      </div>
      <div class="preview-info">
        <div class="preview-name" id="prev-name">Tên mục tiêu</div>
        <div class="preview-rows">
          <div class="preview-row"><span>Mục tiêu</span>    <span id="pv-target">—</span></div>
          <div class="preview-row"><span>Đã tiết kiệm</span><span id="pv-saved">—</span></div>
          <div class="preview-row"><span>Cần / tháng</span> <span id="pv-monthly">—</span></div>
        </div>
        <div class="preview-bar">
          <div class="preview-fill" id="pv-fill" style="width:0%"></div>
        </div>
      </div>
    </div>

    <div class="modal-foot">
      <button class="btn-cancel" onclick="closeModal()">Hủy</button>
      <button class="btn-save"   onclick="saveGoal(${isEdit ? g.id : -1})">
        Lưu mục tiêu ↗
      </button>
    </div>`;
}

/** Cập nhật phần Xem trước khi người dùng nhập */
function updatePreview() {
  const name = document.getElementById('f-name').value || 'Tên mục tiêu';
  const t = parseInt(document.getElementById('f-target').value) || 0;
  const s = Math.min(parseInt(document.getElementById('f-saved').value) || 0, t || 1);
  const dd = document.getElementById('f-deadline').value || null;
  const p = t > 0 ? Math.round(s / t * 100) : 0;
  const c = COLORS[selectedCI];

  const tmpGoal = { id: 'prev', ci: selectedCI, saved: s, target: t || 1, deadline: dd };
  const mn = calcMonthlyNeeded(tmpGoal);

  document.getElementById('prev-name').textContent = name;
  document.getElementById('pv-target').textContent = t ? fmtFull(t) : '—';
  document.getElementById('pv-saved').textContent = s ? fmtFull(s) : '—';
  document.getElementById('pv-monthly').textContent = mn > 0 ? fmtShort(mn) + '/tháng' : '—';
  document.getElementById('prev-pct').textContent = p + '%';
  document.getElementById('pv-fill').style.cssText = `width:${p}%;background:${c.fill}`;
  document.getElementById('prev-drop').innerHTML = buildDrop(tmpGoal, 64, 78);
}

function pickColor(i, el) {
  selectedCI = i;
  document.querySelectorAll('.cp').forEach(x => x.classList.remove('sel'));
  el.classList.add('sel');
  updatePreview();
}

function formatDate(str) {
  if (!str) return '';

  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function formatVNDate(dateStr) {

  const d = new Date(dateStr);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}


async function saveGoal(id) {

  const name =
    document.getElementById('f-name').value.trim();

  const target_amount =
    parseInt(document.getElementById('f-target').value) || 0;

  const start_date =
    document.getElementById('f-created').value;

  const deadline =
    document.getElementById('f-deadline').value || null;

  if (!name || !target_amount) {
    alert("Vui lòng nhập tên và số tiền mục tiêu");
    return;
  }

  const isEdit = id !== -1;

  let saved_amount = 0;

  // Chỉ lấy saved_amount khi tạo mới
  if (!isEdit) {
    saved_amount =
      parseInt(document.getElementById('f-saved')?.value) || 0;
  }

  const data = {
    name,
    target_amount,
    color_index: selectedCI,
    start_date,
    deadline
  };

  // Chỉ gửi saved_amount khi tạo mới
  if (!isEdit) {
    data.saved_amount = saved_amount;
  }

  try {

    const token =
      localStorage.getItem("token");

    const url = isEdit
      ? `http://localhost:3000/api/goals/${id}`
      : "http://localhost:3000/api/goals";

    const method = isEdit
      ? "PUT"
      : "POST";

    const res = await fetch(
      url,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(
        result.message || "Có lỗi xảy ra"
      );
    }

    console.log(result);

    closeModal();

    loadGoals();

  } catch (err) {

    console.error(err);

    alert(err.message);

  }
}
//  FORM: NẠP TIỀN

function buildDepositForm(id) {
  const g = goals.find(x => x.id === id);
  const c = COLORS[g.ci];
  const mn = calcMonthlyNeeded(g);

  const quickAmounts = [100_000, 500_000, 1_000_000, 2_000_000, 5_000_000];
  const quickChips = quickAmounts.map(a =>
    `<span class="qc" onclick="document.getElementById('dep-amount').value=${a}">
       ${fmtShort(a)}
     </span>`
  ).join('');

  const monthlyHint = mn > 0
    ? `<div style="font-size:12px;color:${c.fill};font-weight:500;margin-top:2px">
         Cần ~${fmtShort(mn)}/tháng để kịp hạn
       </div>`
    : '';

  return `
    <div class="modal-title">Nạp tiền tiết kiệm</div>
    <div class="modal-sub">${g.name}</div>
    <button class="close-btn" onclick="closeModal()"><i class="ti ti-x"></i></button>

    <div class="dep-preview">
      <div style="flex-shrink:0;position:relative;width:52px;height:64px">
        ${buildDrop(g, 52, 64)}
        <div style="position:absolute;inset:0;display:flex;align-items:center;
                    justify-content:center;font-size:12px;font-weight:500;color:#111">
          ${calcPct(g)}%
        </div>
      </div>
      <div>
        <div style="font-size:14px;font-weight:500;color:#111;margin-bottom:3px">${g.name}</div>
        <div style="font-size:12px;color:#888">
          Đã tiết kiệm: <b style="color:${c.fill}">${fmtFull(g.saved)}</b> / ${fmtFull(g.target)}
        </div>
        <div style="font-size:12px;color:#aaa">
          Còn thiếu: ${fmtFull(Math.max(0, g.target - g.saved))}
        </div>
        ${monthlyHint}
      </div>
    </div>

    <div class="field">
      <label>Số tiền nạp thêm (đ)</label>
      <input type="number" id="dep-amount" placeholder="vd: 500000" min="0"/>
    </div>

    <div class="quick-row">${quickChips}</div>

    <div class="modal-foot">
      <button class="btn-cancel" onclick="closeModal()">Hủy</button>
      <button class="btn-save"   onclick="confirmDeposit()">Xác nhận ↗</button>
    </div>`;
}

async function confirmDeposit() {

  const amt =
    parseInt(document.getElementById('dep-amount').value) || 0;

  if (amt <= 0) {
    alert('Vui lòng nhập số tiền hợp lệ.');
    return;
  }

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:3000/api/goals/${activeDepId}/deposit`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amt
        })
      }
    );

    const data = await res.json();

    console.log(data);

    closeModal();

    loadGoals();

  } catch (err) {

    console.log(err);

  }
}
//  OPEN HANDLERS

function openNew() {
  selectedCI = 0;
  openModal(buildGoalForm(null));
  updatePreview();
}

function openEdit(id) {
  openModal(buildGoalForm(goals.find(x => x.id === id)));
  updatePreview();
}

function openDeposit(id) {
  activeDepId = id;
  openModal(buildDepositForm(id));
}

async function deleteGoal(id) {

  if (!confirm("Xóa mục tiêu này?"))
    return;

  try {

    const token =
      localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:3000/api/goals/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message
      );
    }

    goals = goals.filter(
      g => g.id !== id
    );

    renderAll();

    alert("Đã xóa mục tiêu");

  } catch (err) {

    console.error(err);

    alert(err.message);
  }
}



const COLORS = [
  { fill: '#378ADD', light: '#ddeefb' },
  { fill: '#1D9E75', light: '#d8f3e8' },
  { fill: '#b97a20', light: '#f5e6c8' },
  { fill: '#6c5ce7', light: '#ede9fe' },
  { fill: '#c0392b', light: '#fde8e8' },
  { fill: '#27ae60', light: '#d4f5e3' },
  { fill: '#c0136e', light: '#fce4f0' },
  { fill: '#636e72', light: '#eaeaea' },
];

//  INIT

async function loadGoals() {

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:3000/api/goals",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    console.log(data);

    if (!Array.isArray(data)) return;

    goals = data.map(g => ({
      id: g.id,
      name: g.name,
      target: Number(g.target_amount),
      saved: Number(g.saved_amount),
      ci: g.color_index,
      created: g.start_date
        ? formatVNDate(g.start_date)
        : '',
      deadline: g.deadline
        ? formatVNDate(g.deadline)
        : ''
    }));

    renderAll();

  } catch (err) {

    console.log(err);
  }
}
document.getElementById('btn-open-new').addEventListener('click', openNew);
loadGoals();