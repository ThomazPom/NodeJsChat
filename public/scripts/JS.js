//Au cas ou la console n'est pas définie
var alertFallback = false;
if (typeof console === "undefined" || typeof console.log === "undefined") {
	console = {};
	if (alertFallback) {
		console.log = function(msg) {
			alert(msg);
		};
	} else {
		console.log = function() {};
	}
}
//Initialisation des variables
var idDivContent = 0;
var topDivContent =null;
var templateExplorer = null;
var templateStat = null;
var templateEtab = null;
var divWaiter = $("#waiter");
var meter = divWaiter.children(".meter").children("span");
var percentMeter = divWaiter.children(".meter").children("h3").children("text");
divWaiter.draggable();

var socket = io();
socket.on(socket.id,function(message)
{
	newDataFrame("chatRoomLink",socket.id);
});


//-/Initialisation terminée
//Pour ramener une fenêtre au premierPlan

function divContentTopIndex(sender)
{
	
	topDivContent=sender;
	$( ".divContent" ).css("z-index",500);
	sender.style.zIndex=600;
}
//Pour enlever une fenêtre quand on appuie sur la touche échap
$(document).on('keyup',function(evt) {
	if (evt.keyCode == 27) {
		topDivContent.remove();
	}
});
//Pour  créeer des fenêtres les styliser et les initialiser
newDataFrame = function(type=null,data=null)
{
	var divContent =$(".divContent[data='"+(data||$(this).attr("data"))+"']");
	
	if(divContent.length>0)
	{
		divContentTopIndex(divContent[0]);
		var chatWindow=divFrame.find(".chatWindow");
		refresChatRoom(chatWindow);
		return;
	}
	
	var decalage = 60+(idDivContent*10)%100;
	var divContent = $( "#divContent" ).clone().appendTo( "#content" ).attr("id","divContent" +idDivContent).attr("data",data||$(this).attr("data")).css("display","block").css("position","absolute")
	.css("top",decalage+"px").css("left",200+decalage+"px").draggable({
		handle:".divFrame>nav"
	}).resizable().mousedown(function(){divContentTopIndex(this)});
	divContentTopIndex(divContent[0]);
	divContent.find(".divFrame>nav .title.navbar-brand.dropdown-toggle").html($(this).html());
	var tailleAdapter = idDivContent%10;
	if (type=="chatRoomLink"||$(this).hasClass("chatRoomLink")) 
	{
		divContent.css("width",40-tailleAdapter/2+"vw").css("height",80-tailleAdapter+"vh");
		divFrame = divContent.find(".divFrame")
		initchatRoomLink(divFrame,data||$(this).attr("data"));
	}	
	if (type=="exploreFileLink"||$(this).hasClass("exploreFileLink")) 
	{
		divContent.css("width",70-tailleAdapter/2+"vw").css("height",80-tailleAdapter+"vh");
		divFrame = divContent.find(".divFrame")
		initExplorer(divFrame);
	}
	idDivContent++;
}

function initExplorer(divFrame)
{
	var table = $("<table>",{class:"tableexplorer table"});
	divFrame.append(table);
	socket.emit("explorefile","upload");
}
socket.on("fileandFolderList",function(list){
	table = $("table.tableexplorer").empty();
	console.log(list.path);
	table.prepend($("<tr>").prepend($("<td>").prepend($("<h1>",{html:list.path}))));
	$(list.files).each(function(){
		table.append(
			$("<tr>").prepend(
				$("<td>").prepend(
					$("<h4>").prepend(
						$("<a>",{html:"&nbsp;&nbsp;"+this.file,class:this.type?"file":"folder"}).attr("data",this.path).attr("href",this.path).attr("target","blank")
						).prepend(
							$('<span>',{class:this.type?"glyphicon glyphicon-save-file":"glyphicon glyphicon-folder-open"})
							
						)
					)
				)
			);
	});
})
$(document).on("click",".folder",function(e)
{
	e.preventDefault();
	socket.emit("explorefile",$(this).attr("data"));
});

$(document).on("click",".closeDivContent",function()
{
	var divContent = $(this).closest('.divContent');

	socket.emit("quitchat",{idChat:divContent.attr("data"),sender:$("#nameInput").val()});
	socket.removeListener(divContent.find(".idChat").val());
	divContent.remove();
});

$(document).on("click",".appicon",newDataFrame);


