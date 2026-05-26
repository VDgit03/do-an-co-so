const API_URL = "http://localhost:3000/api/wallet";

// format
function fmt(n) {
    return Number(n).toLocaleString("vi-VN") + " ₫";
}

// chống xss
function esc(s) {
    return (s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
// format vn
function fmtDate(date) {
    return new Date(date).toLocaleDateString("vi-VN");
}

// thông báo
function toast(msg, type = "success") {
    const area = document.getElementById("toast-area");
    const t = document.createElement("div");
    t.className = `toast t-${type}`;
    t.innerHTML = msg;
    area.innerHTML = "";
    area.appendChild(t);
    setTimeout(() => {
        t.remove();
    }, 2500);
}

let wallets = [];

// cate ví
const CATEGORIES = {
    salary: {
        label: "Lương",
        icon: "ti-building-bank",
        badge: "b-salary",
        icon_cls: "i-salary"
    },
    freelance: {
        label: "Freelance",
        icon: "ti-code",
        badge: "b-freelance",
        icon_cls: "i-freelance"
    },
    investment: {
        label: "Đầu tư",
        icon: "ti-trending-up",
        badge: "b-investment",
        icon_cls: "i-invest"
    },
    bonus: {
        label: "Thưởng",
        icon: "ti-gift",
        badge: "b-bonus",
        icon_cls: "i-bonus"
    },
    other: {
        label: "Khác",
        icon: "ti-box",
        badge: "b-other",
        icon_cls: "i-other"
    }
};

// lấy ví
async function loadWallets() {
    try {
        const userId = localStorage.getItem("userId");
        const res = await fetch(
            `${API_URL}/user/${userId}`
        );
        const data = await res.json();
        wallets = data;
        render();
    } catch (err) {
        console.error(err);
        toast(
            "Không thể tải dữ liệu",
            "danger"
        );
    }
}

// thống kê
function renderStats(rows) {
    const total = rows.reduce(
        (sum, r) =>
            sum + Number(r.amount),
        0
    );
    const avg = rows.length
        ? total / rows.length
        : 0;

    const max = rows.length
        ? Math.max(
            ...rows.map(
                r => Number(r.amount)
            )
        )
        : 0;

    document.getElementById("s-total").textContent = fmt(total);
    document.getElementById("s-cnt").textContent = rows.length + " khoản";
    document.getElementById("s-max").textContent = fmt(max);
    document.getElementById("s-max-name").textContent = rows.find(
            r => Number(r.amount) === max
        )?.name || "—";

    document.getElementById("s-avg").textContent = fmt(avg);
    document.getElementById("s-month").textContent = fmt(total);
    document.getElementById("s-month-cnt").textContent = rows.length + " khoản";
}

// bộ lọc
function toggleFilterPanel() {
    const panel = document.getElementById("filter-panel");
    const btn = document.getElementById("filter-toggle-btn");

    panel.classList.toggle("open");
    btn.classList.toggle(
        "active",
        panel.classList.contains("open")
    );

    updateFilterBadge();
}

// hiện số lọc
function updateFilterBadge() {
    const btn =document.getElementById("filter-toggle-btn");

    // xoá badge cũ nếu có
    const oldBadge = btn.querySelector(".filter-badge");

    if (oldBadge) {
        oldBadge.remove();
    }

    let count = 0;

    // search
    const q = document.getElementById("q") ?.value.trim();

    if (q) count++;

    // category
    const cat = document.getElementById("fcat") ?.value;

    if (cat) count++;

    // sort
    const sort = document.getElementById("fsort") ?.value;

    if (sort && sort !== "date-desc") {
        count++;
    }

    // nếu có filter thì hiện badge
    if (count > 0) {
        const badge = document.createElement("span");
        badge.className = "filter-badge";
        badge.textContent = count;
        btn.appendChild(badge);
        btn.classList.add("active");
    } else {
        btn.classList.remove("active");
    }
}

// lọc + sx
function getFiltered() {
    const q = document.getElementById("q") ?.value.toLowerCase().trim();
    const cat = document.getElementById("fcat") ?.value;
    const sort = document.getElementById("fsort") ?.value;
    let rows = wallets.filter(r => {
        if (q && !r.name.toLowerCase().includes(q) && !(r.note || "").toLowerCase().includes(q)) {
            return false;
        }
        if (cat && r.type !== cat) {
            return false;
        }
        return true;
    });
    rows.sort((a, b) => {
        if (sort === "amt-desc") {
            return b.amount - a.amount;
        }
        if (sort === "amt-asc") {
            return a.amount - b.amount;
        }
        if (sort === "name-asc") {
            return a.name.localeCompare(
                b.name,
                "vi"
            );
        }
        return new Date(b.created_at)
            - new Date(a.created_at);
    });
    return rows;
}

// html ví
function buildCard(r) {
    const cat = CATEGORIES[r.type] || CATEGORIES.other;
    return `
        <div class="wcard">
            <div class="wc-head">
                <div class="wc-icon ${cat.icon_cls}">
                    <i class="ti ${cat.icon}"></i>
                </div>
                <div class="wc-acts">
                    <button class="ib" onclick="openEdit(${r.id})">
                        <i class="ti ti-edit"></i>
                    </button>
                    <button class="ib del" onclick="deleteWallet(${r.id})">
                        <i class="ti ti-trash"></i>
                    </button>
                </div>
            </div>
            <div class="wc-amt">${fmt(r.amount)}</div>
            <div class="wc-name">${esc(r.name)}</div>
            <div class="wc-note">${esc(r.note || "Không có ghi chú")}</div>
            <div class="wc-foot">
                <span class="badge ${cat.badge}"> ${cat.label} </span>
                <span class="wc-date"> ${fmtDate(r.created_at)} </span>
            </div>
        </div>
    `;
}

// hiện all
function render() {
    const rows = getFiltered();
    renderStats(rows);
    const grid = document.getElementById("grid");
    if (!rows.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="ti ti-wallet"></i>
                <p>Chưa có ví nào</p>
            </div>
        `;
        return;
    }
    grid.innerHTML = rows.map(buildCard).join("");
}

// hiện popup
function showModal(html) {
    document.getElementById("modal-area").innerHTML = html;
}

// đóng popup
function closeModal() {
    document.getElementById("modal-area").innerHTML = "";
}

// thêm ví
function openAdd() {
    showModal(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-hd">
                    <h3>Thêm ví mới</h3>
                </div>
                <div class="field">
                    <label>Tên ví</label>
                    <input type="text" id="f-name" placeholder="Ví dụ: Lương tháng 5" />
                </div>
                <div class="field">
                    <label>Loại</label>
                    <select id="f-type" onchange="changeWalletPreview()">
                        <option value="salary">Lương</option>
                        <option value="freelance">Freelance</option>
                        <option value="investment">Đầu tư</option>
                        <option value="bonus">Thưởng</option>
                        <option value="other">Khác</option>
                    </select>
                </div>
                <div class="field">
                    <label>Số tiền</label>
                    <input type="number" id="f-amount" placeholder="0" />
                </div>
                <div class="field">
                    <label>Ghi chú</label>
                    <textarea id="f-note"></textarea>
                </div>
                <div class="modal-ft">
                    <button class="btn" onclick="closeModal()">Hủy</button>
                    <button class="btn btn-prim" onclick="saveWallet()">Thêm ví</button>
                </div>
            </div>
        </div>
    `);
}

// lưu
async function saveWallet() {
    const userId = localStorage.getItem("userId");
    const name = document.getElementById("f-name").value.trim();
    const type = document.getElementById("f-type").value;
    const amount = document.getElementById("f-amount").value;
    const note = document.getElementById("f-note").value.trim();
    if (!name) {
        return toast("Nhập tên ví");
    }
    if (!amount || amount <= 0) {
        return toast("Số tiền không hợp lệ");
    }
    try {
        const res = await fetch(
            API_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    name,
                    type,
                    amount,
                    note
                })
            }
        );
        const data = await res.json();
        console.log(data);
        if (!res.ok) {
            throw new Error(data.message);
        }
        closeModal();
        await loadWallets();
        render();
        toast("Thêm ví thành công");
    } catch (err) {
        console.error(err);
        toast(
            "Không thể thêm ví",
        );
    }
}

