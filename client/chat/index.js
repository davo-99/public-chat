(() => {

  const client = createClient({
    transports: ['websocket'],
    upgrade: false,
    reconnection: true
  });

  let clientReconnection = 0;

  delete window.sessionStorage;
  delete window.localStorage;

  // socket events
  client.on('connect', () => {
    if (clientReconnection++)
      setTimeout(() => {
        toast.close();
        setTimeout(() => {
          toast.fire({
            title: 'Connected.',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true
          });
        }, 300); // fire 300ms after closing the disconnect toast
      }, 1000); // time to close the disconnect toast
    client.enter();
  });

  client.on('disconnect', () => {
    toast.fire({
      title: 'Disconnected. Reconnecting...',
      icon: 'error',
      footer: `Your status: "${navigator.onLine ? 'online' : 'offline'}".`
    });
  });

  client.on('connectedClients', enteredClients => {
    enteredClients.forEach((x, i) => joinedClients[i] = x.username); // convert connectionTimes to local here?
    enteredClients.sort((a, b) => (a.username > b.username) ? 1 : ((b.username > a.username) ? -1 : 0));
    appendAndUpdateClients(client, enteredClients);
    console.table(enteredClients);
  });

  client.on('clientDisconnected', username => {
    if (joinedClients.includes(username))
      joinedClients.splice(joinedClients.indexOf(username), 1);
  });

  client.on('message', data => {
    appendMessage(client, data.mode + 'Msg', data); // convert connectionTime to local here? (TODO: create directedMsg CSS class)
    notify(data.username, data.message);
    removeTyper(data.username);
  });

  client.on('typing', data => {
    onTyping(data.username); // ignore mode
  });

  client.on('invalidUsername', username => {
    document.write(`Username: ${username} is not allowed or is already in use.`);
    client.off(); // remove all listeners for all events
    throw new Error('Invalid Username.');
  });

  // utils
  function createClient(options) {
    if (sessionStorage.getItem('username'))
      return new Client(io(options), sessionStorage.getItem('username'), sessionStorage.getItem('status'));
    window.onload = () => document.write('err: 403, {no username is set}');
    throw new Error('No username set.');
  }

  function notify(from, message) {
    if (document.hidden) {
      const notification = new Notification(from, {
        body: message,
        icon: '../favicon.ico',
        silent: false,
        requireInteraction: true
      });
      if (isElectron()) {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('notif');
        notification.onclick = () => ipcRenderer.send('notif-clicked');
      }
    }
  }

  function isElectron() {
    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer')
      return true;

    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron)
      return true;

    // Detect the user agent when the `nodeIntegration` option is set to true
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.includes('Electron'))
      return true;

    return false;
  }

  // event listeners
  messageArea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.shiftKey)
      console.log('Shift + Enter');
    else if (e.key === 'Enter' && !e.shiftKey) {
      send(client, 'myPrivateMsg', 'myPublicMsg');
      rc = '';
      e.preventDefault();
    }
  });

  // messageArea.addEventListener('keypress', (typing = _.throttle(typing, 500, { trailing: false }), () => {
  //   typing(client); // _.throttle(typing, 500, { trailing: false }); // underscore/lodash
  // }));

  messageArea.addEventListener('keypress', (throttledTyping =>
    () => {
      throttledTyping(client);
    }
  )(_.throttle(typing, 500, { trailing: false })));

  sendButton.addEventListener('click', () => {
    send(client, 'myPrivateMsg', 'myPublicMsg');
    rc = '';
  });

  window.onkeydown = e => {
    if (e.key === 'Escape') {
      rc = '';
      messageArea.placeholder = '';
    }
  }

})();


// const throttleNonLeadingTrailing = (f, ms) => {
//   let call = true;
//   let count = 0;
//   return (...args) => {
//     if (!count++)
//       f(...args);
//     else if (call) {
//       call = false;
//       setTimeout(() => {
//         f(...args);
//         call = true;
//       }, ms);
//     }
//   }
// }

// const throttle = (f, ms) => {
//   let start = -ms;
//   return (...args) => {
//     if (performance.now() - start >= ms) {
//       f(...args);
//       start = performance.now();
//     }
//   }
// }