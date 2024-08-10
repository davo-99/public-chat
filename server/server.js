const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const socket = require('./socket');
const Client = require('./client');

const appDir = path.dirname(__dirname);

const port = process.env.PORT || 8080;
const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'))
};

const app = express();
const server = https.createServer(options, app);
const io = socket(server);

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use('/', express.static(path.join(appDir, 'client')));
app.post('/exists', (request, response) => {
  response.send(io.has(request.body.username.toLowerCase()));
});

io.on('connect', socket => {
  console.log(`User connected.`);

  socket.on('clientEntered', ({ username, status }) => {
    if (io.has(username)) {
      socket.emit('invalidUsername', username);
      socket.disconnect();
      console.log('Disconnected client: ' + username);
      return;
    }

    console.log(`Client ${username}[${status}] has entered the chat`);

    io.set(socket, new Client(socket, username, status, io));

    io.emit(
      'connectedClients',
      io.clients
        .map(
          client => ({
            username: client.username,
            status: client.status,
            connectionTime: client.connectionTime
          })
        )
    );

    socket.on('disconnect', () => {
      io.has(username) && io.get(username).clientDisconnect();
      io.delete(username);
      io.emit(
        'connectedClients',
        io.clients
          .map(
            client => ({
              username: client.username,
              status: client.status,
              connectionTime: client.connectionTime
            })
          )
      );
    });
  });
});

server.listen(port, () => {
  console.log(`Listening at port ${port}`);
});