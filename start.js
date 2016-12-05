var express = require('express');
var app = express();
app.use(express.static('public'));
var fs = require('fs');
var ostype = require('os').type();
var fs = require('fs');

fs.access('tmp', fs.F_OK, function (err) {
	if(err)
	{
		console.log("Création du dossier temporaire..")
		fs.mkdir('tmp');
	}
});
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpServer = http.createServer(app);
var portscanner = require('portscanner');
var httpsServer = https.createServer(credentials, app);
app.get('/', function(req, res) {
	res.render("index.ejs");
});

var io      = require('socket.io').listen(httpServer);

io.on('connection', function(socket){
	console.log('a user connected');
	socket.emit("roomspdate",Object.keys(messages));

	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
	socket.on("postmessage",postmessage);
	socket.on('connectchat',function(info)
	{

		console.log(info.sender+" opened " +info.idChat);
		socket.join(info.idChat);
		if(!messages[info.idChat])
		{
			messages[info.idChat] = {
				mqueue:[],
				name:info.idChat
			}

			io.sockets.emit("roomspdate",Object.keys(messages));
		}
		socket.emit(info.idChat,messages[info.idChat].mqueue);
	});


});


messages = {
	"Xtrem Snakes":{
		name:"Xtrem Snakes",
		mqueue:[{sender:"Thomas",message:"Hello Clement"}, {sender:"Clement",message:"Hello Thomas"}, {sender:"Clement",message:"Ca va ?"}, {sender:"Thomas",message:"Nickel"}]
	}
	
}



const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))

postmessage = function(message){
	console.log(message.sender+" sent "+message.message+" in "+message.idChat);
	messages[message.idChat].mqueue.push({sender:message.sender||"Anonymous",message:message.message||"Hello everybody !"});
	io.to(message.idChat).emit(message.idChat,[message]);
}



function checkPortAndLaunch(checkPort,adresse,typeServeur,serveur, callback)
{
	portscanner.checkPortStatus(checkPort, adresse, function(error, status) {
		if (status==='open') {
			portscanner.findAPortNotInUse(8000, 9000, adresse, function(error, port) {
				
				// console.log("Le port "+checkPort +" est déja en cours d'utilisation ! ");
				checkPort=port;
				serveur.listen(checkPort,adresse);
				console.log("Serveur "+typeServeur+" asigné au port " +checkPort);
				if(callback) callback();
			})
		}
		else
		{
			serveur.listen(checkPort,adresse);
			console.log("Serveur "+typeServeur+" asigné au port " +checkPort);
			if(callback) callback();
		}

	})
}
var phttp=8080;
var phttps=8081;
var adresse='0.0.0.0';
console.log("TENTATIVE DE LANCEMENT DU SERVEUR HTTP/HTTPS");
checkPortAndLaunch(phttp, adresse,"HTTP "+adresse,httpServer,function(){
	checkPortAndLaunch(phttps, adresse,"HTTPS "+adresse,httpsServer);
});

