// ===== STATE =====
const STORAGE_KEY = 'hookchat_webhooks';
const MAX_WEBHOOKS = 5;

let webhooks = []; // { id, name, url, messages: [{role, text, time}] }
let activeId = null;
let deleteTargetId = null;
let confirmAction = null; // 'delete' or 'clear'
let isSending = false;

// ===== DOM REFS =====
const $ = (s) => document.querySelector(s);
const sidebarList = $('#sidebarList');
const sidebarFooter = $('#sidebarFooter');
const chatMessages = $('#chatMessages');
const chatAssistantName = $('#chatAssistantName');
const chatIndicator = $('#chatIndicator');
const chatInputBar = $('#chatInputBar');
const chatInput = $('#chatInput');
const btnSend = $('#btnSend');
const btnClearChat = $('#btnClearChat');
const btnAddWebhook = $('#btnAddWebhook');
const modalOverlay = $('#modalOverlay');
const inputName = $('#inputName');
const inputUrl = $('#inputUrl');
const btnModalCancel = $('#btnModalCancel');
const btnModalSave = $('#btnModalSave');
const confirmOverlay = $('#confirmOverlay');
const confirmTitle = $('#confirmTitle');
const confirmText = $('#confirmText');
const btnConfirmCancel = $('#btnConfirmCancel');
const btnConfirmDelete = $('#btnConfirmDelete');
const toast = $('#toast');
const sidebar = $('#sidebar');
const sidebarBackdrop = $('#sidebarBackdrop');
const btnMenuToggle = $('#btnMenuToggle');

// Feedback Modal Refs
const btnFeedback = $('#btnFeedback');
const feedbackOverlay = $('#feedbackOverlay');
const btnFeedbackCancel = $('#btnFeedbackCancel');
const feedbackForm = $('#feedbackForm');
const feedbackFormContainer = $('#feedbackFormContainer');
const feedbackSuccessContainer = $('#feedbackSuccessContainer');
const btnFeedbackSuccessClose = $('#btnFeedbackSuccessClose');

// ===== PERSISTENCE =====
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(webhooks));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) webhooks = JSON.parse(raw);
  } catch {
    webhooks = [];
  }
}

