let socket;
function joinChat() {
  const username = document.getElementById('username').value;
  const room = document.getElementById('room').value;
  if (!username || !room) return alert('Enter both name and room');

  socket = new WebSocket(`ws://${location.host}`);

  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({
      type: 'join',
      payload: { username, room }
    }));
    document.getElementById('chat-section').style.display = 'block';
    document.getElementById('room-name').innerText = room;
  });

  socket.addEventListener('message', (event) => {
    const chatBox = document.getElementById('chat');
    chatBox.innerHTML += `<div>${event.data}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

function sendMessage() {
  const msgInput = document.getElementById('message');
  if (msgInput.value && socket) {
    socket.send(JSON.stringify({
      type: 'chat',
      payload: { message: msgInput.value }
    }));
    msgInput.value = '';
  }
}