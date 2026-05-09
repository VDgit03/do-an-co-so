// xem mk
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

// đổi tab
function switchTab(tab) {
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');

    let file = tab === 'login' ? 'login.html' : 'register.html';

    fetch(file)
        .then(res => res.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;

            if (tab === "login") {
                setTimeout(initGoogle, 0); 
            }
        });
}
// load mặc định
window.onload = () => switchTab('login');

// kiểm tra mk
function checkStrength(val) {
    const segs = ['s1','s2','s3','s4'].map(id => document.getElementById(id));
    const label = document.getElementById('strength-text');
    segs.forEach(s => { s.style.background = 'rgba(255,255,255,0.1)'; });
    if (!val) { label.textContent = ''; return; }
    let score = 0;
    if (val.length >= 8)  score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const colors  = ['#E24B4A','#EF9F27','#1D9E75','#4FAAFF'];
    const labels  = ['Rất yếu','Trung bình','Khá mạnh','Rất mạnh'];
    for (let i = 0; i < score; i++) segs[i].style.background = colors[Math.min(score-1,3)];
    label.textContent = labels[Math.min(score-1,3)];
    label.style.color = colors[Math.min(score-1,3)];
  }

// đki
async function handleRegister() {
    const form = document.getElementById("sec-register");

    const first_name = form.querySelector('[name="first_name"]').value.trim();
    const last_name = form.querySelector('[name="second_name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="pw"]').value.trim();
    const confirm = form.querySelector('[name="confirm"]').value.trim();

    const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            first_name,
            last_name,
            email,
            password,
            confirm,
        }),
    });

    const data = await res.json();
    alert(data.message);
}

// đăng nhập
async function handleLogin() {
    const form = document.getElementById("sec-login");
    const email = document.querySelector('[name="email"]').value.trim();
    const password = document.querySelector('[name="pw"]').value.trim();
    const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem(
        "userId",
        data.user.id
    );
    alert("Đăng nhập thành công!");
    window.location.href =
        "../custom/home/home.html";
    } else {
        alert(data.message);
    }
}

// tạo client id
function initGoogle() {
    if (!window.google) return;
    google.accounts.id.initialize({
        client_id: "72957436394-072ebp2pnfbobbikh3hgb4a4i8fsc7sn.apps.googleusercontent.com",
        callback: handleGoogleLogin
    });
    const btn = document.getElementById("google-btn");
    if (!btn) return;
    google.accounts.id.renderButton(btn, {
        theme: "outline",
        size: "large"
    });
}

// đăng nhập = gg
async function handleGoogleLogin(response) {
    const res = await fetch(
        "http://localhost:3000/api/auth/google",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: response.credential
            })
        }
    );
    const data = await res.json();
    console.log(data);
    if (data.token) {
        localStorage.setItem(
            "token",
            data.token
        );
        localStorage.setItem(
            "userId",
            data.user.id
        );
        window.location.href =
            "../custom/home/home.html";
    }
}