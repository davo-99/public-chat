const socket = require('socket.io');

class Socket extends socket.Server {
  #clients = new Map;
  #usernameHash = new Map;

  username2ID(username) {
    return this.#usernameHash.get(username.toLowerCase());
  }

  has(username) {
    return this.#usernameHash.has(username.toLowerCase());
  }

  get(username) {
    return this.#clients.get(this.username2ID(username.toLowerCase()));
  }

  set(socket, client) {
    this.#clients.set(socket.id, client);
    this.#usernameHash.set(client.username.toLowerCase(), socket.id);
  }

  delete(username) {
    this.#clients.delete(this.username2ID(username.toLowerCase()));
    return this.#usernameHash.delete(username.toLowerCase());
  }

  to(username) {
    return super
      .to(this.username2ID(username));
  }

  get clients() {
    return [...this.#clients.values()]
  }
}

module.exports = (...args) => new Socket(...args);