// Esse Modulo é responsavel por criar o socket io server
// TODO 1 - Responsavel por gerir os nodes distribuidos de Socket I.O
// TODO 2 - Loadbalance dos nodes
// TODO 3 - verificar se eu não estou sobrecarregando as funcoes do Modulo

var numUsers = 0;
var MSG_LOG_USER_CONN = "Usuário <%s> Conectado :)";
var MSG_LOG_USER_DESCON = "Usuário <%s> Desconectado :(";
var MSG_LOG_USER_SEND = "<%s> disse %s";

module.exports = function(router){
  var io = require('socket.io')(router);

  io.on('connection', function(socket){
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
      // console.log(MSG_LOG_USER_SEND, socket.username, data);
      socket.broadcast.emit('new message', {
        username: socket.username,
        message: data
      });
    });

    socket.on('disconnect', function(){
      console.log(MSG_LOG_USER_DESCON, socket.username);
    });

    // when the client emits 'add user', this listens and executes
    socket.on('sync user', function (username) {
      if (addedUser) return;

      // we store the username in the socket session for this client
      socket.username = username;
      ++numUsers;
      addedUser = true;
      console.log(MSG_LOG_USER_CONN, socket.username);
      socket.emit('login', {
        numUsers: numUsers
      });
      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: numUsers
      });
    });



  });


  function sendMessage(msg){
    io.emit('chat message', msg);
    console.log('>>> chat message: ' + msg);
  }
};
