// button user
function toggleUserMenu() {
    document.getElementById("userMenu").classList.toggle("show");
}
document.addEventListener("click", (e) => {
    const user = document.querySelector(".user");
    const menu = document.getElementById("userMenu");
    if (user && !user.contains(e.target)) {
        menu.classList.remove("show");
    }
});

// logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href =
        "../../auth/index.html";
}

// time
function updateDateTime() {
    const now = new Date();
    const weekdays = [
        "Chủ nhật",
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7"
    ];
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const text = `${weekdays[now.getDay()]}, ${day} tháng ${month}, ${year}`;
    document.getElementById("current-date").textContent = text;
}
updateDateTime();
setInterval(updateDateTime, 60000);

// username
async function loadUser() {
    try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        const res = await fetch(
            `http://localhost:3000/api/auth/user/${userId}`
        );
        const data = await res.json();

        // username
        document.getElementById("username")
            .textContent = data.fullname;

        // lần đổi mật khẩu
        renderLastPasswordChange(
            data.lastPasswordChange
        );
    } catch (err) {
        console.error(err);
    }
}

// last change
function renderLastPasswordChange(dateString) {
    const dateEl = document.getElementById(
        "last-date"
    );
    const agoEl = document.getElementById(
        "last-ago"
    );

    // không có element thì dừng
    if (!dateEl || !agoEl) return;


    // chưa từng đổi
    if (!dateString) {
        dateEl.textContent = "Chưa đổi";
        agoEl.textContent = "";
        return;
    }
    const date = new Date(dateString);

    // format ngày
    const formatted =
        date.toLocaleDateString(
            "vi-VN",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    dateEl.textContent =
        formatted;

    // tính ngày trước
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
        agoEl.textContent = "";
    } else {
        agoEl.textContent = `${diffDays} ngày trước`;
    }
}

// đổi mk
function changePassword() {
    window.location.href = "/frontend/custom/home/changepw.html"
}
async function handleChangePassword() {
    try {
        const oldPassword = document.getElementById("oldPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const userId = localStorage.getItem("userId");

        // validate
        if (!oldPassword || !newPassword || !confirmPassword) {
            alert(
                "Vui lòng nhập đầy đủ"
            );
            return;
        }

        // confirm password
        if (
            newPassword !==
            confirmPassword
        ) {
            alert(
                "Mật khẩu xác nhận không khớp"
            );
            return;
        }

        // request
        const res = await fetch(
            "http://localhost:3000/api/auth/changepw",
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    userId,
                    oldPassword,
                    newPassword,
                    confirmPassword
                })
            }
        );
        const data = await res.json();

        // account google
        if (data.isGoogle) {
            document.querySelector(".form").innerHTML =
                `
            <h2>
                Tài khoản Google
            </h2>
            <p>
                Không thể đổi mật khẩu
            </p>
            `;
            return;
        }

        // lỗi
        if (!res.ok) {
            alert(data.message);
            return;
        }

        // success
        alert(data.message);
        window.location.href = "./home.html";
    } catch (err) {
        console.error(err);
    }
}

// xem mật khẩu
function togglePassword(el) {
    const wrapper = el.closest(".input");
    const pw = wrapper.querySelector("input");
    const icon = el.querySelector("i");

    if (pw.type === "password") {
        pw.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        pw.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}
// kiểm tra mk
function checkStrength(val) {
    const segs = ['s1', 's2', 's3', 's4'].map(id => document.getElementById(id));
    const label = document.getElementById('strength-text');
    segs.forEach(s => { s.style.background = 'rgba(255,255,255,0.1)'; });
    if (!val) { label.textContent = ''; return; }
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const colors = ['#E24B4A', '#EF9F27', '#1D9E75', '#4FAAFF'];
    const labels = ['Rất yếu', 'Trung bình', 'Khá mạnh', 'Rất mạnh'];
    for (let i = 0; i < score; i++) segs[i].style.background = colors[Math.min(score - 1, 3)];
    label.textContent = labels[Math.min(score - 1, 3)];
    label.style.color = colors[Math.min(score - 1, 3)];
}
