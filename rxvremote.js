/*__________________________________________________
|                 RXVRemote v2.2                    |
|                                                   |
| Authors : Phil Bri ( 12/2014 ) 					|
| Description :                                     |
|    YAMAHA Amplifier Plugin for SARAH project		|
|    (See http://encausse.wordpress.com/s-a-r-a-h/) |
|___________________________________________________|
*/

exports.init = function ( SARAH ) {
    var config = SARAH.ConfigManager.getConfig();
 
    if ( /^autodetect$/i.test( config.modules.RxvRemote.Ampli_IP ) == false ) return console.log('VieraRemote => Autodetect [OFF]');

    // Configure UpNp ip autodetection : (Auto Detect Plugin)
    if ( ! SARAH.context.rxvremote ) {
        fsearch();

        SARAH.listen ( 'autodetect', function ( data ) {
            if ( data.from != 'RXVRemote' ) fsearch();
            else {
                if ( SARAH.context.rxvremote.ip ) console.log ( '\r\nRXVRemote => Autodetect [ON] : ip = ' + SARAH.context.rxvremote.ip );
                else console.log ( '\r\nRXVRemote => Autodetect [ON] : ip non trouvé !' );
                SARAH.context.flag = false;
            }
        });
    }

    function fsearch () {
        if ( SARAH.context.flag != true ) {
            SARAH.context.flag = true;

            findRXV = require ( './lib/findRXV.js' ) ( 'Yamaha', 'Yamaha', function ( RetIP ) {
                SARAH.context.rxvremote = { 'ip' : RetIP };
                SARAH.trigger ( 'autodetect', { 'from' : 'RXVRemote' });
            });
        }
    }
}

exports.action = function ( data , callback , config , SARAH ) {
    var myReg = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/,
        AmpliIP;

    if ( typeof(SARAH.context.rxvremote) != 'undefined' ) AmpliIP = SARAH.context.rxvremote.ip
    else if ( myReg.test( config.modules.RxvRemote.Ampli_IP ) == true ) AmpliIP = config.modules.RxvRemote.Ampli_IP
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
