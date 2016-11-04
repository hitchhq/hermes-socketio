require('should');
const sinon = require('sinon');
const hermesSocketIO = require('../socketio');
const EventEmitter = require('events');

function createInstance (settings, hermes) {
  const _settings = settings || { host_url: 'testing' };
  const init = hermesSocketIO(_settings);
  const instance = init(hermes || new EventEmitter());

  return instance;
}

describe('HermesSocketIO', () => {
  describe('#init', () => {
    it('returns a function', () => {
      const wrapper = hermesSocketIO();
      wrapper.should.be.type('function');
    });

    it('wraps config and hermes, and exposes the methods', () => {
      const settings = { settings: true };
      const hermes = new EventEmitter();
      const socketio = createInstance(settings, hermes);

      socketio.hermes.should.be.exactly(hermes);
      socketio.server_settings.should.be.exactly(settings);
      socketio.listen.should.be.type('function');
      socketio.send.should.be.type('function');
      socketio.setup.should.be.type('function');
      socketio.onReceiveFromClient.should.be.type('function');
      socketio.createMessage.should.be.type('function');
    });
  });
});
