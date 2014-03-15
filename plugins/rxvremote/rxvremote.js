/*_________________________________________________ 
| rvxremote V 1.1                                  |
| Plugin pour S.A.R.A.H. (by JP Encausse)          |
|__________________________________________________|
*/

exports.action = function(data,callback,config,SARAH){
	//Config
	config = config.modules.rxvremote;
	var cmd = {key: data.key+'\r\n', ip: config.yamip};

	if (!config.yamip){
		console.log('Missing YAMAHA A/V IP in rxvremote.prop !');
		callback({'tts': 'Adresse I P incorrecte ou absente !'});
		return;
	}

	var net = require('net');
	var socket = net.connect({host: cmd.ip, port: 50000},function(){
		console.log('Commande = '+cmd.key);
		socket.end(cmd.key);
		
		socket.on('data',function(data){
			console.log('Retour Amp. = ' + data);
		});

		socket.on('error',function(error){
			console.log('Erreur => ' + error);
			socket.destroy();
		});
	});
		callback({'tts': data.ttsAction});
}
