let ws = null;

function createRoom() {
    fetch('/create')
    .then(res => res.json())
    .then(data => {
        document.getElementById('token').value = data.token;
    });
}

function joinRoom() {
    const nickname = document.getElementById('nick').value;
    const token = document.getElementById('token').value;

    ws = new WebSocket(`ws://localhost:8080/ws?nickname=${nickname}&token=${token}`);

    ws.onmessage = (event) => {
        addMessage(event.data, 'user-message');
    };

    ws.onopen = () => {
        document.getElementById('form').style.display = 'none';
        document.getElementById('chat').classList.add('active');
        addMessage('Вы подключились к комнате', 'system-message');
    };

    ws.onclose = () => {
        addMessage('Вы отключились от комнаты', 'system-message');
    };
}

function sendMessage() {
    const input = document.getElementById('message');
    const text = input.innerText;

    if (text.trim() !== '') {
        ws.send(text);

        input.innerHTML = '';
        input.style.height = '44px';
        input.style.overflowY = 'hidden';
    }
}

function addMessage(text, className = 'user-message') {
    const div = document.createElement('div');
    div.textContent = text;
    div.className = className;
    document.getElementById('messages').appendChild(div);
    
    const messages = document.getElementById('messages');
    messages.scrollTop = messages.scrollHeight;
}

document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message');

    messageInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
});

const messageInput = document.getElementById('message');
const maxHeight = 120;

messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';

    if (messageInput.scrollHeight <= maxHeight) {
        messageInput.style.height = messageInput.scrollHeight + 'px';
        messageInput.style.overflowY = 'hidden';
    } else {
        messageInput.style.height = maxHeight + 'px';
        messageInput.style.overflowY = 'auto';
    }
});