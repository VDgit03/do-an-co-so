/* ── CONFIG ── */
const API_URL = 'https://api.anthropic.com/v1/messages';
// Thay bằng API key của bạn (hoặc route qua backend Node.js để bảo mật)
const API_KEY = 'YOUR_API_KEY_HERE';

/* ── STATE (persisted) ── */
let state = {
    messages: [],       // [{role,content,time,pending?}]
    draft: null,        // giao dịch đang chờ xác nhận {desc,amount,type,category}
    transactions: [],   // đã xác nhận
    totals: { income: 0, expense: 0, saving: 0 }
};

function saveState() { localStorage.setItem('mt_state', JSON.stringify(state)); }
function loadState() {
    try {
        const s = localStorage.getItem('mt_state');
        if (s) state = JSON.parse(s);
    } catch (e) { }
}


/* ── QUICK INPUT ── */
function submitQuick() {
    const input = document.getElementById("quick-input");
    const text = input.value.trim();


    openChat();

    document.getElementById('chat-input').value = text;

    sendMessage();

    input.value = "";
}

/* ── OPEN / CLOSE CHAT ── */
function openChat(initialText) {
    document.getElementById('chat-drawer').classList.add('open');
    document.body.style.overflow = 'hidden';

    if (state.messages.length === 0) showWelcome();
    checkDraft();

    if (initialText) {
        document.getElementById('chat-input').value = initialText;
        autoResize(document.getElementById('chat-input'));
        setTimeout(() => sendMessage(), 80);
    } else {
        document.getElementById('chat-input').focus();
    }
}

function closeChat() {
    document.getElementById('chat-drawer').classList.remove('open');
    document.body.style.overflow = '';
}

/* ── WELCOME ── */
function showWelcome() {
    addBotMessage(
        'Xin chào! 👋 Tôi có thể giúp bạn:\n' +
        '• Ghi nhanh thu nhập / chi tiêu\n' +
        '• Tự động phân loại danh mục\n' +
        '• Tạo hoặc cập nhật khoản tiết kiệm\n\n' +
        'Hãy mô tả tự nhiên, ví dụ: *"Ăn sáng 35k"* hoặc *"Lương tháng 5 nhận 15 triệu"*'
    );
    showChips(['Ăn trưa 60k', 'Lương tháng 15tr', 'Tạo tiết kiệm mua xe', 'Xem số dư']);
}

/* ── CHIPS ── */
function showChips(chips) {
    const el = document.getElementById('chips');
    el.innerHTML = chips.map(c =>
        `<button class="chip" onclick="chipClick('${c}')">${c}</button>`
    ).join('');
}

function chipClick(text) {
    document.getElementById('chips').innerHTML = '';
    document.getElementById('chat-input').value = text;
    sendMessage();
}

/* ── MESSAGES RENDER ── */
function renderAllMessages() {
    const el = document.getElementById('chat-messages');
    el.innerHTML = '';
    state.messages.forEach(m => renderMessage(m, false));
    scrollBottom();
}

function renderMessage(msg, scroll = true) {
    const el = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `msg ${msg.role === 'user' ? 'user' : 'bot'}`;

    const avatarText = msg.role === 'user' ? 'T' : '🤖';
    const avatarStyle = msg.role === 'user'
        ? 'background:#1a3a6b;color:#fff'
        : 'background:#e8efff;color:#1a3a6b';

    // Format content: newlines + bold
    let html = (msg.content || '')
        .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    // If message has a pending transaction, append card
    let txnCard = '';
    if (msg.pendingTxn) {
        const t = msg.pendingTxn;
        const colorMap = { income: '#d1fae5', expense: '#fee2e2', saving: '#dbeafe' };
        const bg = colorMap[t.type] || '#f0f4ff';
        txnCard = `
      <div class="txn-card">
        <div class="txn-row"><span class="txn-label">Mô tả</span><span class="txn-val">${t.desc}</span></div>
        <div class="txn-row"><span class="txn-label">Số tiền</span><span class="txn-val">${formatMoney(t.amount)}</span></div>
        <div class="txn-row"><span class="txn-label">Loại</span><span class="txn-val">${typeLabel(t.type)}</span></div>
        <div class="txn-row"><span class="txn-label">Danh mục</span><span class="txn-val">${t.category}</span></div>
        ${t.confirmed ? '<div style="margin-top:8px;color:#1a7f44;font-weight:600;font-size:13px">✅ Đã xác nhận</div>' : `
        <div class="txn-actions">
          <button class="btn-confirm" onclick="confirmTxn()">✓ Xác nhận</button>
          <button class="btn-edit" onclick="editTxn()">✎ Sửa</button>
        </div>`}
      </div>`;
    }

    div.innerHTML = `
    <div class="msg-avatar" style="${avatarStyle}">${avatarText}</div>
    <div>
      <div class="msg-bubble">${html}${txnCard}</div>
      <div class="msg-time">${msg.time || ''}</div>
    </div>`;

    el.appendChild(div);
    if (scroll) scrollBottom();
}

