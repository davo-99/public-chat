const chatArea = document.getElementById('chat');
const messageArea = document.getElementById('message');
const sendButton = document.getElementById('send');
const typingArea = document.getElementById('typing');
const clientsArea = document.getElementById('clients');
const toast = Swal.mixin({
  toast: true,
  position: 'top',
  width: '27rem',
  // allowOutsideClick: true, // not working when toast === true
  allowEscapeKey: true,
  showConfirmButton: false,
});

const typers = [];
const joinedClients = [];

let rc = '';
let ID;

const fix = s =>
  s.trim()
    .replace(/(?:\r\n|\r|\n|<|>)/g, x => x === '<' ? '&lt;' : x === '>' ? '&gt;' : '<br>');

function leftOrRightClick(un, client) { //TODO: change to directed and fix logic
  un.oncontextmenu = e => {
    e.preventDefault();
    if (un.innerHTML === client.username) {
      console.info('can\'t send a private message to yourself');
      return;
    }
    console.log('joined = ', joinedClients);
    if (!joinedClients.includes(un.innerHTML)) {
      console.info('this user has left the chat');
      return;
    }
    rc = un.innerHTML;
    console.log(`you right-clicked on user: ${rc}`);
    messageArea.placeholder = `send a private message to ❛${rc}❜ (press ESC to cancel)`;
    messageArea.focus();
  }
  un.onclick = e => {
    if (un.innerHTML === client.username) {
      console.info('can\'t reply to yourself');
      return;
    }
    rc = un.innerHTML;
    console.log(`you left-clicked on user: ${rc}`);
    messageArea.placeholder = `send a reply message to ❛${rc}❜ (press ESC to cancel)`;
    messageArea.focus();
  }
}

function appendMessage(client, className, { username, message, date }) {
  message = fix(message);
  const msg = document.createElement('div');
  const txt = document.createElement('span');
  const dateElement = document.createElement('span');
  const un = document.createElement('span');
  msg.className = className + ' sentMessage';
  un.className = 'username';
  dateElement.className = 'date';
  txt.className = 'text';
  txt.style.maxWidth = '50%';
  // un.innerHTML = username + (rc ? ` -> ${rc}` : '');
  un.innerHTML = username + (rc ? ` → ${rc}` : rc && className == 'myReplyMsg' ? `  ${rc}` : '');
  txt.innerHTML = ': ' + message;
  dateElement.innerHTML = `\t[${new Date(date).toLocaleString()}]`;
  msg.appendChild(un);
  msg.appendChild(txt);
  msg.appendChild(dateElement);
  chatArea.appendChild(msg);
  dateElement.scrollIntoView();
  un.onmouseenter = () =>
    un.style.cursor = un.innerHTML === client.username ? 'not-allowed' :
      un.innerHTML.includes('-&gt;') ? 'e-resize' :
        !joinedClients.includes(un.innerHTML) ? 'help' : 'pointer';
  un.onmouseleave = () => un.style.cursor = 'auto';
  leftOrRightClick(un, client);
  // leftOrRightClick(un, client); // TODO: why two times? 
}

function appendAndUpdateClients(client, clients) {
  clientsArea.textContent = '';
  for (let i = 0; i < clients.length; i++) {
    const sec = document.createElement('div');
    sec.className = client.username === clients[i].username ? 'mySec' : 'sec';
    const name = document.createElement('strong');
    const st = document.createElement('p');
    // st.innerHTML = clients[i].status? `„${clients[i].status}“` : '';
    st.innerHTML = clients[i].status;
    st.style.fontSize = '10px';
    name.innerHTML = clients[i].username;
    name.title = new Date(clients[i].connectionTime).toLocaleString();
    sec.appendChild(name);
    // sec.appendChild(st);
    clientsArea.appendChild(sec);
    sec.onmouseenter = () => {
      sec.style.cursor = name.innerHTML === client.username ? 'not-allowed' : 'pointer';
      if (st.innerHTML.length)
        sec.appendChild(st);
      // if (st.innerHTML.length)
        // st.style.visibility = 'visible';
    }
    sec.onmouseleave = () => {
      sec.style.cursor = 'auto';
      st.remove();
      // st.style.visibility = 'hidden';
    }
  }
}

const who = n =>
  n === 1 ? `${typers[n - 1]} is typing...` :
    n > 2 ? `${typers[n - 1]}, ${typers[n - 2]} and others are typing...` :
      n == 2 ? `${typers[n - 1]}, ${typers[n - 2]} are typing...` : '';

function removeTyper(username) {
  const i = typers.indexOf(username);
  if (~i)
    typers.splice(i, 1);
  typingArea.innerHTML = who(typers.length);
}

function onTyping(username) {
  if (!typers.includes(username))
    typers.push(username);
  typingArea.innerHTML = who(typers.length);
  typingArea.scrollIntoView();
  clearTimeout(ID); // TODO? debouncing
  ID = setTimeout(() => {
    removeTyper(username);
  }, 3000);
}

function send(client, class1, class2) { // TODO: fix unused class2 parameter
  if (!messageArea.value.length || !messageArea.value.replace(/\s/g, '').length) {
    console.error('no input');
    messageArea.value = '';
    messageArea.focus();
    return;
  }
  appendMessage(client, class1, {
    username: client.username,
    message: messageArea.value,
    date: new Date().toLocaleString()
  });
  client.sendMessage(messageArea.value.trim(), rc, !!rc); // TODO: add support for directed message
  messageArea.placeholder = messageArea.value = '';
  messageArea.focus();
}

function typing(client) {
  client.sendTyping(rc, !!rc); // no directed typing
}