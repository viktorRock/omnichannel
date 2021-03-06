'use strict';

const express = require('express');
const router = express.Router();
var moment = require('moment');
const DATETIME_MASK = 'YYYY-MM-DD hh:mm:ss a';
const DATETIME_SHORT_MASK = 'hh:mm:ss a';
const botmode = false;
const chatPort = process.env.GOCHANNEL_CHAT_PORT;
var chat_client = require('./chat/connector_client');
const BOTFRAMEWORK_MESSAGE = "message";
const BOTFRAMEWORK_CONV_UPDATE = "conversationUpdate";

moment.locale('pt-br');

var results = {
  messages: [
  {
    id: "2", contato: "Peterson", canal : "skype", qtdeMsgs: "3", assunto: "Envio de Documentos", mensagem : "",
    status: "Pendente", atendente : "Andre", quando: moment("2017-08-31T01:00:03").format(DATETIME_MASK), tags: [{tag : "#docs"}]
  },
  {
    id: "3", contato: "Andre", canal : "skype", qtdeMsgs: "1",  assunto: "Confirmação de Compra", mensagem : "",
    status: "Fechado", atendente : "Paulo",quando: moment("2017-06-10T01:00:03").format(DATETIME_MASK), tags: [{tag : "#formalizacao"}]
  }
  ],
  botmode : botmode,
  localChatPath : process.env.GOCHANNEL_CHAT_LOCAL_URL
};

router.get('/', function(req, res, next) {
  res.redirect('index');
});

router.get('/features', function(req, res, next) {
  res.render('features', results);
});

router.get('/index', function(req, res, next) {
  res.render('index', results);
});

// URL para receber posts do ConnectorBot
router.post('/api/messages', function(req, res, next) {
  res.botmode = botmode;
  let msg = parseBotFramToMessage(req.body);
  results.messages.push(msg);
  console.log('########## messages.push(msg);');
  console.log(msg);
  chat_client.emit(msg);
  chat_client.setMSGSession(msg);
  // res.render('index', results);
});

function parseBotFramToMessage(body){
  var messages={};

  messages = {
    mensagem : body.text,
    assunto : body.text,
    canal : body.source,
    qtdeMsgs : "1",
    status : "Em atendimento",
    atendente : body.address.bot.name,
    // quando : moment(body.localTimestamp).fromNow(),
    quando : moment(body.localTimestamp).format(DATETIME_MASK),
    tags : [{tag : "#" + body.connector}]
  };

  messages.contato = body.user.name;
  messages.id = body.address.conversation.id;

  messages.keys = {
    userId : body.user.id,
    conversaId : body.address.conversation.id,
    addressId :  body.address.id,
    botId : body.address.bot.id,
    atividadeClienteId : body.sourceEvent.clientActivityId
  };

  return messages;
}

module.exports = router;