function addBotMessage(content, pendingTxn = null) {
    const msg = { role: 'bot', content, time: nowTime(), pendingTxn };
    state.messages.push(msg);
    saveState();
    renderMessage(msg);
}

function addUserMessage(content) {
    const msg = { role: 'user', content, time: nowTime() };
    state.messages.push(msg);
    saveState();
    renderMessage(msg);
}

/* ── TYPING INDICATOR ── */
function showTyping() {
    const el = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'msg bot'; div.id = 'typing';
    div.innerHTML = `
    <div class="msg-avatar" style="background:#e8efff;color:#1a3a6b">🤖</div>
    <div class="msg-bubble" style="padding:0">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>`;
    el.appendChild(div);
    scrollBottom();
}
function hideTyping() {
    const t = document.getElementById('typing');
    if (t) t.remove();
}

/* ── SEND MESSAGE ── */
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    autoResize(input);
    document.getElementById('chips').innerHTML = '';
    addUserMessage(text);

    // Check pending draft context
    const systemPrompt = buildSystemPrompt();

    // Build conversation history for API
    const history = state.messages
        .filter(m => m.role === 'user' || m.role === 'bot')
        .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));

    // Remove last user message duplicate
    const apiMessages = history.slice(0, -1);
    apiMessages.push({ role: 'user', content: text });

    showTyping();
    setBtnLoading(true);

    try {
        const reply = await callClaude(systemPrompt, apiMessages);
        hideTyping();
        parseAndRender(reply, text);
    } catch (e) {
        hideTyping();
        addBotMessage('❌ Lỗi kết nối API. Vui lòng kiểm tra API key và thử lại.');
        console.error(e);
    }
    setBtnLoading(false);
}

/* ── CLAUDE API ── */
async function callClaude(system, messages) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system,
            messages
        })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.content?.[0]?.text || '';
}

/* ── SYSTEM PROMPT ── */
function buildSystemPrompt() {
    return `Bạn là trợ lý tài chính cá nhân cho ứng dụng Money Track. Người dùng nói tiếng Việt tự nhiên.
 
Nhiệm vụ của bạn:
1. Phát hiện giao dịch (thu nhập, chi tiêu, tiết kiệm) từ tin nhắn
2. Tự động phân loại danh mục
3. Hỏi thêm nếu thiếu thông tin quan trọng
4. Trả về JSON cho giao dịch
 
Danh mục chi tiêu: Ăn uống, Di chuyển, Mua sắm, Giải trí, Y tế, Giáo dục, Hoá đơn, Khác
Danh mục thu nhập: Lương, Thưởng, Đầu tư, Phụ cấp, Khác
Danh mục tiết kiệm: Mua nhà, Mua xe, Du lịch, Khẩn cấp, Khác
 
Khi phát hiện giao dịch, trả lời theo định dạng:
[TRANSACTION]
{"type":"expense|income|saving","desc":"mô tả","amount":50000,"category":"Ăn uống"}
[/TRANSACTION]
Sau đó giải thích ngắn gọn.
 
Nếu người dùng hỏi số dư, trả lời dựa trên: Thu nhập: ${state.totals.income}, Chi tiêu: ${state.totals.expense}, Tiết kiệm: ${state.totals.saving}
Số dư: ${state.totals.income - state.totals.expense}
 
Giữ phong cách thân thiện, ngắn gọn. Đừng hỏi quá nhiều câu hỏi một lúc.`;
}

