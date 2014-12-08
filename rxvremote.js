/*__________________________________________________
|                 RXVRemote v2.0                    |
|                                                   |
| Authors : Phil Bri ( 12/2014 ) 					|
|    (See http://encausse.wordpress.com/s-a-r-a-h/) |
| Description :                                     |
|    YAMAHA Amplifier Plugin for SARAH project		|
|___________________________________________________|
*/

var AmpliIP;

exports.init = function ( SARAH ) {
    var config = SARAH.ConfigManager.getConfig();
 
    if ( /^autodetect$/i.test( config.modules.rxvremote.Ampli_IP ) == false ) {
        return AmpliIP = config.modules.rxvremote.Ampli_IP;
    }

    // Configure ip autodetection : (Auto Detect Plugin)
    if ( ! SARAH.context.rxvremote ) {
        fsearch();
        SARAH.listen ( 'autodetect', function ( data ) {
            if ( data.from != 'RXVRemote' ) fsearch();
            else {
                if ( SARAH.context.rxvremote.ip ) console.log ( '\r\nRXVRemote => Ampli Yamaha : ip = ' +
                    SARAH.context.rxvremote.ip + ' (Auto Detect Plugin)');
                else console.log ( '\r\nRXVRemote => Ampli Yamaha : Non trouvé (Auto Detect Plugin)' );
                SARAH.context.flag = false;
            }
        });
    }

    function fsearch () {
        if ( SARAH.context.flag != true ) {
            SARAH.context.flag = true;

            findRXV = require ( './lib/findRXV.js' ) ( 'Yamaha', 'Yamaha', function ( RetIP ) {
                SARAH.context.rxvremote = { 'ip' : RetIP };
                AmpliIP = SARAH.context.rxvremote.ip;
                SARAH.trigger ( 'autodetect', { 'from' : 'RXVRemote' });
            });
        }
    }
}

exports.action = function ( data , callback , config , SARAH ) {
    var myReg = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/;
    
    if ( ! myReg.test( SARAH.context.rxvremote.ip ) && ! myReg.test( config.modules.rxvremote.Ampli_IP )) { 
        return callback ({ 'tts' : 'Ampli Yamaha non trouvée' }) }

    AmpliIP = SARAH.context.rxvremote.ip;
	var cmd = { key : data.key + '\r\n' , ip : AmpliIP };

	if ( ! cmd.ip ) {
		console.log ( 'Missing YAMAHA A/V IP in rxvremote.prop !' );
		callback ({ 'tts': 'Adresse I P incorrecte ou absente !' });
		return;
	}

	var net = require ( 'net' );
	var socket = net.connect ({ host: cmd.ip, port: 50000 },function () {
		console.log ( '\r\nRXVRemote => Commande : ' + cmd.key );
		socket.end ( cmd.key );
		
		socket.on( 'data' , function ( data ) {
			console.log ( '\r\nRXVRemote => Retour = ' + data );
		});

		socket.on ( 'error' , function ( error ) {
			console.log ( '\r\nRXVRemote => Erreur : ' + error );
			socket.destroy ();
		});
	});

	callback ({ 'tts': data.ttsAction });
}