function systemMessage(divFrame,message)
{
	var baniere = 	$('<p>',{
		style:"position: absolute; background: black; text-align: center;top: 0px;width: 100%;z-index: 100;color: white;",
		text:message
	})
	divFrame.append(baniere);
	baniere.animate({height:0},4000,"swing",function(){$(this).remove()});

}
socket.on("roomspdate",function(rooms){
	$("#chatroombar li.dynamic").remove();
	$(rooms).each(function(){
		$("#chatroombar").append($("<li>",{class:"dynamic"}).append(
			$("<a>",{
					//	<a class="appicon chatRoomLink" data="audiomaniacs"><span style="color:cyan" class="glyphicon glyphicon-comment" aria-hidden="true"></span> Audio Maniacs</a>
					class:"appicon chatRoomLink",
					html:" "+this


				}).attr("data",this).prepend($("<span>",{
					style:"color:cyan",
					class:"glyphicon glyphicon-comment",
				})))
		)
	});

});

socket.on("usersupdate",function(users){
	$("#userbar li.user").remove();

	var keys =Object.keys(users);
	for (var i = keys.length - 1; i >= 0; i--) {

		if(socket.id != keys[i])
		{
			$("#userbar").append($("<li>",{class:"user"}).append(
				$("<a>",{
					//	<a class="appicon chatRoomLink" data="audiomaniacs"><span style="color:cyan" class="glyphicon glyphicon-comment" aria-hidden="true"></span> Audio Maniacs</a>
					class:"appicon chatRoomLink",
					html:" "+users[keys[i]].name

				}).attr("data",keys[i]).prepend($("<span>",{
					style:"color:green",
					class:"glyphicon glyphicon-copyright-mark",
				})))
			)
		}
	}

});


$("#newChannelButton").click(function(){
	var name = $("#newChannelInput").val();
	if(name.length>0)
	{
		newDataFrame("chatRoomLink",name);
	}
});

$("#nameInput").change(function(){

	socket.emit("nickname",$(this).val());
})



function initchatRoomLink(divFrame, idChat)
{
	socket.emit("connectchat",{idChat:idChat,sender:$("#nameInput").val()});

	divFrame.append($("<div></div>",{class:"chatWindow"}).append($("<div></div>",{class:"content"})));

	divFrame.append($('<input>', {
		value: idChat,
		class:"idChat",			
		type:"hidden"
	}));
	divFrame.append($('<input>', {
		value: 0,
		class:"idMessage",
		type:"hidden"
	}));

	divFrame.append($('<textarea>', {
		value: "",
		placeholder:"Type a message...",
		class:"sendChat"
	}).on('keyup',keypresstextarea));

	var chatWindow=divFrame.find(".chatWindow");
	var content = chatWindow.find(".content");
	chatWindow.animate({ scrollTop: 999999999999}, 10);

	socket.on(idChat,function(message)
	{
		if (message.sender=="System") {
			systemMessage(divFrame,message.message);
		}
		else
		{
			$(message).each(function(){
				refresChatRoom(this,chatWindow);
			});
		}
	});
}

function refresChatRoom(message,chatWindow)
{
	var content = chatWindow.find(".content").append($("<div/>",{
		html:'<label><span style="color:cyan" class="glyphicon glyphicon-comment" aria-hidden="true"></span> '+message.sender+': </label> '+message.message.replace("\n","<br>"),
		class:"alert",
		style:"background-color:#"+intToRGB(hashCode(message.sender))
	}));

	if((chatWindow.scrollTop() / (content.height() - chatWindow.height()))>.85)
	{
		chatWindow.animate({ scrollTop: content.height()}, 1000);
	}
}
var keypresstextarea =    function(e){
	if (e.keyCode == 13) {
                // code for first textarea;
                var divFrame =  $(this).closest(".divFrame");
                var idChat=divFrame.find(".idChat").val();
                var textarea = $(this);
                var chatWindow=divFrame.find(".chatWindow");


                if (textarea.val().trim().length>0) {

                	socket.emit('postmessage', {
                		idChat:idChat,
                		sender:$("#nameInput").val(),
                		message:textarea.val()});
                	textarea.val("");

                }

                else {
                }
            }
        };


function hashCode(str="Anonymous") { // java String#hashCode
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
} 

function intToRGB(i){
	var c = (i & 0x00FFFFFF)
	.toString(16)
	.toUpperCase();

	return "00000".substring(0, 6 - c.length) + c;
}