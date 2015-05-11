var socket;

function setSocket () {
    socket = require('net').createConnection(50000, SARAH.context.rxvremote.ip);

    var ival = setInterval( function () {
        socket.write('@SYS:MODELNAME=?\r\n');
    }, 39000);

    socket.on('connect', function (){
        console.log('\x1b[96m[  INFO ]\x1b[0m RxvRemote: Connected.');
        socket.write('@MAIN:PWR=?\r\n');
        socket.write('@MAIN:INP=?\r\n');
    }).on('end', function (){
        console.log('\033[91m[ ERROR ]\033[0m RxvRemote: Deconnected.');
        clearInterval(ival);
    }).on('error', function (erreur){
        console.log('\033[91m[ ERROR ]\033[0m RxvRemote: ' + erreur.message );
        socket.destroy();
    });
}

exports.init = function (SARAH) {
    if (!SARAH.context.rxvremote) {
        if (/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/.test(Config.modules.RxvRemote.Ampli_IP)==true)
            SARAH.context.rxvremote = {ip: Config.modules.RxvRemote.Ampli_IP};
        else {
            findRXV = require ('./lib/findRXV.js') ('Yamaha', 'Yamaha', function (RetIP) {
                SARAH.context.rxvremote = {ip: RetIP};
                if (SARAH.context.rxvremote.ip) setSocket();
                else return console.log ('\033[91m[ ERROR ]\033[0m RxvRemote: IP not find!');
            });
        }
    } 
}

exports.action = function (data , next) {
    console.log('\x1b[92m[    OK ]\x1b[0m RxvRemote: Commande => '+data.tts);
    socket.write(data.key+'\r\n');
	next ({'tts': data.tts});
}
