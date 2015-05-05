/*__________________________________________________
|                 RXVRemote v4.0                    |
|                                                   |
| Authors : Phil Bri ( 05/2015 ) 					|
| Description :                                     |
|    YAMAHA Amplifier Plugin for SARAH V4.x project |
|    (See http://encausse.wordpress.com/s-a-r-a-h/) |
|___________________________________________________|
*/

exports.init = function ( SARAH ) {

    if ( /^autodetect$/i.test( Config.modules.RxvRemote.Ampli_IP ) == false) return console.log('RXVRemote => Autodetect [OFF]')
    else console.log('RXVRemote => Autodetect [ON] : Recherche de l\'IP en cours...');

    // Configure UpNp ip autodetection : (Auto Detect Plugin)
    if ( ! SARAH.context.rxvremote ) {
        findRXV = require ( './lib/findRXV.js' ) ( 'Yamaha', 'Yamaha', function ( RetIP ) {
            SARAH.context.rxvremote = { 'ip' : RetIP };
            if ( SARAH.context.rxvremote.ip ) console.log ( '\r\nRXVRemote => Autodetect [ON] : ip = ' + SARAH.context.rxvremote.ip );
            else console.log ( '\r\nRXVRemote => Autodetect [ON] : ip non trouvé !' );
        });
    }
}

exports.action = function ( data , callback , config , SARAH ) {
    var myReg = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/,
        AmpliIP;

    if ( typeof(SARAH.context.rxvremote) != 'undefined' && SARAH.context.rxvremote.ip != '') AmpliIP = SARAH.context.rxvremote.ip
    else if ( myReg.test( Config.modules.RxvRemote.Ampli_IP ) == true ) AmpliIP = Config.modules.RxvRemote.Ampli_IP
    else return callback ({ 'tts' : 'Ampli Yamaha non trouvé.' });
    
    var cmd = { key : data.key + '\r\n' , ip : AmpliIP.toString() };

    var net = require ( 'net' );
	var socket = net.connect ({ host: cmd.ip, port: 50000 },function () {
		
        console.log ( '\nRXVRemote => Commande [OK]: ' + data.ttsAction );
		socket.end ( cmd.key );

		socket.on ( 'error' , function ( error ) {
			console.log ( '\nRXVRemote => Erreur : ' + error.message );
			socket.destroy ();
		});
	});
	callback ({ 'tts': data.ttsAction });
}
