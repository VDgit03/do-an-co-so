
"use strict";

// API 
const API_URL = "http://localhost:3000/api/cate";
const userId = Number(localStorage.getItem("userId"));

// state
let curMonth = new Date().getMonth() + 1;
let curYear = new Date().getFullYear();

let editId = null;
let isAdd = false;

let selIcon = "ti-tools-kitchen-2";
let selBg = "#fef3c7";
let selFg = "#d97706";

let categories = [];

// dom
const overlay = document.getElementById("overlay");
const editView = document.getElementById("edit-view");
const confirmView = document.getElementById("confirm-view");

const tableBody = document.getElementById("table-body");

const fName = document.getElementById("f-name");
const fBudget = document.getElementById("f-budget");

const btnSave = document.getElementById("btn-save");
const btnDelete = document.getElementById("btn-del");

const elMonthLabel = document.getElementById("mnav-label");

// helper
const fmt = (n) =>
    Number(n || 0).toLocaleString("vi-VN") + "đ";

// load api
async function loadCategories() {
    try {
        const userId = localStorage.getItem("userId");

        const url =
            `${API_URL}/${userId}?month=${curMonth}&year=${curYear}`;

        console.log("FETCH:", url);

        const res = await fetch(url);
        const data = await res.json();

        console.log("API RESPONSE:", data);

        categories = data.categories ?? [];

        render();
        updateSummary();

    } catch (err) {
        console.log(err);
    }
}

// render
function render() {
    tableBody.innerHTML = "";
    if (!categories.length) {
        tableBody.innerHTML = `
            <div class="empty-state">
                Chưa có danh mục
            </div>
        `;
        return;
    }
    categories.forEach((c) => {
        const spent = Number(c.spent || 0);
        const budget = Number(c.budget || 0);
        const p =
            budget > 0
                ? Math.round((spent / budget) * 100)
                : 0;
        let bar = "#4ade80";
        let pill =
            "background:#dcfce7;color:#15803d";
        if (p >= 85) {
            bar = "#f87171";
            pill =
                "background:#fee2e2;color:#b91c1c";
        } else if (p >= 60) {
            bar = "#fbbf24";
            pill =
                "background:#fef3c7;color:#b45309";
        }
        tableBody.innerHTML += `
            <div class="table-row ${p >= 85 ? "warn" : ""}">
                <div 
                    class="cat-ic"
                    style="
                        background:${c.bg_color};
                        color:${c.fg_color};
                    "
                >
                    <i class="ti ${c.icon}"></i>
                </div>
                <div>
                    <div class="cat-name">
                        ${c.name}
                    </div>
                    <div class="cat-type">
                        Chi tiêu
                    </div>
                </div>
                <div>
                    <div
                        class="prog-spent"
                        style="color:${c.fg_color}"
                    >
                        ${fmt(spent)}
                    </div>
                    <div class="prog-budget">
                        Ngân sách: ${fmt(budget)}
                    </div>
                    <div class="prog-bar">
                        <div
                            class="prog-fill"
                            style="
                                width:${Math.min(p, 100)}%;
                                background:${bar}
                            "
                        ></div>
                    </div>
                </div>
                <div>
                    <span
                        class="pct-pill"
                        style="${pill}"
                    >
                        ${p}%
                    </span>
                </div>
                <button
                    class="edit-btn"
                    onclick="openEdit(${c.id})"
                >
                    <i class="ti ti-edit"></i>
                </button>

            </div>
        `;
    });
    updateSummary();
}

// summary
function updateSummary() {

    let total = 0;

    let overBudget = 0;

    categories.forEach((c) => {

        const spent = Number(c.spent || 0);

        const budget = Number(c.budget || 0);

        total += budget;

        // vượt ngân sách
        if (spent > budget && budget > 0) {
            overBudget++;
        }
    });

    document.getElementById("s-exp").textContent =
        fmt(total);

    document.getElementById("s-count").textContent =
        categories.length + " danh mục";

    document.getElementById("s-warn").textContent =
        overBudget + " danh mục";
}

// month
function updateMonthLabel() {

    document.getElementById("mnav-label").textContent =
        `Tháng ${curMonth}/${curYear}`;
}

document.getElementById("btn-prev")
    .addEventListener("click", async () => {
        curMonth--;
        if (curMonth < 1) {
            curMonth = 12;
            curYear--;
        }
        updateMonthLabel();
        await loadCategories();
    });

