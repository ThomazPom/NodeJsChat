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

	idDivContent++;
}

$(document).on("click",".closeDivContent",function()
{
	var divContent = $(this).closest('.divContent');
	socket.removeListener(divContent.find(".idChat").val());
	divContent.remove();
});

$(document).on("click",".appicon",newDataFrame);


socket.on("roomspdate",function(rooms){
	$(".sidebar-nav li.dynamic").remove();
	$(rooms).each(function(){
		$(".sidebar-nav").append($("<li>",{class:"dynamic"}).append(
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


$("#newChannelButton").click(function(){
	var name = $("#newChannelInput").val();
	if(name.length>0)
	{
		newDataFrame("chatRoomLink",name);
	}
});




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
		$(message).each(function(){
			refresChatRoom(this,chatWindow);
		});
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