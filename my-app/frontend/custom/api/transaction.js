// ─── API ─────────────────────────────────────────────────────────────
const API_URL = "http://localhost:3000/api";

const USER_ID = localStorage.getItem("userId");


// ─── STATE ───────────────────────────────────────────────────────────
const state = {

  transactions: [],
  wallets: [],
  categories: [],

  filters: {
    month: '',
    cat: '',
    type: '',
    search: ''
  },

  page: 1,
  pageSize: 10,
};

let txMonth = new Date().getMonth() + 1;
let txYear = new Date().getFullYear();

let selectedDate = getTodayValue();


// ─── RENDER FILTER CATEGORY ─────────────────────────────
function renderCategoryFilter() {

  const fdCat =
    document.getElementById("fdCat");

  const current =
    state.filters.cat;

  fdCat.innerHTML = `
    <option value="">
      Tất cả danh mục
    </option>

    ${state.categories.map(c => `
      <option
        value="${c.name}"
        ${current === c.name ? 'selected' : ''}
      >
        ${c.name}
      </option>
    `).join("")}
  `;
}


// ─── INIT TABLE ──────────────────────────────────────────
function initTable() {

  initFilter();

  initSearch();

  initPageSize();

  renderTable();

  updateFilterBadge();

  updateFilterTags();
}


// ─── LOAD API ────────────────────────────────────────────────────────
async function loadTransactions() {

  try {

    const res = await fetch(
      `${API_URL}/transaction/${USER_ID}`
    );

    const data = await res.json();

    state.transactions =
      (data.transactions || []).sort(
        (a, b) =>
          new Date(b.transaction_date) -
          new Date(a.transaction_date)
      );

  } catch (err) {

    console.error(err);
  }
}


async function loadWallets() {

  try {

    const res = await fetch(
      `${API_URL}/wallet/user/${USER_ID}`
    );

    const data = await res.json();

    state.wallets = data.wallets || [];

  } catch (err) {

    console.error(err);
  }
}


async function loadCategories(
  month = txMonth,
  year = txYear
) {

  try {

    const res = await fetch(
      `${API_URL}/cate/${USER_ID}?month=${month}&year=${year}`
    );

    const data = await res.json();

    state.categories =
      data.categories || [];

    renderCategoryFilter();

  } catch (err) {

    console.error(err);
  }
}


// ─── HELPERS ─────────────────────────────────────────────────────────
function formatAmount(n) {

  return Math.abs(n)
    .toLocaleString('vi-VN') + 'đ';
}


function buildOptions(
  arr,
  placeholder
) {

  return `
    <option value="">
      ${placeholder}
    </option>

    ${arr.map(o => `
      <option value="${o.id}">
        ${o.name}
      </option>
    `).join('')}
  `;
}


function getTodayValue() {

  const now = new Date();

  const pad = n =>
    String(n).padStart(2, '0');

  return `
    ${now.getFullYear()}-
    ${pad(now.getMonth() + 1)}-
    ${pad(now.getDate())}
  `.replace(/\s/g, '');
}


// ─── FILTER ──────────────────────────────────────────────────────────
function getFiltered() {

  const q =
    state.filters.search.toLowerCase();

  return state.transactions.filter(t => {

    const d =
      new Date(t.transaction_date);

    const month =
      d.getMonth() + 1;

    const year =
      d.getFullYear();

    // FILTER MONTH
    if (state.filters.month) {

      const [fYear, fMonth] =
        state.filters.month.split('-');

      if (
        month !== parseInt(fMonth) ||
        year !== parseInt(fYear)
      ) {

        return false;
      }
    }

    // FILTER CATEGORY
    if (
      state.filters.cat &&
      t.category_name !== state.filters.cat
    ) {

      return false;
    }

    // FILTER TYPE
    if (
      state.filters.type &&
      t.type !== state.filters.type
    ) {

      return false;
    }

    // SEARCH
    if (
      q &&
      !t.title
        .toLowerCase()
        .includes(q)
    ) {

      return false;
    }

    return true;
  });
}