document.getElementById("btn-next")
    .addEventListener("click", async () => {
        curMonth++;
        if (curMonth > 12) {
            curMonth = 1;
            curYear++;
        }
        updateMonthLabel();
        await loadCategories();
    }); 

// modal
function openModal() {
    overlay.classList.add("open");
}

function closeModal() {
    overlay.classList.remove("open");
    editView.style.display = "block";
    confirmView.classList.remove("show");
    editId = null;
    isAdd = false;
    fName.value = "";
    fBudget.value = "";
}

overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
        closeModal();
    }
});
document.getElementById("btn-close-modal")
    .addEventListener("click", closeModal);
document.getElementById("btn-cancel-modal")
    .addEventListener("click", closeModal);

// open add
function openAdd() {
    isAdd = true;
    editId = null;
    document.getElementById("mh-title").textContent =
        "Thêm danh mục";
    btnSave.textContent = "Thêm danh mục";
    btnDelete.style.display = "none";
    fName.value = "";
    fBudget.value = "";
    updateModalIcon();
    openModal();
}

document.getElementById("btn-add-cat")
    .addEventListener("click", openAdd);
    function updateModalIcon() {
    const iconBox = document.getElementById("mh-ic");
    iconBox.style.background = selBg;
    iconBox.style.color = selFg;
    iconBox.innerHTML = `<i class="ti ${selIcon}"></i>`;
}

// open edit
window.openEdit = function(id) {
    const item = categories.find(x => x.id == id);
    if (!item) return;
    editId = id;
    isAdd = false;
    document.getElementById("mh-title").textContent =
        "Chỉnh sửa danh mục";
    btnSave.textContent = "Lưu thay đổi";
    btnDelete.style.display = "flex";
    fName.value = item.name;
    fBudget.value = item.budget;
    selIcon = item.icon;
    selBg = item.bg_color;
    selFg = item.fg_color;
    document.querySelectorAll(".ic-opt").forEach((x) => {
        x.classList.remove("sel");
        if (x.dataset.i === item.icon) {
            x.classList.add("sel");
        }
    });
    document.querySelectorAll(".clr-opt").forEach((x) => {
        x.classList.remove("sel");

        if (x.dataset.bg === item.bg_color) {
            x.classList.add("sel");
        }
    });
    updateModalIcon();
    openModal();
};

// save
btnSave.addEventListener("click", async () => {
    const name = fName.value.trim();
    const budget = Number(fBudget.value);
    if (!name || !budget) {
        alert("Vui lòng nhập đầy đủ");
        return;
    }
    try {
        if (isAdd) {
            await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    name,
                    icon: selIcon,
                    bg_color: selBg,
                    fg_color: selFg,
                    budget,
                    month: curMonth,
                    year: curYear
                })
            });
        } else {
            await fetch(`${API_URL}/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    name,
                    icon: selIcon,
                    bg_color: selBg,
                    fg_color: selFg,
                    budget,
                    month: curMonth,
                    year: curYear
                })
            });
        }
        closeModal();
        loadCategories();
    } catch (err) {
        console.log(err);
    }
});

// xóa
btnDelete.addEventListener("click", () => {
    editView.style.display = "none";
    confirmView.classList.add("show");
});

document.getElementById("btn-del-confirm")
    .addEventListener("click", async () => {
        try {
            await fetch(
                `${API_URL}/${editId}?month=${curMonth}&year=${curYear}`,{
                    method: "DELETE"
                }
            );
            closeModal();
            loadCategories();
        } catch (err) {
            console.log(err);
        }
    });

// pick icon
document.querySelectorAll(".ic-opt")
    .forEach((item) => {
        item.addEventListener("click", () => {
            selIcon = item.dataset.i;
            document.querySelectorAll(".ic-opt")
                .forEach((x) => {
                    x.classList.remove("sel");
                });
            item.classList.add("sel");
            updateModalIcon(); 
        });
    });

// pick color
document.querySelectorAll(".clr-opt")
    .forEach((item) => {
        item.addEventListener("click", () => {
            selBg = item.dataset.bg;
            selFg = item.dataset.fg;
            document.querySelectorAll(".clr-opt")
                .forEach((x) => {
                    x.classList.remove("sel");
                });
            item.classList.add("sel");
            updateModalIcon(); 
        });
    });

// init
updateMonthLabel();
loadCategories();