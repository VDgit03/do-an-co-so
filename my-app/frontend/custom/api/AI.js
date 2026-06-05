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
    if (text === "🎯 Mở mục Tiết kiệm") {
        window.location.href = "/goals";
        return;
    }
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
    state.pendingGoal = null;
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
    if (state.pendingGoal) {

        const amount =
            parseMoney(message);

        if (!amount) {

            addBotMessage(
                "Vui lòng nhập số tiền mục tiêu."
            );

            return;
        }

        state.draft = {
            action: "create_goal",
            name: state.pendingGoal.name,
            target_amount: amount
        };

        state.pendingGoal = null;

        saveState();

        renderGoalDraft(state.draft);

        return;
    }

    try {
        const reply =
            await callGemini(
                systemPrompt,
                apiMessages
            );

        hideTyping();

        parseAndRender(
            reply,
            text
        );

    } catch (e) {
        hideTyping();
        addBotMessage('❌ Lỗi kết nối API. Vui lòng kiểm tra API key và thử lại.');
        console.error(e);
    }
    setBtnLoading(false);
}

/* ── CLAUDE API ── */
async function callGemini(
    system,
    messages
) {
    const res =
        await fetch(
            "http://localhost:3000/api/ai/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    system,
                    messages
                })
            }
        );

    const data =
        await res.json();

    if (!data.success) {
        throw new Error(
            data.message
        );
    }

    return data.reply;
}

/* ── SYSTEM PROMPT ── */
function buildSystemPrompt() {
    return `
Bạn là trợ lý tài chính của ứng dụng Money Track.

Nhiệm vụ của bạn là phân tích tin nhắn người dùng và xác định ý định.

CHỈ hỗ trợ các action sau:

1. create_transaction
2. delete_transaction
3. get_balance
4. highest_category

========================
QUY TẮC TẠO GIAO DỊCH
=====================

Nếu người dùng đang mô tả một khoản thu hoặc chi tiêu, hãy trả về đúng định dạng:

[ACTION]
{
"action":"create_transaction",
"type":"expense",
"title":"Ăn phở",
"amount":50000,
"category":"Ăn uống"
}
[/ACTION]

Các giá trị type hợp lệ:

* expense
* income

Ví dụ:

"Ăn sáng 50k"

[ACTION]
{
"action":"create_transaction",
"type":"expense",
"title":"Ăn sáng",
"amount":50000,
"category":"Ăn uống"
}
[/ACTION]

"Lương tháng này 15 triệu"

[ACTION]
{
"action":"create_transaction",
"type":"income",
"title":"Lương tháng này",
"amount":15000000,
"category":"Lương"
}
[/ACTION]

LUÔN sử dụng field:

"title"

KHÔNG sử dụng:

"desc"

========================
XÓA GIAO DỊCH
=============

Khi người dùng muốn xóa giao dịch:

[ACTION]
{
  "action":"delete_transaction",
  "keyword":"từ khóa giao dịch"
}
[/ACTION]

Ví dụ:

Người dùng:
xóa giao dịch ăn haidilao

Trả về:

[ACTION]
{
  "action":"delete_transaction",
  "keyword":"haidilao"
}
[/ACTION]

========================
XEM SỐ DƯ
=========

Nếu người dùng hỏi:

* Tôi còn bao nhiêu tiền?
* Số dư hiện tại là bao nhiêu?
* Xem số dư

Trả về:

[ACTION]
{
"action":"get_balance"
}
[/ACTION]

========================
DANH MỤC TỐN KÉM NHẤT
=====================

Nếu người dùng hỏi:

* Danh mục nào tốn tiền nhất?
* Tôi đang chi nhiều nhất vào đâu?

Trả về:

[ACTION]
{
"action":"highest_category"
}
[/ACTION]

========================
TIẾT KIỆM VÀ MỤC TIÊU
=====================

Nếu người dùng muốn:

* tạo mục tiêu
* tiết kiệm
* lập kế hoạch tiết kiệm
* mua xe
* mua nhà
* mua laptop
* mục tiêu tài chính

KHÔNG tạo ACTION.

Chỉ trả lời:

🎯 Bạn có thể tạo mục tiêu tiết kiệm tại mục "Tiết kiệm" của ứng dụng.

========================
TRÒ CHUYỆN THÔNG THƯỜNG
=======================

Nếu người dùng chỉ hỏi thông tin, xin lời khuyên tài chính hoặc trò chuyện thông thường:

* Trả lời tự nhiên bằng tiếng Việt.
* Không tạo ACTION.

========================
QUY TẮC QUAN TRỌNG
==================

* Chỉ trả ACTION khi chắc chắn nhận diện được một action hợp lệ.
* Không giải thích JSON.
* Không đặt JSON trong markdown.
* Không thêm văn bản trước hoặc sau ACTION.
* Amount luôn là số nguyên (VND).
* Luôn dùng field "title".

`;
}