// ─── RENDER TABLE ────────────────────────────────────────────────────
function renderTable() {

  const data = getFiltered();

  const total = data.length;

  const pages = Math.max(
    1,
    Math.ceil(total / state.pageSize)
  );

  if (state.page > pages) {

    state.page = pages;
  }

  const start =
    (state.page - 1) *
    state.pageSize;

  const slice = data.slice(
    start,
    start + state.pageSize
  );

  const list =
    document.getElementById('txnList');

  if (!slice.length) {

    list.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-search"></i>
        Không tìm thấy giao dịch nào
      </div>
    `;

  } else {

    list.innerHTML =
      slice.map(t => {

        const icon =
          t.category_icon || 'ti-tag';

        const bg =
          t.category_bg || '#eee';

        const col =
          t.category_fg || '#333';

        const amtCls =
          t.type === 'income'
            ? 'amount-income'
            : 'amount-expense';

        const amtStr =
          (t.type === 'income'
            ? '+'
            : '-') +
          formatAmount(t.amount);

        const typeBdg =
          t.type === 'income'
            ? `
              <span class="type-badge type-income">
                Thu nhập
              </span>
            `
            : `
              <span class="type-badge type-expense">
                Chi tiêu
              </span>
            `;

        return `
          <div
            class="txn-row"
            data-id="${t.id}"
          >

            <!-- CHECK -->
            <div class="td-check">

              <input
                type="checkbox"
                class="txn-check"
                data-id="${t.id}"
              >

            </div>

            <!-- DESC -->
            <div class="txn-desc">

              <div
                class="txn-icon"
                style="
                  background:${bg};
                  color:${col}
                "
              >
                <i class="ti ${icon}"></i>
              </div>

              <div>

                <div class="txn-name">
                  ${t.title}
                </div>

                <div class="txn-sub">
                  ${t.note || ''}
                </div>

              </div>

            </div>

            <!-- CATEGORY -->
            <div>

              <span
                class="badge"
                style="
                  background:${bg};
                  color:${col}
                "
              >
                ${
                  t.type === 'income'
                    ? t.wallet_name
                    : t.category_name
                }
              </span>

            </div>

            <!-- DATE -->
            <div class="txn-date">

              ${new Date(
                t.transaction_date
              ).toLocaleDateString('vi-VN')}

            </div>

            <!-- AMOUNT -->
            <div class="
              txn-amount ${amtCls}
            ">
              ${amtStr}
            </div>

            <!-- TYPE -->
            <div style="text-align:center">
              ${typeBdg}
            </div>

            <!-- ACTION -->
            <div class="td-action">

              <button
                class="delete-btn"
                onclick="
                  deleteTransaction(${t.id})
                "
              >
                <i class="ti ti-trash"></i>
              </button>

            </div>

          </div>
        `;

      }).join('');
  }

  document.getElementById(
    'pagInfo'
  ).textContent = total
    ? `
      ${start + 1}–
      ${Math.min(
        start + state.pageSize,
        total
      )}
      / ${total} giao dịch
    `.replace(/\s+/g, ' ')
    : '0 giao dịch';

  renderPagination(pages);
}


// ─── PAGINATION ──────────────────────────────────────────────────────
function renderPagination(pages) {

  const container =
    document.getElementById('pagBtns');

  let html = `
    <div
      class="
        pag-btn
        ${state.page === 1
          ? 'disabled'
          : ''}
      "
      id="pagPrev"
    >
      <i class="ti ti-chevron-left"></i>
    </div>
  `;

  for (let i = 1; i <= pages; i++) {

    html += `
      <div
        class="
          pag-btn
          ${i === state.page
            ? 'active'
            : ''}
        "
        data-page="${i}"
      >
        ${i}
      </div>
    `;
  }

  html += `
    <div
      class="
        pag-btn
        ${state.page === pages
          ? 'disabled'
          : ''}
      "
      id="pagNext"
    >
      <i class="ti ti-chevron-right"></i>
    </div>
  `;

  container.innerHTML = html;

  container
    .querySelectorAll('[data-page]')
    .forEach(btn => {

      btn.addEventListener(
        'click',
        () => {

          state.page =
            parseInt(
              btn.dataset.page
            );

          renderTable();
        }
      );
    });

  document
    .getElementById('pagPrev')
    ?.addEventListener(
      'click',
      () => {

        if (state.page > 1) {

          state.page--;

          renderTable();
        }
      }
    );

  document
    .getElementById('pagNext')
    ?.addEventListener(
      'click',
      () => {

        if (state.page < pages) {

          state.page++;

          renderTable();
        }
      }
    );
}


// ─── FILTER ──────────────────────────────────────────────────────────
function updateFilterBadge() {

  const count =
    ['month', 'cat', 'type']
    .filter(k => state.filters[k])
    .length;

  const badge =
    document.getElementById(
      'filterBadge'
    );

  badge.classList.toggle(
    'show',
    count > 0
  );

  badge.textContent = count;
}


function updateFilterTags() {

  const tags =
    document.getElementById(
      'tagsRow'
    );

  tags.innerHTML = '';
}


function initFilter() {

  const btn =
    document.getElementById(
      'filterBtn'
    );

  const drop =
    document.getElementById(
      'filterDrop'
    );

  const fdMonth =
    document.getElementById(
      'fdMonth'
    );

  // 🔥 dynamic month
  const now = new Date();

  let monthHtml = `
    <option value="">
      Tất cả tháng
    </option>
  `;

  for (let i = 0; i < 12; i++) {

    const d = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    const m =
      d.getMonth() + 1;

    const y =
      d.getFullYear();

    monthHtml += `
      <option value="${y}-${m}">
        Tháng ${m}, ${y}
      </option>
    `;
  }

  fdMonth.innerHTML = monthHtml;

  // 🔥 reload category by month
  fdMonth.addEventListener(
    'change',
    async function () {

      const value = this.value;

      if (!value) {

        state.categories = [];

        renderCategoryFilter();

        return;
      }

      const [year, month] =
        value.split('-');

      await loadCategories(
        month,
        year
      );

      renderCategoryFilter();
    }
  );

  btn.addEventListener(
    'click',
    e => {

      e.stopPropagation();

      drop.classList.toggle(
        'open'
      );
    }
  );

  document.addEventListener(
    'click',
    e => {

      if (
        !e.target.closest(
          '#filterDrop'
        ) &&
        !e.target.closest(
          '#filterBtn'
        )
      ) {

        drop.classList.remove(
          'open'
        );
      }
    }
  );

  document
    .getElementById('fdApply')
    .addEventListener(
      'click',
      () => {

        state.filters.month =
          document.getElementById(
            'fdMonth'
          ).value;

        state.filters.cat =
          document.getElementById(
            'fdCat'
          ).value;

        state.filters.type =
          document.getElementById(
            'fdType'
          ).value;

        state.page = 1;

        renderTable();

        updateFilterBadge();

        drop.classList.remove(
          'open'
        );
      }
    );

  document
    .getElementById('fdClear')
    .addEventListener(
      'click',
      () => {

        state.filters.month = '';
        state.filters.cat = '';
        state.filters.type = '';

        document.getElementById(
          'fdMonth'
        ).value = '';

        document.getElementById(
          'fdCat'
        ).value = '';

        document.getElementById(
          'fdType'
        ).value = '';

        renderTable();

        updateFilterBadge();
      }
    );
}


// ─── SEARCH ──────────────────────────────────────────────────────────
function initSearch() {

  document
    .getElementById(
      'searchInput'
    )
    .addEventListener(
      'input',
      function () {

        state.filters.search =
          this.value;

        state.page = 1;

        renderTable();
      }
    );
}


// ─── PAGE SIZE ───────────────────────────────────────────────────────
function initPageSize() {

  document
    .getElementById(
      'pageSize'
    )
    .addEventListener(
      'change',
      function () {

        state.pageSize =
          parseInt(this.value);

        state.page = 1;

        renderTable();
      }
    );
}


// ─── VALIDATE ────────────────────────────────────────────────────────
function validateForm() {

  const amount =
    document.getElementById(
      'fAmount'
    ).value;

  const title =
    document.getElementById(
      'fTitle'
    ).value;

  const select =
    document.getElementById(
      'fSelect'
    ).value;

  if (
    !amount ||
    Number(amount) <= 0
  ) {

    alert(
      'Nhập số tiền hợp lệ'
    );

    return false;
  }

  if (!title.trim()) {

    alert('Nhập tiêu đề');

    return false;
  }

  if (!select) {

    alert('Vui lòng chọn');

    return false;
  }

  return true;
}


// ─── MODAL ───────────────────────────────────────────────────────────
let activeType = null;

function showStep1() {

  document.getElementById(
    'step1'
  ).style.display = 'block';

  document
    .getElementById('step2')
    .classList.remove('show');
}


function showStep2(type) {

  activeType = type;

  document.getElementById(
    'step1'
  ).style.display = 'none';

  document
    .getElementById('step2')
    .classList.add('show');

  selectedDate =
    getTodayValue();

  const d =
    new Date(selectedDate);

  txMonth =
    d.getMonth() + 1;

  txYear =
    d.getFullYear();

  loadCategories(
    txMonth,
    txYear
  ).then(() => {

    document.getElementById(
      'modalBody'
    ).innerHTML = buildForm(type);
  });
}


// 🔥 add listener only once
document.addEventListener(
  "change",
  async (e) => {

    if (e.target.id === "fDate") {

      selectedDate =
        e.target.value;

      const d =
        new Date(selectedDate);

      txMonth =
        d.getMonth() + 1;

      txYear =
        d.getFullYear();

      await loadCategories(
        txMonth,
        txYear
      );

      document.getElementById(
        "modalBody"
      ).innerHTML =
        buildForm(activeType);
    }
  }
);


function openModal() {

  document
    .getElementById('overlay')
    .classList.add('open');

  showStep1();
}


function closeModal() {

  document
    .getElementById('overlay')
    .classList.remove('open');
}


function showToast(type) {

  const toast =
    document.getElementById(
      'toast'
    );

  toast.innerHTML =
    type === 'income'
      ? 'Đã thêm thu nhập'
      : 'Đã thêm chi tiêu';

  toast.classList.add('show');

  setTimeout(() => {

    toast.classList.remove(
      'show'
    );

  }, 2000);
}


function initModal() {

  document
    .getElementById(
      'btnOpenModal'
    )
    .addEventListener(
      'click',
      openModal
    );

  document
    .getElementById(
      'btnCancelStep1'
    )
    .addEventListener(
      'click',
      closeModal
    );

  document
    .getElementById(
      'btnCancelStep2'
    )
    .addEventListener(
      'click',
      closeModal
    );

  document
    .getElementById(
      'btnClose'
    )
    .addEventListener(
      'click',
      closeModal
    );

  document
    .querySelectorAll(
      '.type-card'
    )
    .forEach(card => {

      card.addEventListener(
        'click',
        () => {

          showStep2(
            card.dataset.type
          );
        }
      );
    });
}


// ─── BUILD FORM ──────────────────────────────────────────────────────
function buildForm(type) {

  const amtLabel = {
    income: 'Số tiền nhận',
    expense:'Số tiền chi'
  }[type];

  const selectField =
    type === 'income'

    ? `
      <div>

        <label class="form-label">
          Ví nhận
          <span class="required">*</span>
        </label>

        <select
          class="form-select"
          id="fSelect"
        >

          ${buildOptions(
            state.wallets,
            'Chọn ví...'
          )}

        </select>

      </div>
    `

    : `
      <div>

        <label class="form-label">
          Danh mục
          <span class="required">*</span>
        </label>

        <select
          class="form-select"
          id="fSelect"
        >

          ${buildOptions(
            state.categories,
            'Chọn danh mục...'
          )}

        </select>

      </div>
    `;

  return `
    <div class="form-group">

      <label class="form-label">
        ${amtLabel}
      </label>

      <div class="amount-wrap">

        <input
          type="number"
          class="form-input"
          id="fAmount"
          placeholder="0"
        >

        <span class="amount-currency">
          đ
        </span>

      </div>

    </div>

    <div class="form-group">

      <label class="form-label">
        Tiêu đề
      </label>

      <input
        type="text"
        class="form-input"
        id="fTitle"
      >

    </div>

    <div class="form-row">

      ${selectField}

      <div>

        <label class="form-label">
          Ngày
        </label>

        <input
          type="date"
          class="form-input"
          id="fDate"
          value="${selectedDate}"
        >

      </div>

    </div>

    <div class="form-group">

      <textarea
        class="form-textarea"
        id="fNote"
        placeholder="Ghi chú"
      ></textarea>

    </div>
  `;
}


// ─── SAVE ────────────────────────────────────────────────────────────
async function saveTransaction() {

  if (!validateForm()) {
    return;
  }

  const selectId =
    parseInt(
      document.getElementById(
        'fSelect'
      ).value
    );

  const dateValue =
    document.getElementById(
      'fDate'
    ).value;

  const payload = {

    user_id: Number(USER_ID),

    type: activeType,

    amount: parseFloat(
      document.getElementById(
        'fAmount'
      ).value
    ),

    title: document
      .getElementById(
        'fTitle'
      )
      .value
      .trim(),

    note: document
      .getElementById(
        'fNote'
      )
      .value
      .trim(),

    transaction_date:
      dateValue,
  };

  if (activeType === 'income') {

    payload.wallet_id =
      selectId;

  } else {

    payload.category_id =
      selectId;
  }

  try {

    const res = await fetch(
      `${API_URL}/transaction`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify(
          payload
        )
      }
    );

    const data =
      await res.json();

    if (!res.ok) {

      return alert(
        data.message
      );
    }

    closeModal();

    showToast(activeType);

    await loadTransactions();

    await loadCategories(
      txMonth,
      txYear
    );

    renderCategoryFilter();

    renderTable();

  } catch (err) {

    console.error(err);
  }
}


// ─── INIT ────────────────────────────────────────────────────────────
async function init() {

  await Promise.all([

    loadTransactions(),

    loadWallets(),

    loadCategories(
      txMonth,
      txYear
    ),

  ]);

  renderCategoryFilter();

  initTable();

  initModal();

  document
    .getElementById('btnSave')
    .addEventListener(
      'click',
      saveTransaction
    );
}

init();

