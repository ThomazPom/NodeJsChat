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

var users = {

}

io.on('connection', function(socket){
	console.log('a user connected');
	socket.emit("roomspdate",Object.keys(messages));
	socket.join(socket.id);
	users[socket.id]={name:"Anonymous"};
	io.sockets.emit("usersupdate",users);
	socket.on('nickname', function(nickname){
		console.log(users[socket.id].name+ " renamed to " +nickname);
		users[socket.id].name=nickname;
		io.sockets.emit("usersupdate",users);
	});

	
	socket.on('disconnect', function(){
		console.log('user disconnected');
		delete users[socket.id];
		io.sockets.emit("usersupdate",users);
	});
	socket.on("postmessage",function(message){
		console.log(message.sender+" sent "+message.message+" in "+message.idChat);
		var objmess = {sender:message.sender||"Anonymous",message:message.message||"Hello everybody !"}
		
		if (users[message.idChat]) {
			console.log	("an user chatroom")
			var chatroomid = message.idChat+socket.id
			if(message.idChat>socket.id)
			{
				chatroomid = socket.id+message.idChat
			}
			usersmessages[chatroomid].mqueue.push(objmess);		
			io.to(socket.id).emit(socket.id,[message]);
			socket.emit(message.idChat,[message]);
		}
		else if (messages[ message.idChat])
		{
			messages[message.idChat].mqueue.push(objmess);	
			
			io.to(message.idChat).emit(message.idChat,[message]);

		}
	});
	socket.on('quitchat',function(info)
	{

		console.log(info.sender+" closed " +info.idChat);
		io.to(info.idChat).emit(info.idChat,{sender:"System",message:info.sender+" a quitté le chat !"});
		
	});
	socket.on('connectchat',function(info)
	{

		console.log(info.sender+" opened " +info.idChat);
		socket.join(info.idChat);
		io.to(info.idChat).emit(info.idChat,{sender:"System",message:info.sender+" s'est connecté au chat !"});
		
		if ( users[info.idChat]) {
			
			console.log("(an user chatroom)");
			var chatroomid = info.idChat+socket.id
			if(info.idChat>socket.id)
			{
				chatroomid = socket.id+info.idChat
			}
			if(!usersmessages[chatroomid])
			{
				console.log("Creation conversation id "+ chatroomid);
				usersmessages[chatroomid] = {
					mqueue:[],
					name:chatroomid
				}
			}
			socket.emit(info.idChat ,usersmessages[chatroomid].mqueue);
		}
		else 
		{
			if(!messages[info.idChat])
			{

				console.log("Creation chatroom id "+ chatroomid);
				messages[info.idChat] = {
					mqueue:[],
					name:info.idChat
				}

			}
			io.sockets.emit("roomspdate",Object.keys(messages));
			socket.emit(info.idChat,messages[info.idChat].mqueue);
			
		}
	});


});



usersmessages = {

}

messages = {
	"Xtrem Snakes":{
		name:"Xtrem Snakes",
		mqueue:[{sender:"Thomas",message:"Hello Clement"}, {sender:"Clement",message:"Hello Thomas"}, {sender:"Clement",message:"Ca va ?"}, {sender:"Thomas",message:"Nickel"}]
		
	}

}



const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))




function checkPortAndLaunch(checkPort,adresse,typeServeur,serveur, callback)
{
	portscanner.findAPortNotInUse(checkPort, checkPort+1000, adresse, function(error, port) {
		serveur.listen(port,adresse);
		console.log("Serveur "+typeServeur+" asigné au port " +checkPort);
		if(callback) callback();
	})
}
var phttp=8080;
var phttps=8081;
var adresse='0.0.0.0';
console.log("TENTATIVE DE LANCEMENT DU SERVEUR HTTP/HTTPS");
checkPortAndLaunch(phttp, adresse,"HTTP "+adresse,httpServer,function(){
	checkPortAndLaunch(phttps, adresse,"HTTPS "+adresse,httpsServer);
});

