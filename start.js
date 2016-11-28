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

messages = {
	testqueue:{
		mqueue:[{s:"Thomas",m:"Hello Clement"}, {s:"Clement",m:"Hello Thomas"}, {s:"Clement",m:"Ca va ?"}, {s:"Thomas",m:"Nickel"}]
	}
	
}
app.get('/postmessage', function(req, res) {
	if(!messages[req.query.idChat])
	{
		messages[req.query.idChat] = {
			mqueue:[]
		}
	}

	messages[req.query.idChat].mqueue.push({s:req.query.sender,m:req.query.message});
	//res.send(JSON.stringify(messages[req.query.idChat]));	

	res.send(JSON.stringify([]));
});


app.get('/getmessage', function(req, res) {
	var idmessage = req.query.idMessage
	if(messages[req.query.idChat])
	{
		res.send(JSON.stringify(messages[req.query.idChat].mqueue.slice(idmessage)));
		return;
	}
	res.send(JSON.stringify([]));
	
})
;

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

