const API_URL = "http://localhost:3000/api";

const USER_ID =
    localStorage.getItem("userId");

let activeType = "expense";

let wallets = [];
let categories = [];

// ======================
// load data
// ======================

async function loadWallets() {
    try {
        const res = await fetch(
            `${API_URL}/wallet/user/${USER_ID}`
        );

        const data =
            await res.json();

        wallets =
            data.wallets || [];
    } catch (err) {
        console.error(err);
    }
}

async function loadCategories(
    month,
    year
) {
    try {

        // mặc định tháng hiện tại
        if (!month || !year) {

            const now =
                new Date();

            month =
                now.getMonth() + 1;

            year =
                now.getFullYear();
        }

        const res = await fetch(
            `${API_URL}/cate/${USER_ID}?month=${month}&year=${year}`
        );

        const data =
            await res.json();

        categories =
            data.categories || [];

    } catch (err) {
        console.error(err);
    }
}

// đổi tháng -> reload category
document.addEventListener(
    "change",
    async (e) => {

        if (e.target.id === "fDate") {

            // lưu dữ liệu cũ
            const amount =
                document.getElementById(
                    "fAmount"
                )?.value || "";

            const title =
                document.getElementById(
                    "fTitle"
                )?.value || "";

            const note =
                document.getElementById(
                    "fNote"
                )?.value || "";

            // category đang chọn
            const selected =
                document.getElementById(
                    "fSelect"
                )?.value || "";

            const date =
                e.target.value;

            const d =
                new Date(date);

            const month =
                d.getMonth() + 1;

            const year =
                d.getFullYear();

            // reload category theo tháng
            await loadCategories(
                month,
                year
            );

            // render lại form
            document.getElementById(
                "modalBody"
            ).innerHTML =
                buildForm(activeType);

            // restore dữ liệu cũ
            document.getElementById(
                "fAmount"
            ).value = amount;

            document.getElementById(
                "fTitle"
            ).value = title;

            document.getElementById(
                "fNote"
            ).value = note;

            document.getElementById(
                "fDate"
            ).value = date;

            // restore category cũ nếu còn tồn tại
            const select =
                document.getElementById(
                    "fSelect"
                );

            const exists =
                [...select.options]
                .some(
                    o =>
                        o.value ===
                        selected
                );

            if (exists) {
                select.value =
                    selected;
            }
        }
    }
);

// ======================
// helper
// ======================

function buildOptions(
    arr,
    placeholder
) {
    return `
        <option value="">
            ${placeholder}
        </option>

        ${arr
            .map(
                item => `
            <option value="${item.id}">
                ${item.name}
            </option>
        `
            )
            .join("")}
    `;
}

function getToday() {
    const now = new Date();

    const pad = n =>
        String(n).padStart(2, "0");

    return `${now.getFullYear()}-${pad(
        now.getMonth() + 1
    )}-${pad(now.getDate())}`;
}

// ======================
// modal
// ======================

function openModal() {
    const overlay =
        document.getElementById(
            "overlay"
        );

    if (!overlay) return;

    overlay.classList.add(
        "open"
    );

    showStep1();
}

function closeModal() {
    const overlay =
        document.getElementById(
            "overlay"
        );

    if (!overlay) return;

    overlay.classList.remove(
        "open"
    );
}

function showStep1() {
    document.getElementById(
        "step1"
    ).style.display = "block";

    document
        .getElementById(
            "step2"
        )
        .classList.remove(
            "show"
        );
}

function showStep2(type) {

    activeType = type;

    document.getElementById(
        "step1"
    ).style.display = "none";

    document
        .getElementById(
            "step2"
        )
        .classList.add("show");

    // ===== HEADER =====
    const header =
        document.getElementById(
            "modalHeader"
        );

    header.classList.remove(
        "income",
        "expense"
    );

    header.classList.add(type);

    // ===== TITLE =====
    document.getElementById(
        "modalTitle"
    ).textContent =
        type === "income"
            ? "Thêm thu nhập"
            : "Thêm chi tiêu";

    // ===== ICON =====
    const icon =
        document.getElementById(
            "modalHeaderIcon"
        );

    icon.className =
        type === "income"
            ? "ti ti-arrow-bar-down"
            : "ti ti-arrow-bar-up";

    // ===== BUTTON SAVE =====
    const btnSave =
        document.getElementById(
            "btnSave"
        );

    btnSave.classList.remove(
        "income",
        "expense"
    );

    btnSave.classList.add(type);

    // ===== RENDER FORM =====
    document.getElementById(
        "modalBody"
    ).innerHTML =
        buildForm(type);
}