/* ── PARSE AI RESPONSE ── */
function parseAndRender(reply, userText) {
    const txnMatch = reply.match(/\[TRANSACTION\]([\s\S]*?)\[\/TRANSACTION\]/);

    if (txnMatch) {
        try {
            const txn = JSON.parse(txnMatch[1].trim());
            const cleanReply = reply.replace(/\[TRANSACTION\][\s\S]*?\[\/TRANSACTION\]/, '').trim();

            // Save draft
            state.draft = { ...txn, confirmed: false };
            saveState();
            updatePendingDot(true);
            checkDraft();

            addBotMessage(cleanReply || 'Tôi đã phân tích giao dịch của bạn:', txn);

            showChips(['Xác nhận', 'Sửa số tiền', 'Đổi danh mục', 'Huỷ bỏ']);
        } catch (e) {
            addBotMessage(reply);
        }
    } else {
        addBotMessage(reply);
        // Contextual chips
        const lower = reply.toLowerCase();
        if (lower.includes('tiết kiệm')) showChips(['Tạo tiết kiệm mua nhà', 'Tiết kiệm du lịch']);
        else if (lower.includes('danh mục')) showChips(['Ăn uống', 'Di chuyển', 'Mua sắm']);
        else showChips(['Thêm giao dịch khác', 'Xem số dư', 'Báo cáo tháng']);
    }
}

/* ── CONFIRM / EDIT TXN ── */
function confirmTxn() {
    if (!state.draft) return;
    const t = state.draft;

    // Add to transactions
    state.transactions.unshift({ ...t, id: Date.now(), time: nowTime(), confirmed: true });

    // Update totals
    if (t.type === 'income') state.totals.income += t.amount;
    else if (t.type === 'expense') state.totals.expense += t.amount;
    else if (t.type === 'saving') state.totals.saving += t.amount;

    state.draft = null;
    saveState();

    // Mark last pending message as confirmed
    const lastPending = [...state.messages].reverse().find(m => m.pendingTxn && !m.pendingTxn.confirmed);
    if (lastPending) { lastPending.pendingTxn.confirmed = true; saveState(); }

    renderAllMessages();
    renderSummary();
    renderTransactions();
    updatePendingDot(false);
    checkDraft();

    addBotMessage(`✅ Đã ghi *${t.desc}* – *${formatMoney(t.amount)}* vào danh mục *${t.category}*.\n\nBạn có muốn thêm giao dịch nào khác không?`);
    showChips(['Thêm giao dịch', 'Xem số dư', 'Tạo tiết kiệm']);
}

function editTxn() {
    addBotMessage('Bạn muốn sửa thông tin nào? Số tiền, danh mục, hay mô tả?');
    showChips(['Sửa số tiền', 'Đổi danh mục', 'Sửa mô tả']);
}

function discardDraft() {
    state.draft = null;
    saveState();
    updatePendingDot(false);
    checkDraft();
    addBotMessage('Đã xoá giao dịch nháp.');
}

/* ── DRAFT BAR ── */
function checkDraft() {
    const bar = document.getElementById('draft-bar');
    if (state.draft && !state.draft.confirmed) {
        bar.classList.add('show');
        document.getElementById('draft-desc').textContent = state.draft.desc || 'chưa đặt tên';
    } else {
        bar.classList.remove('show');
    }
}
/* ── UTILS ── */
function formatMoney(n) {
    if (!n && n !== 0) return '';
    if (n === 0) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}
function typeLabel(t) {
    return { income: 'Thu nhập', expense: 'Chi tiêu', saving: 'Tiết kiệm' }[t] || t;
}
function nowTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function scrollBottom() {
    const el = document.getElementById('chat-messages');
    setTimeout(() => el.scrollTop = el.scrollHeight, 30);
}
function setBtnLoading(loading) {
    document.getElementById('btn-send').disabled = loading;
}
function updatePendingDot(show) {
    document.getElementById('pending-dot').classList.toggle('show', show);
}
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}
function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); sendMessage();
    }
}

// Init pending dot
updatePendingDot(!!state.draft && !state.draft?.confirmed);