// ===== TOAST =====
let toastTimer = null;
function showToast(msg, type = 'error') {
  toast.textContent = msg;
  toast.className = 'toast visible' + (type === 'success' ? ' success' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ===== GENERATE ID =====
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ===== TIME FORMAT =====
function timeStr() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ===== RENDER SIDEBAR =====
function renderSidebar() {
  sidebarFooter.innerHTML = `<span class="sidebar-count">${webhooks.length}</span> / ${MAX_WEBHOOKS} WEBHOOKS`;

  if (webhooks.length === 0) {
    sidebarList.innerHTML = `
      <div class="sidebar-empty">
        <div class="empty-icon">⚡</div>
        <div class="empty-title">No Webhooks Yet</div>
        <div class="empty-desc">Add your first n8n webhook to start chatting with your assistant.</div>
        <button class="btn-add-first" onclick="openModal()">+ ADD WEBHOOK</button>
      </div>
    `;
    return;
  }

  let html = '';
  webhooks.forEach(w => {
    const isActive = w.id === activeId;
    const isUrlShown = urlVisible[w.id];
    const displayUrl = isUrlShown ? w.url : '•'.repeat(Math.min(w.url.length, 40));
    html += `
      <div class="webhook-card ${isActive ? 'active' : ''}" data-id="${w.id}">
        <div class="webhook-card-header">
          <div class="webhook-name">${escHtml(w.name)}</div>
          <div class="webhook-card-actions">
            <button class="btn-icon" onclick="event.stopPropagation(); toggleUrl('${w.id}')" title="Show/hide URL">
              <img id="eye-${w.id}" src="src/view.ico" alt="Show/hide URL" class="${isUrlShown ? 'visible' : ''}">
            </button>
            <button class="btn-icon delete" onclick="event.stopPropagation(); confirmDelete('${w.id}')" title="Delete">
              <img src="src/delete.ico" alt="Delete">
            </button>
          </div>
        </div>
        <div class="webhook-url-row">
          <div class="webhook-url-display" id="url-${w.id}">${displayUrl}</div>
        </div>
        <button class="btn-open-chat" onclick="event.stopPropagation(); openChat('${w.id}')">
          ${isActive ? '● CHATTING' : 'OPEN CHAT'}
        </button>
      </div>
    `;
  });
  sidebarList.innerHTML = html;
}

// ===== TOGGLE URL VISIBILITY =====
const urlVisible = {};
function toggleUrl(id) {
  const w = webhooks.find(x => x.id === id);
  if (!w) return;
  urlVisible[id] = !urlVisible[id];
  const el = document.getElementById('url-' + id);
  const eye = document.getElementById('eye-' + id);
  if (urlVisible[id]) {
    el.textContent = w.url;
    if (eye) {
      eye.classList.add('visible');
    }
  } else {
    el.textContent = '•'.repeat(Math.min(w.url.length, 40));
    if (eye) {
      eye.classList.remove('visible');
    }
  }
}

// ===== OPEN CHAT =====
function openChat(id) {
  activeId = id;
  closeSidebar();
  renderSidebar();
  renderChat();
}

// ===== RENDER CHAT =====
function renderChat() {
  const w = webhooks.find(x => x.id === activeId);

  if (!w) {
    chatAssistantName.textContent = 'No Assistant Selected';
    chatIndicator.style.display = 'none';
    chatInputBar.style.display = 'none';
    btnClearChat.style.display = 'none';
    btnFeedback.style.display = 'inline-flex';
    chatMessages.innerHTML = `
      <div class="no-webhook-state">
        <img src="src/logo.svg" alt="HookChat Logo" class="landing-logo" />
        <div class="landing-title">HOOK<span>CHAT</span></div>
        <p class="landing-desc">
          A Real-time chat interface to test and debug your n8n webhook-based AI agents.<br>Securely manage up to 5 webhook assistants with full chat logs saved locally.
        </p>
        <div class="landing-uses">
          <div class="use-item">
            <div class="use-icon">
              <img src="src/realtime.ico" alt="Real-time Icon">
            </div>
            <div class="use-text">
              <strong>Real-Time Sandbox</strong>
              <p>Instantly execute HTTP requests and view AI responses with full typing previews.</p>
            </div>
          </div>
          <div class="use-item">
            <div class="use-icon">
              <img src="src/secure.ico" alt="Secure Icon">
            </div>
            <div class="use-text">
              <strong>Secured Local Storage</strong>
              <p>Your webhook URLs and conversation logs are completely private and stored in browser memory.</p>
            </div>
          </div>
          <div class="use-item">
            <div class="use-icon">
              <img src="src/agent.ico" alt="Agent Icon">
            </div>
            <div class="use-text">
              <strong>Multi-Webhook Setup</strong>
              <p>Simultaneously configure, edit, mask, and test up to 5 independent webhook connections.</p>
            </div>
          </div>
        </div>
        <div class="landing-action-info">
          ◀ Select or add a Webhook agent from the sidebar to begin.
        </div>
      </div>
    `;
    return;
  }

  btnFeedback.style.display = 'none';
  chatAssistantName.textContent = w.name;
  chatIndicator.style.display = 'block';
  chatInputBar.style.display = 'block';
  btnClearChat.style.display = 'inline-flex';

  if (w.messages.length === 0) {
    chatMessages.innerHTML = `
      <div class="chat-welcome">
        <div class="chat-welcome-icon">
          <img src="src/logo.svg" alt="HookChat Logo" class="chat-welcome-logo" />
        </div>
        <h2>Chat with ${escHtml(w.name)}</h2>
        <p>Send a message below to start the conversation via your n8n webhook.</p>
      </div>
    `;
  } else {
    let html = '<div class="chat-messages-inner">';
    w.messages.forEach(m => {
      html += `
        <div class="msg-row ${m.role}">
          <div>
            <div class="msg-bubble">${escHtml(m.text)}</div>
            <div class="msg-time">${m.time}</div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    chatMessages.innerHTML = html;
    scrollToBottom();
  }
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// ===== SEND MESSAGE =====
async function sendMessage() {
  const w = webhooks.find(x => x.id === activeId);
  if (!w || isSending) return;

  const text = chatInput.value.trim();
  if (!text) return;

  // Add user message
  w.messages.push({ role: 'user', text, time: timeStr() });
  chatInput.value = '';
  chatInput.style.height = '24px';
  save();
  renderChat();

  // Show typing indicator
  isSending = true;
  btnSend.disabled = true;
  appendTypingIndicator();

  try {
    const resp = await fetch(w.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatInput: text })
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const data = await resp.json();
    let reply = data.output || data.message || JSON.stringify(data);

    w.messages.push({ role: 'assistant', text: reply, time: timeStr() });
    save();
  } catch (err) {
    w.messages.push({ role: 'assistant', text: `⚠ Error: ${err.message}`, time: timeStr() });
    save();
    showToast('Failed to reach webhook');
  } finally {
    isSending = false;
    btnSend.disabled = false;
    renderChat();
  }
}

function appendTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'msg-row assistant';
  div.id = 'typingRow';
  div.innerHTML = `
    <div>
      <div class="msg-bubble">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `;
  const inner = chatMessages.querySelector('.chat-messages-inner');
  if (inner) {
    inner.appendChild(div);
  } else {
    chatMessages.appendChild(div);
  }
  scrollToBottom();
}

// ===== CLEAR CHAT =====
function confirmClearChat() {
  const w = webhooks.find(x => x.id === activeId);
  if (!w) return;
  confirmAction = 'clear';
  confirmTitle.textContent = 'Clear Chat?';
  confirmText.textContent = `Clear all messages with "${w.name}"?`;
  btnConfirmDelete.textContent = 'CLEAR';
  confirmOverlay.classList.add('visible');
}

// ===== DO CLEAR CHAT =====
function doClearChat() {
  const w = webhooks.find(x => x.id === activeId);
  if (!w) return;
  w.messages = [];
  save();
  renderChat();
  showToast('Chat cleared', 'success');
}

// ===== MODAL: ADD WEBHOOK =====
function openModal() {
  if (webhooks.length >= MAX_WEBHOOKS) {
    showToast(`Maximum ${MAX_WEBHOOKS} webhooks reached`);
    return;
  }
  inputName.value = '';
  inputUrl.value = '';
  modalOverlay.classList.add('visible');
  setTimeout(() => inputName.focus(), 100);
}

// ===== CLOSE MODAL =====
function closeModal() {
  modalOverlay.classList.remove('visible');
}

// ===== SAVE WEBHOOK =====
function saveWebhook() {
  const name = inputName.value.trim();
  const url = inputUrl.value.trim();

  if (!name) { showToast('Enter an assistant name'); inputName.focus(); return; }
  if (!url) { showToast('Enter a webhook URL'); inputUrl.focus(); return; }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showToast('URL must start with http:// or https://');
    inputUrl.focus();
    return;
  }

  const w = { id: uid(), name, url, messages: [] };
  webhooks.push(w);
  save();
  closeModal();
  openChat(w.id);
  showToast('Webhook added!', 'success');
}

// ===== CONFIRM DELETE =====
function confirmDelete(id) {
  const w = webhooks.find(x => x.id === id);
  if (!w) return;
  deleteTargetId = id;
  confirmAction = 'delete';
  confirmTitle.textContent = 'Delete Webhook?';
  confirmText.textContent = `Remove "${w.name}" and its chat history?`;
  btnConfirmDelete.textContent = 'DELETE';
  confirmOverlay.classList.add('visible');
}

// ===== CLOSE CONFIRM =====
function closeConfirm() {
  confirmOverlay.classList.remove('visible');
  deleteTargetId = null;
  confirmAction = null;
}

// ===== DO CONFIRM ACTION =====
function doConfirmAction() {
  if (confirmAction === 'delete') {
    if (!deleteTargetId) return;
    webhooks = webhooks.filter(x => x.id !== deleteTargetId);
    if (activeId === deleteTargetId) activeId = null;
    save();
    closeConfirm();
    renderSidebar();
    renderChat();
    showToast('Webhook deleted', 'success');
  } else if (confirmAction === 'clear') {
    closeConfirm();
    doClearChat();
  }
}

// ===== MOBILE SIDEBAR =====
function openSidebar() {
  sidebar.classList.add('open');
  sidebarBackdrop.classList.add('active');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('active');
}

// ===== ESCAPE HTML =====
function escHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// ===== EVENT LISTENERS =====
btnAddWebhook.addEventListener('click', openModal);
btnModalCancel.addEventListener('click', closeModal);
btnModalSave.addEventListener('click', saveWebhook);
btnClearChat.addEventListener('click', confirmClearChat);
btnSend.addEventListener('click', sendMessage);
btnConfirmCancel.addEventListener('click', closeConfirm);
btnConfirmDelete.addEventListener('click', doConfirmAction);
btnMenuToggle.addEventListener('click', openSidebar);
sidebarBackdrop.addEventListener('click', closeSidebar);

chatInput.addEventListener('keydown', (e) => {
  const isMobile = window.innerWidth <= 768;
  if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
    e.preventDefault();
    sendMessage();
  }
});

chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = chatInput.scrollHeight + 'px';
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

confirmOverlay.addEventListener('click', (e) => {
  if (e.target === confirmOverlay) closeConfirm();
});

// Enter key in modal fields
inputUrl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); saveWebhook(); }
});
inputName.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); inputUrl.focus(); }
});

// ===== FEEDBACK MODAL ACTIONS =====
function openFeedbackModal() {
  feedbackForm.reset();
  feedbackFormContainer.style.display = 'block';
  feedbackSuccessContainer.style.display = 'none';
  const submitBtn = $('#btnFeedbackSubmit');
  submitBtn.disabled = false;
  submitBtn.textContent = 'SUBMIT';
  feedbackOverlay.classList.add('visible');
  setTimeout(() => $('#feedbackName').focus(), 100);
}

function closeFeedbackModal() {
  feedbackOverlay.classList.remove('visible');
}

btnFeedback.addEventListener('click', openFeedbackModal);
btnFeedbackCancel.addEventListener('click', closeFeedbackModal);
btnFeedbackSuccessClose.addEventListener('click', closeFeedbackModal);

feedbackOverlay.addEventListener('click', (e) => {
  if (e.target === feedbackOverlay) closeFeedbackModal();
});

feedbackForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = $('#feedbackName').value.trim();
  const email = $('#feedbackEmail').value.trim();
  const rating = document.querySelector('input[name="feedbackRating"]:checked')?.value;
  const feedback = $('#feedbackDetails').value.trim();

  if (!name || !email || !rating || !feedback) {
    showToast('Please fill out all fields.');
    return;
  }

  const submitBtn = $('#btnFeedbackSubmit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'SUBMITTING...';

  // Formspree endpoint with user's ID
  const formspreeEndpoint = 'https://formspree.io/f/mojbronp';

  try {
    const response = await fetch(formspreeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        rating: rating + ' Stars',
        feedback
      })
    });

    if (response.ok) {
      feedbackFormContainer.style.display = 'none';
      feedbackSuccessContainer.style.display = 'block';
    } else {
      throw new Error('Failed to submit form.');
    }
  } catch (err) {
    showToast('Failed to send feedback. Try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'SUBMIT';
  }
});

// ===== INIT =====
load();
renderSidebar();
renderChat();
