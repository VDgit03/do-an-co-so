// button wallet
function toggleWalletMenu(){
    const menu = document.getElementById("walletMenu");
    const arrow = document.querySelector(".arrow");
    menu.classList.toggle("show");
    arrow.classList.toggle("rotate");
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

// user name
async function loadUser() {
    try {
        const userId = localStorage.getItem("userId");
        const res = await fetch(
            `http://localhost:3000/api/auth/user/${userId}`
        );
        const data = await res.json();
        document.getElementById("username")
            .textContent = data.fullname;
    } catch (err) {
        console.error(err);
    }
}

// button user
function toggleUserMenu() {
    document.getElementById("userMenu").classList.toggle("show");
}
document.addEventListener("click", (e) => {
    const user = document.querySelector(".user");
    const menu = document.getElementById("userMenu");
    if ( user && !user.contains(e.target)) {
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

// đổi mk
function changePassword() {
    window.location.href = "./changepw.html"
}