// tìm ví theo id
function openEdit(id) {
    const wallet = wallets.find(w => w.id === id);
    if (!wallet) return;
    showModal(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-hd">
                    <h3>Chỉnh sửa ví</h3>
                </div>
                <div class="field">
                    <label>Tên ví</label>
                    <input
                        type="text"
                        id="f-name"
                        value="${esc(wallet.name)}"
                    >
                </div>
                <div class="field">
                    <label>Loại</label>
                    <select id="f-type">
                        <option value="salary"
                            ${wallet.type === "salary" ? "selected" : ""}
                        >
                            Lương
                        </option>
                        <option value="freelance"
                            ${wallet.type === "freelance" ? "selected" : ""}
                        >
                            Freelance
                        </option>
                        <option value="investment"
                            ${wallet.type === "investment" ? "selected" : ""}
                        >
                            Đầu tư
                        </option>
                        <option value="bonus"
                            ${wallet.type === "bonus" ? "selected" : ""}
                        >
                            Thưởng
                        </option>
                        <option value="other"
                            ${wallet.type === "other" ? "selected" : ""}
                        >
                            Khác
                        </option>
                    </select>
                </div>
                <div class="field">
                    <label>Số tiền</label>
                    <input
                        type="number"
                        id="f-amount"
                        value="${wallet.amount}"
                    >
                </div>
                <div class="field">
                    <label>Ghi chú</label>
                    <textarea id="f-note">
                        ${wallet.note || ""}
                    </textarea>
                </div>
                <div class="modal-ft">
                    <button
                        class="btn"
                        onclick="closeModal()"
                    >
                        Hủy
                    </button>
                    <button
                        class="btn btn-prim"
                        onclick="updateWallet(${wallet.id})"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    `);
}

// update
async function updateWallet(id) {

    const name = document.getElementById("f-name").value.trim();
    const type = document.getElementById("f-type").value;
    const amount = document.getElementById("f-amount").value;
    const note = document.getElementById("f-note").value.trim();
    try {
        const res = await fetch(
            `${API_URL}/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    name,
                    type,
                    amount,
                    note
                })
            }
        );
        if (!res.ok) {
            throw new Error();
        }
        closeModal();
        await loadWallets();
        toast("Cập nhật thành công");
    } catch (err) {
        console.error(err);
        toast(
            "Không thể cập nhật",
            "danger"
        );
    }
}

// xóa
async function deleteWallet(id) {
    const confirmDelete = confirm("Bạn có chắc muốn xóa?");
    if (!confirmDelete) return;
    try {
        const res = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );
        if (!res.ok) {
            throw new Error();
        }
        wallets = wallets.filter(w => w.id !== id);
        render();
        toast("Đã xóa ví");
    } catch (err) {
        console.error(err);
        toast(
            "Không thể xóa ví",
            "danger"
        );
    }
}

// tải lại data
loadWallets();