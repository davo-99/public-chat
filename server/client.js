const assert = require('node:assert/strict');

class Client {
  #socket;
  #io;
  #username;
  #status;
  #connectionTime;

  static #events = ['message', 'typing']; // TODO: think of a clever way rather than hardcoding (loop over keys with special prefix?)
  static #modes = new Map([[0, 'public'], [1, 'directed'], [2, 'private']]);

  #setEvents() {
    Client.#events
      .forEach(event => {
        this.#socket.on(event, this[event].bind(this)); // bind not working on getter/setter
      });
  }

  #getMode(to, privately) {
    assert.ok(!(privately && !to), 'Private mode requires sendee.');
    return Client.#modes.get(!!to + privately);
  }

  constructor(socket, username, status, io) {
    this.#socket = socket;
    this.#username = username;
    this.#status = status;
    this.#connectionTime = new Date().toISOString();
    this.#io = io;
    this.#setEvents();
  }

  message({ message, to = '', privately = false } = {}) {
    if ((privately && !to) || (to && !this.#io.has(to)))
      return;

    console.log(`${this.#username} ${privately ? 'privately' : 'publicly'} says "${message}" to ${to || 'everybody'}.`);
    (privately ? this.#io.to(to) : this.#socket.broadcast)
      .emit('message', {
          username: this.#username,
          message,
          mode: this.#getMode(to, privately),
          date: new Date().toISOString()
        });
  }

  typing({ to, privately = false } = {}) {
    if ((privately && !to) || (to && !this.#io.has(to)))
      return;

    console.log(`${this.#username} is ${privately ? 'privately' : 'publicly'} typing to ${to || 'everybody'}.`);
    (privately ? this.#io.to(to) : this.#socket.broadcast)
      .emit('typing', {
        username: this.#username,
        privately
      });
  }

  clientDisconnect() {
    console.log(`${this.#username} disconnected.`);
    // this.#socket.broadcast.emit('clientDisconnected', this.#username);
    this.#io.emit('clientDisconnected', this.#username);
  }

  get username() {
    return this.#username;
  }

  get status() {
    return this.#status;
  }

  get socket() {
    return this.#socket;
  }

  get connectionTime() {
    return this.#connectionTime;
  }
}

module.exports = Client;