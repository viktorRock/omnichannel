// Esse Modulo vai ser responsavel por
// TODO 1- administrar as mensages de origem ConnectorBot server
//         onde cada Assunto do cliente é uma sala de chat
// TODO 2 - manter as conversações, recuperar histórico e responder a conversa correta
// TODO 3 - responder a mensagem caputarada pelo botframework

const ioClient = require('socket.io-client');
const chatPath = process.env.GOCHANNEL_CHAT_LOCAL_URL;

var clients = {};
var socket = ioClient(chatPath);
var connMessage = require('./connector_post');

// TODO : envia a mensagem de volta para o botframework
socket.on('new message', (msg) => {
  let msgSession = socket.msgSession;

  // TODO tratar msg quando não há cliente conectado
  if(msgSession){
    msgSession.mensagem = msg.message;
    msgSession.contato = msg.username;
    connMessage.post(msgSession);
  }
});

function addUser(msg){
  // TODO gerenciar IDs do bot framework
  var userName = clients[msg.contato];

  if(!userName){
    socket.emit('sync user', msg.contato);
    console.log(msg.contato + " -> was Sync @@@@@@@@@@@@@@@@@@@@@@@");
  }
}

function setMSGSession(msgSession){
  socket.msgSession = msgSession;
}

function emit(msg){
  addUser(msg);
  socket.emit('new message', msg.mensagem);
}

module.exports = {
  emit : emit,
  setMSGSession : setMSGSession,
  addUser : addUser
};