function showToast(
    message,
    type = "success"
) {
    const area =
        document.getElementById(
            "toastArea"
        );

    if (!area) return;

    const toast =
        document.createElement("div");

    toast.className =
        `toast t-${type}`;

    toast.textContent =
        message;

    area.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity =
            "0";

        toast.style.transform =
            "translateX(120%)";

        setTimeout(() => {
            toast.remove();
        }, 400);

    }, 2500);
}
// ======================
// form
// ======================

function buildForm(type) {
    const selectField =
        type === "income"
            ? `
        <div>
            <label class="form-label">
                Ví nhận
            </label>

            <select
                class="form-select"
                id="fSelect"
            >
                ${buildOptions(
                    wallets,
                    "Chọn ví"
                )}
            </select>
        </div>
    `
            : `
        <div>
            <label class="form-label">
                Danh mục
            </label>

            <select
                class="form-select"
                id="fSelect"
            >
                ${buildOptions(
                    categories,
                    "Chọn danh mục"
                )}
            </select>
        </div>
    `;

    return `
        <div class="form-group">
            <label class="form-label">
                Số tiền
            </label>

            <input
                type="number"
                class="form-input"
                id="fAmount"
            >
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
                    value="${getToday()}"
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

// ======================
// save
// ======================

async function saveTransaction() {
    const amount =
        Number(
            document.getElementById(
                "fAmount"
            ).value
        );

    const title =
        document
            .getElementById(
                "fTitle"
            )
            .value.trim();

    const selectId =
        document.getElementById(
            "fSelect"
        ).value;

    if (!amount || amount <= 0) {
        return alert(
            "Nhập số tiền hợp lệ"
        );
    }

    if (!title) {
        return alert(
            "Nhập tiêu đề"
        );
    }

    if (!selectId) {
        return alert(
            "Vui lòng chọn"
        );
    }

    const payload = {
        user_id: Number(USER_ID),

        type: activeType,

        amount,

        title,

        note: document
            .getElementById(
                "fNote"
            )
            .value.trim(),

        transaction_date:
            document.getElementById(
                "fDate"
            ).value,
    };

    if (
        activeType === "income"
    ) {
        payload.wallet_id =
            Number(selectId);
    } else {
        payload.category_id =
            Number(selectId);
    }

    try {
        const res = await fetch(
            `${API_URL}/transaction`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(
                    payload
                ),
            }
        );

        const data =
            await res.json();

        if (!res.ok) {
            return showToast(
                data.message,
                "danger"
            );
        }

        showToast(
            activeType === "income"
                ? "Đã thêm thu nhập"
                : "Đã thêm chi tiêu",
            "success"
        );

        closeModal();

        // cập nhật data
        await loadWallets();

        const date =
            document.getElementById("fDate").value;

        const d = new Date(date);

        await loadCategories(
            d.getMonth() + 1,
            d.getFullYear()
        );

        // chờ toast hiện rồi chuyển trang
        setTimeout(() => {

            window.location.href =
                "/frontend/custom/transaction/transaction.html";

        }, 100);
    } catch (err) {
        console.error(err);

        showToast(
    "Có lỗi xảy ra",
    "danger"
);
    }
}

// ======================
// init
// ======================

async function initHomeTransaction() {
    await Promise.all([
        loadWallets(),
        loadCategories(),
    ]);

    // open
    const btnOpen =
        document.getElementById(
            "btnOpenModal"
        );

    if (btnOpen) {
        btnOpen.addEventListener(
            "click",
            openModal
        );
    }

    // close
    document
        .getElementById(
            "btnClose"
        )
        ?.addEventListener(
            "click",
            closeModal
        );

    document
        .getElementById(
            "btnCancelStep1"
        )
        ?.addEventListener(
            "click",
            closeModal
        );

    document
        .getElementById(
            "btnCancelStep2"
        )
        ?.addEventListener(
            "click",
            closeModal
        );

    // save
    document
        .getElementById(
            "btnSave"
        )
        ?.addEventListener(
            "click",
            saveTransaction
        );

    // type
    document
        .querySelectorAll(
            ".type-card"
        )
        .forEach(card => {
            card.addEventListener(
                "click",
                () => {
                    showStep2(
                        card.dataset
                            .type
                    );
                }
            );
        });

    // back
    document
        .getElementById(
            "btnBack"
        )
        ?.addEventListener(
            "click",
            showStep1
        );
}

initHomeTransaction();
