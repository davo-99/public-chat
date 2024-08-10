class Client {
  #socket;
  #username;
  #status;
  constructor(socket, username, status) {
    this.#socket = socket;
    this.#username = username;
    this.#status = status;
  }

  on(...args) {
    this.#socket.on(...args);
  }

  off(...args) {
    this.#socket.off(...args);
  }

  enter() {
    this.#socket.emit('clientEntered', {
      username: this.#username,
      status: this.#status
    });
  }

  sendMessage(message, to = '', privately = false) {
    console.assert(!(privately && !to), 'Private mode requires sendee.');
    this.#socket.emit('message', { message, to, privately });
  }

  sendTyping(to = '', privately = false) {
    console.assert(!(privately && !to), 'Private mode requires sendee.');
    this.#socket.emit('typing', { to, privately });
  }

  set username(username) {
    this.#username = username;
    this.#socket.emit('setUsername', username);
  }

  set status(status) {
    this.#status = status;
    this.#socket.emit('setStatus', status);
  }

  get username() {
    return this.#username;
  }

  get status() {
    return this.#status;
  }
}