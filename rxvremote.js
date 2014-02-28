flag = 1;
exports.action = function(data, callback, config, SARAH){
 	  // CONFIG
  	config = config.modules.rxvremote;
    if (!config.yamip) {
        console.log ("Erreur IP Ampli.");
        callback ({ 'tts': 'Paramètre I P invalide' });
        return;
    }
	  //WAITING... @MAIN:AVAIL=Ready
  	if (!data.key){
        callback({ 'tts': '' });
        return;
    }
    sendYam(data.key+'\r\n',config.yamip);
    // CALLBACK
    if(flag==0){
      callback({'tts': "L'ampli n'est pas allumé"});
      return;
    }
    var answers = config.answers.split('|');
    var answer = answers[ Math.floor(Math.random() * answers.length)];
    callback({'tts': answer});
}
// FONCTION
var sendYam = function (cmd,yamip){
  var net = require('net');
  ret='';
  var socket=net.connect({port:50000, host: yamip}, function(){
    flag=1;
    socket.write(cmd);
    //socket.end();
  }).on('data',function(data){
    console.log('Commande = '+cmd+'Retour = '+data);
    data=='@RESTRICTED\r\n' || data=='@MAIN:AVAIL=Not Ready\r\n' ? flag=0 : flag=1;
    socket.end();
  });
}
