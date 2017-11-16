// Bind handlers when the page loads.
var skypeDiv = ".skype-button";
var spinner = ".mdl-spinner";
var snackbarID = "#snackbar";

/* ############### Chat  #################### */
var chatSocketURL = '#chtpath';
var chatbuttonID = "#chat-kit-button";
var chatFormID = "#chat-input-form";
var chatWindowClass = ".chat-window";
var chatUserInputID = "#chat-user-input";
var chatTextID = "#chat-text";
var chatConnectID = "#chat-conn-status";

var MSG_SELF_DESCON = "Você foi Desconectado ";
var MSG_SELF_CON = "Você foi conectado ";
var MSG_USER_DESCON = " foi Desconectado ";
var MSG_USER_CON = " foi conectado ";
var MSG_ERRO_RECON= "Erro ao tentar reconectar ";
var MSG_TYPE_SELF= "self";
var MSG_TYPE_STATUS= "status";
var msgChipClass = "mdl-chip mdl-chip__text";
var scrollToTop = 9999;
var COLORS = [
  '#e21400', '#91580f', '#333399', '#009933',
  '#660066', '#993300', '#3333cc', '#cc6600',
  '#0000ff', '#006666', '#666699', '#990033'
];
$(chatWindowClass).hide();
/* ############### Chat  #################### */
//TODO criar gestão de acesso e cadastro de usuários

var userName = "Agente " + new Date().getTime() % 1000;
var chatPath = $(chatSocketURL).text();
var socket = io(chatPath);
socket.emit('sync user', userName);

function setSpinnerActive(isActive) {
  var $spinnerDiv = $(spinner);
  if (isActive) {
    $spinnerDiv.show();
    $spinnerDiv.addClass('is-active');
  } else {
    $spinnerDiv.hide();
    $spinnerDiv.removeClass('is-active');
  }
}

function showError(error) {
  console.log(error);

  snackbar.addClass('error');
  snackbar.get(0).MaterialSnackbar.showSnackbar(error);
}

function showMessage(message) {
  var snackbar = $(snackbarID);
  snackbar.removeClass('error');
  snackbar.get(0).MaterialSnackbar.showSnackbar({
    message: message
  });
}

// Sending User Session to the server
$(function() {
  var $chatWindowDiv = $(chatWindowClass);
  var $inputMessage = $(chatFormID);
  var $chatTextArea = $(chatTextID);



  $(skypeDiv).ready(function() {
    setSpinnerActive(false);
  });
  $chatWindowDiv.ready(function() {
    $chatWindowDiv.hide();
  });

  $(chatbuttonID).click(function() {
    if ($chatWindowDiv.is(":visible") ) {
      $chatWindowDiv.hide("slow");
    }
    else {
      $chatWindowDiv.show();
      //TODO ajustar a um valor menos absurdo
      $chatTextArea.scrollTop(scrollToTop);
    }
  });

  // $(chatSocketURL).ready(function() {
  $(chatFormID).ready(function() {
    $inputMessage.submit(function(){
      sendMessage();
      return false;
    });
  });
});


// Prevents input from having injected markup
function cleanInput (input) {
  return $('<div/>').text(input).text();
}

// TODO Aplicar regras de formatação de mensagem estilo whatsapp
// TODO adicionar quando a msg foi enviada (momentjs ?)
// TODO fazer um refactoring da formatação em outro metodo
function addChatMessage(data, options){

  // TODO Formatar no melhor momento
  data.message = " " + data.message;
  // let $chatMessagesList = $('#chat-text-list');
  var $usernameDiv = $('<span class="username"/>').text(data.username).css('color', getUsernameColor(data.username));
  var $messageBodyDiv = $('<span class="messageBody">').text(data.message);
  var $messageDiv = $('<span class="message">').append($usernameDiv, $messageBodyDiv).addClass(msgChipClass);

  // Formatando
  if(options){
    if(options.messageType == MSG_TYPE_SELF){
      $usernameDiv.hide();
      $messageDiv.addClass('mdl-color--accent')
    }
    else if(options.messageType == MSG_TYPE_STATUS){
      $usernameDiv.hide();
      $messageDiv.removeClass(msgChipClass);
      $messageDiv.removeClass('message');
      $messageDiv.addClass(MSG_TYPE_STATUS);
    }
  }

  var $chatTextArea = $(chatTextID);
  $chatTextArea.data('username', data.username).append('<br>').append($messageDiv);

  //TODO ajustar a um valor menos absurdo
  $chatTextArea.scrollTop(scrollToTop);
}

function addParticipantsMessage(data, event){
  qdeUsers = data.numUsers;
  data.message =  event;
  addChatMessage(data);
}

// Gets the color of a username through our hash function
function getUsernameColor (username) {
  // Compute hash code
  var hash = 7;
  for (var i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + (hash);
  }
  // Calculate color
  var index = Math.abs(hash % COLORS.length);
  return COLORS[index];
}


// ############################################################################
// Socket events
// ############################################################################
function sendMessage(){
  var $userInput = $(chatUserInputID);
  let message = cleanInput($userInput.val());
  socket.emit('new message', message);
  $userInput.val('');
  let data = {
    username : userName,
    message : message
  };
  let options = { messageType : MSG_TYPE_SELF };
  addChatMessage(data, options);
}

// Whenever the server emits 'new message', update the chat body
socket.on('new message', function (data) {
  addChatMessage(data);
});

// Necessário para sincronizar o usuário novamente com o server
socket.on('connect', () => {
  socket.emit('sync user', userName);
  let msg = {
    username : userName,
    message : MSG_SELF_CON
  }
  let options = { messageType : MSG_TYPE_STATUS };
  // addChatMessage(msg,options);
  $(chatConnectID).css('color', 'yellowgreen'); 
});

socket.on('disconnect', function () {
  let msg = {
    username : userName,
    message : MSG_SELF_DESCON
  }
  let options = { messageType : MSG_TYPE_STATUS };
  // addChatMessage(msg,options);
  $(chatConnectID).css('color', 'orangered'); 
});

socket.on('reconnect_error', function () {
  let msg = {
    username : userName,
    message : MSG_ERRO_RECON
  }
  let options = { messageType : MSG_TYPE_STATUS };
  addChatMessage(msg),options;
  $(chatConnectID).css('color', 'orangered'); 
});

//mensagem de usuário que entrou
socket.on('user joined', function (data) {
  addParticipantsMessage(data, MSG_USER_CON);
});

//mensagem de usuário que saiu
socket.on('user left', function (data) {
  addParticipantsMessage(data, MSG_USER_DESCON);
});