/* ── PARSE AI RESPONSE ── */
function parseAndRender(reply, userText) {

    const actionMatch =
        reply.match(
            /\[ACTION\]([\s\S]*?)\[\/ACTION\]/
        );

    // Không có ACTION -> chat bình thường
    if (!actionMatch) {

        addBotMessage(reply);

        const lower = reply.toLowerCase();

        if (
            lower.includes("tiết kiệm") ||
            lower.includes("mục tiêu")
        ) {

            showChips([
                "Mở mục Tiết kiệm",
                "Xem mục tiêu hiện có"
            ]);

        } else if (
            lower.includes("danh mục")
        ) {

            showChips([
                "Ăn uống",
                "Di chuyển",
                "Mua sắm"
            ]);

        } else {

            showChips([
                "Thêm giao dịch khác",
                "Xem báo cáo tháng",
                "Xem chi tiêu gần đây"
            ]);

        }

        return;
    }

    try {

        const action =
            JSON.parse(
                actionMatch[1].trim()
            );

        const cleanReply =
            reply.replace(
                /\[ACTION\][\s\S]*?\[\/ACTION\]/,
                ""
            ).trim();

        // Chỉ transaction mới hiện form xác nhận
        if (
            action.action ===
            "create_transaction"
        ) {

            state.draft = {
                ...action,
                confirmed: false
            };

            saveState();
            updatePendingDot(true);
            checkDraft();

            addBotMessage(
                cleanReply ||
                "Tôi đã phân tích giao dịch của bạn:",
                action
            );

            return;
        }

        // Các action khác chạy luôn
        executeAction(action);

    } catch (err) {

        console.error(
            "Parse ACTION error:",
            err
        );

        addBotMessage(
            "Không thể xử lý yêu cầu."
        );
    }
}
/* ── CONFIRM / EDIT TXN ── */
async function confirmTxn() {

    if (!state.draft) return;

    const t = state.draft;

    const token =
        localStorage.getItem("token");

    console.log("TOKEN:", token);
    console.log("DRAFT:", t);

    if (!token) {

        addBotMessage(
            "❌ Bạn chưa đăng nhập"
        );

        return;
    }

    try {

        const res =
            await fetch(
                "http://localhost:3000/api/ai/execute",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        action: t
                    })
                }
            );

        const data =
            await res.json();

        console.log(
            "EXECUTE RESULT:",
            data
        );

        if (
            data.message ===
            "jwt expired"
        ) {

            localStorage.removeItem(
                "token"
            );

            addBotMessage(
                "🔒 Phiên đăng nhập đã hết hạn."
            );

            return;
        }

        if (!data.success) {

            throw new Error(
                data.message
            );

        }

        state.transactions.unshift({
            ...t,
            id:
                data.id ||
                Date.now()
        });

        state.draft = null;

        saveState();

        updatePendingDot(false);

        checkDraft();

        addBotMessage(
            "✅ Đã lưu thành công"
        );

    } catch (err) {

        console.error(err);

        addBotMessage(
            `❌ ${err.message ||
            "Lỗi lưu giao dịch"
            }`
        );

    }
}
async function executeAction(action) {

    try {

        const token =
            localStorage.getItem(
                "token"
            );

        if (!token) {

            addBotMessage(
                "❌ Bạn chưa đăng nhập"
            );

            return;
        }

        const res =
            await fetch(
                "http://localhost:3000/api/ai/execute",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        action
                    })
                }
            );

        const data =
            await res.json();

        console.log(
            "AI ACTION:",
            data
        );

        if (
            data.message ===
            "jwt expired"
        ) {

            localStorage.removeItem(
                "token"
            );

            addBotMessage(
                "🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );

            return;
        }

        if (!data.success) {

            addBotMessage(
                data.message ||
                "Có lỗi xảy ra"
            );

            return;
        }

        switch (data.type) {

            case "balance":

                addBotMessage(
                    `💰 Số dư hiện tại

Thu nhập:
${formatMoney(
                        data.data.income
                    )}

Chi tiêu:
${formatMoney(
                        data.data.expense
                    )}

Còn lại:
${formatMoney(
                        data.data.balance
                    )}`
                );

                break;

            case "highest_category":

                if (!data.data) {

                    addBotMessage(
                        "📊 Chưa có dữ liệu chi tiêu."
                    );

                    break;
                }

                addBotMessage(
                    `📊 Danh mục chi nhiều nhất

${data.data.name}

Tổng:
${formatMoney(
                        data.data.total
                    )}`
                );

                break;

            case "delete_transaction":

                addBotMessage(
                    data.deleted > 0
                        ? "🗑️ Đã xóa giao dịch."
                        : "Không tìm thấy giao dịch."
                );

                break;

            default:

                console.log(
                    "Unknown action result:",
                    data
                );
        }

    } catch (err) {

        console.error(err);

        addBotMessage(
            "❌ Không thể kết nối máy chủ."
        );

    }
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

