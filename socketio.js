'use strict';

const socketio = require('socket.io');
const HermesMessage = require('hermesjs-message');

function init (settings) {
  return function (hermes) {
    return new HermesSocketIO(settings, hermes);
  };
}

function HermesSocketIO (settings, hermes) {
  this.hermes = hermes;
  this.server_settings = settings;
}

/**
 * Makes the adapter start listening.
 */
HermesSocketIO.prototype.listen = function listen () {
  this.setup();
  if (this.http_server.listen) {
    this.server = this.http_server.listen(this.server_settings.port || 80);
  } else {
    this.server = this.http_server(this.server_settings.port || 80);
  }
  return this.server;
};

/**
 * Setup adapter configuration.
 */
HermesSocketIO.prototype.setup = function setup () {
  this.http_server = this.server_settings.http_server;
  if (!this.http_server) {
    this.io = socketio();
  } else {
    this.io = socketio(this.http_server);
  }

  this.io.on('connection', (socket) => {
    this.hermes.emit('client:ready', { name: 'Socket.IO adapter' });
    socket.onevent = (packet) => {
      this.onReceiveFromClient(this.createMessage(packet, socket));
    };
  });
};

/**
 * Sends the message coming from WS client to Hermes.
 * @param {HermesMessage} message The message to be sent
 */
HermesSocketIO.prototype.onReceiveFromClient = function onReceiveFromClient (message) {
  this.hermes.emit('client:message', message);
};

/**
 * Serializes the WS message as an HermesMessage.
 *
 * @param {Object} packet WS message
 * @param {Socket} client Socket object
 * @return {HermesMessage}
 */
HermesSocketIO.prototype.createMessage = function createMessage (packet, client) {
  const message = new HermesMessage({
    topic: packet.data[0],
    payload: packet.data[1] || {},
    protocol: {
      name: this.server_settings.protocol || 'ws',
      headers: {
        type: packet.type,
        nsp: packet.nsp
      }
    },
    connection: client,
    packet
  });

  message.on('send', this.send.bind(this, message));

  return message;
};

/**
 * Sends the message down to the wire (WS client).
 *
 * @param {HermesMessage} message The message to be sent
 */
HermesSocketIO.prototype.send = function send (message) {
  this.io.emit(message.topic, message.payload);
};

module.exports = init;
