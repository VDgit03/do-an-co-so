const API_URL = "http://localhost:3000/api";
const USER_ID = localStorage.getItem("userId");

// state
const state = {
  selectedIds: [],
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

// render filter cate
function renderCategoryFilter() {
  const fdCat = document.getElementById("fdCat");
  const current = state.filters.cat;

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


// init
function initTable() {
  initFilter();
  initSearch();
  initPageSize();
  renderTable();
  updateFilterBadge();
  updateFilterTags();
}

// load api
async function loadTransactions() {
  try {
    const res = await fetch(
      `${API_URL}/transaction/${USER_ID}`
    );
    const data = await res.json();
    state.transactions = (data.transactions || []).sort(
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
    state.categories = data.categories || [];
    renderCategoryFilter();
  } catch (err) {
    console.error(err);
  }
}

// helper
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
  const pad = n => String(n).padStart(2, '0');
  return `
    ${now.getFullYear()}-
    ${pad(now.getMonth() + 1)}-
    ${pad(now.getDate())}
  `.replace(/\s/g, '');
}

// filter
function getFiltered() {
  const q = state.filters.search.toLowerCase();
  return state.transactions.filter(t => {
    const d = new Date(t.transaction_date);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    // filter month
    if (state.filters.month) {
      const [fYear, fMonth] = state.filters.month.split('-');
      if (month !== parseInt(fMonth) || year !== parseInt(fYear)) {
        return false;
      }
    }

    // filter cate
    if (state.filters.cat && t.category_name !== state.filters.cat) {
      return false;
    }

    // filter type
    if (state.filters.type && t.type !== state.filters.type) {
      return false;
    }

    // search
    if (q && !t.title.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
}

// render table
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
  const start = (state.page - 1) * state.pageSize;
  const slice = data.slice(
    start,
    start + state.pageSize
  );
  const list = document.getElementById('txnList');
  if (!slice.length) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-search"></i>
        Không tìm thấy giao dịch nào
      </div>
    `;
  } else {
    list.innerHTML = slice.map(t => {
      const icon = t.category_icon || 'ti-tag';
      const bg = t.category_bg || '#eee';
      const col = t.category_fg || '#333';
      let amtCls = '';
      let amtStr = '';

      switch (t.type) {

        case 'income':
          amtCls = 'amount-income';
          amtStr = '+' + formatAmount(t.amount);
          break;

        case 'expense':
          amtCls = 'amount-expense';
          amtStr = '-' + formatAmount(t.amount);
          break;

        case 'saving':
          amtCls = 'amount-saving';
          amtStr = formatAmount(t.amount);
          break;

      }
      let typeBdg = '';

      switch (t.type) {

        case 'income':
          typeBdg = `
            <span class="type-badge type-income">
              Thu nhập
            </span>
          `;
          break;

        case 'expense':
          typeBdg = `
            <span class="type-badge type-expense">
              Chi tiêu
            </span>
          `;
          break;

        case 'saving':
          typeBdg = `
            <span class="type-badge type-saving">
              Tiết kiệm
            </span>
          `;
          break;
      }
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
                ${t.type === 'income'
          ? t.wallet_name
          : t.type === 'saving'
            ? 'Tiết kiệm'
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
  initCheckboxes();
}

function initCheckboxes() {
  const checks = document.querySelectorAll('.txn-check');

  const checkAll = document.getElementById('checkAll');

  // reset
  checks.forEach(check => {
    const id = Number(check.dataset.id);

    check.checked = state.selectedIds.includes(id);

    const row = check.closest('.txn-row');

    row.classList.toggle(
      'selected',
      check.checked
    );

    check.addEventListener(
      'change',
      function () {
        if (this.checked) {
          if (
            !state.selectedIds.includes(id)
          ) {
            state.selectedIds.push(id);
          }
        } else {
          state.selectedIds = state.selectedIds.filter(
            x => x !== id
          );
        }
        row.classList.toggle(
          'selected',
          this.checked
        );
        updateBulkBar();
        syncCheckAll();
      }
    );
  });

  // select all
  if (checkAll) {
    checkAll.checked = checks.length > 0 && [...checks].every(c => c.checked);
    checkAll.onchange = function () {
      if (this.checked) {
        state.selectedIds = [...checks].map(
          c => Number(c.dataset.id)
        );
      } else {
        state.selectedIds = [];
      }
      checks.forEach(c => {
        c.checked = this.checked;
        c.closest('.txn-row')
          .classList.toggle(
            'selected',
            this.checked
          );
      });
      updateBulkBar();
    };
  }
  updateBulkBar();
}

function syncCheckAll() {
  const checkAll = document.getElementById('checkAll');
  const checks = document.querySelectorAll('.txn-check');
  if (!checkAll) return;
  checkAll.checked = checks.length > 0 && [...checks].every(c => c.checked);
}

function updateBulkBar() {
  const bar = document.getElementById(
    'bulkBar'
  );

  const count = document.getElementById(
    'selectedCount'
  );
  if (!bar || !count) return;
  if (state.selectedIds.length) {
    bar.classList.remove(
      'hidden'
    );
    count.textContent = state.selectedIds.length;
  } else {
    bar.classList.add(
      'hidden'
    );
    count.textContent = 0;
  }
}

// xóa
async function deleteTransaction(id) {
  const ok = confirm(
    'Xóa giao dịch này?'
  );
  if (!ok) return;
  try {
    const res = await fetch(
      `${API_URL}/transaction/${id}`,
      {
        method: 'DELETE'
      }
    );
    const data = await res.json();
    if (!res.ok) {
      showToast(
        data.message,
        "danger"
      );
      return;
    }
    state.selectedIds =
      state.selectedIds.filter(
        x => x !== id
      );
    await loadTransactions();
    renderTable();
    showToast(
      "Đã xóa giao dịch",
      "success"
    );
  } catch (err) {
    console.error(err);
    showToast(
      "Có lỗi xảy ra",
      "danger"
    );
  }
}

// xóa chọn
async function deleteSelected() {
  if (!state.selectedIds.length) {
    return;
  }
  const ok = confirm(
    `Xóa ${state.selectedIds.length} giao dịch?`
  );
  if (!ok) return;
  try {
    const results = await Promise.all(
      state.selectedIds.map(id =>
        fetch(
          `${API_URL}/transaction/${id}`,
          {
            method: 'DELETE'
          }
        )
      )
    );
    const failed = results.some(r => !r.ok);
    if (failed) {
      showToast(
        'Có giao dịch xóa thất bại',
        'danger'
      );
      return;
    }
    const deletedCount = state.selectedIds.length;
    state.selectedIds = [];
    await loadTransactions();
    renderTable();
    showToast(
      `Đã xóa ${deletedCount} giao dịch`,
      "success"
    );
  } catch (err) {
    console.error(err);
    showToast(
      "Có lỗi xảy ra",
      "danger"
    );
  }
}

// page
function renderPagination(pages) {
  const container = document.getElementById('pagBtns');
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

// filter
function updateFilterBadge() {
  const count = ['month', 'cat', 'type']
    .filter(k => state.filters[k])
    .length;
  const badge = document.getElementById(
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
  const btn = document.getElementById(
    'filterBtn'
  );

  const drop = document.getElementById(
    'filterDrop'
  );

  const fdMonth = document.getElementById(
    'fdMonth'
  );

  // dynamic month
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
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    monthHtml += `
      <option value="${y}-${m}">
        Tháng ${m}, ${y}
      </option>
    `;
  }
  fdMonth.innerHTML = monthHtml;

  // reload category by month
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
      if (!e.target.closest('#filterDrop') && !e.target.closest('#filterBtn')) {
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

// search
function initSearch() {
  document
    .getElementById(
      'searchInput'
    )
    .addEventListener(
      'input',
      function () {
        state.filters.search = this.value;
        state.page = 1;
        renderTable();
      }
    );
}

// page size
function initPageSize() {
  document
    .getElementById(
      'pageSize'
    )
    .addEventListener(
      'change',
      function () {
        state.pageSize = parseInt(this.value);
        state.page = 1;
        renderTable();
      }
    );
}

// validate
function validateForm() {
  const amount = document.getElementById(
    'fAmount'
  ).value;

  const title = document.getElementById(
    'fTitle'
  ).value;

  const select = document.getElementById(
    'fSelect'
  ).value;

  if (!amount || Number(amount) <= 0) {
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


// modal
let activeType = null;
function showStep1() {
  document.getElementById(
    'step1'
  ).style.display = 'block';

  document
    .getElementById('step2')
    .classList.remove('show');
}

// step 2
function showStep2(type) {
  activeType = type;
  document.getElementById(
    'step1'
  ).style.display = 'none';

  document
    .getElementById('step2')
    .classList.add('show');
  const modalHeader =
    document.getElementById('modalHeader');

  modalHeader.classList.remove(
    'income',
    'expense'
  );
  modalHeader.classList.add(type);
  document.getElementById(
    'modalTitle'
  ).textContent =
    type === 'income'
      ? 'Thêm thu nhập'
      : 'Thêm chi tiêu';

  document.getElementById(
    'modalHeaderIcon'
  ).className =
    type === 'income'
      ? 'ti ti-arrow-bar-down'
      : 'ti ti-arrow-bar-up';
  selectedDate =
    getTodayValue();
  const d = new Date(selectedDate);

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

document.addEventListener(
  "change",
  async (e) => {

    if (e.target.id === "fDate") {

      const amount =
        document.getElementById("fAmount")?.value || "";

      const title =
        document.getElementById("fTitle")?.value || "";

      const note =
        document.getElementById("fNote")?.value || "";

      const selected =
        document.getElementById("fSelect")?.value || "";

      selectedDate = e.target.value;

      const d = new Date(selectedDate);

      txMonth = d.getMonth() + 1;
      txYear = d.getFullYear();

      await loadCategories(txMonth, txYear);

      document.getElementById(
        "modalBody"
      ).innerHTML = buildForm(activeType);

      document.getElementById("fAmount").value = amount;
      document.getElementById("fTitle").value = title;
      document.getElementById("fNote").value = note;
      document.getElementById("fSelect").value = selected;
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

// tbao
function showToast(
  message,
  type = "success"
) {
  const area = document.querySelector(
    ".toast-area"
  );
  if (!area) return;
  const toast = document.createElement("div");
  toast.className = `toast t-${type}`;
  toast.textContent = message;
  area.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(120%)";
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3000);
}

// tạo form
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
    .getElementById('btnBack')
    .addEventListener(
      'click',
      showStep1
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

// build form
function buildForm(type) {
  const amtLabel = {
    income: 'Số tiền nhận',
    expense: 'Số tiền chi'
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

// tạo
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
    const data = await res.json();
    if (!res.ok) {
      return alert(
        data.message
      );
    }
    closeModal();
    showToast(
      activeType === "income"
        ? "Đã thêm thu nhập"
        : "Đã thêm chi tiêu",
      "success"
    );
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

// init
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

// xóa hết
document.getElementById('deleteSelected').addEventListener(
  'click',
  deleteSelected
);

// xóa chọn
document.getElementById('clearSelected').addEventListener(
  'click',
  () => {
    state.selectedIds = [];
    document
      .querySelectorAll('.txn-check')
      .forEach(c => {
        c.checked = false;
        c.closest('.txn-row')
          ?.classList.remove(
            'selected'
          );
      });
    const checkAll = document.getElementById(
      'checkAll'
    );
    if (checkAll) {
      checkAll.checked = false;
    }
    updateBulkBar();
  }
);