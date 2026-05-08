let isLoggingOut = false;

function logoutWithMessage(message) {
    if (isLoggingOut) return;
    isLoggingOut = true;

    localStorage.removeItem("token");

    const popup = document.createElement("div");
    popup.innerHTML = `
        <div style="
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        ">
            <div style="
                background: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                width: 300px;
            ">
                <h3>Thông báo</h3>
                <p>${message}</p>
                <button id="okBtn">OK</button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById("okBtn").onclick = () => {
        window.location.replace("/index.html");
    };
}

async function request(url, options = {}) {
    const res = await fetch("http://localhost:3000" + url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            ...options.headers
        }
    });

    let data = {};
    try {
        data = await res.json();
    } catch (e) {}

    if (res.status === 401) {
        if (data.code === "TOKEN_EXPIRED") {
            logoutWithMessage("Phiên đăng nhập đã hết hạn");
        } else {
            logoutWithMessage("Bạn chưa đăng nhập");
        }
        return;
    }

    if (res.status === 403) {
        logoutWithMessage("Token không hợp lệ");
        return;
    }

    return data;
}
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (e) {
        return true; // token lỗi thì coi như hết hạn
    }
}
window.addEventListener("load", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        return; // chưa đăng nhập
    }

    if (isTokenExpired(token)) {
        logoutWithMessage("Phiên đăng nhập đã hết hạn");
    }
});