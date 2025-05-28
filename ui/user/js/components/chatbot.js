// js/chatbot.js

const toggleBtn     = document.getElementById('chatbot-toggle');
const chatBox       = document.getElementById('chatbot-box');
const messagesEl    = document.getElementById('chatbot-messages');
const inputEl       = document.getElementById('chatbot-input');
const sendBtn       = document.getElementById('chatbot-send');

toggleBtn.addEventListener('click', () => {
  chatBox.classList.toggle('hidden');
  inputEl.focus();
});

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  appendMessage('user', text);
  inputEl.value = '';
  try {
    const res = await fetch('http://localhost/api/v1/chatbot/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const { reply } = await res.json();
    appendMessage('bot', reply);
  } catch (err) {
    appendMessage('bot', 'Lỗi kết nối. Vui lòng thử lại sau.');
    console.error(err);
  }
}

sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

function appendMessage(who, text) {
  const div = document.createElement('div');
  div.className = `chatbot-message ${who}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
