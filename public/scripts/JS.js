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
$(".appicon").click(function()
{
	var decalage = 60+(idDivContent*10)%100;
	var divContent = $( "#divContent" ).clone().appendTo( "#content" ).attr("id","divContent" +idDivContent).css("display","block").css("position","absolute")
	.css("top",decalage+"px").css("left",200+decalage+"px").draggable({
		handle:".divFrame>nav"
	}).resizable().mousedown(function(){divContentTopIndex(this)});
	divContentTopIndex(divContent[0]);
	divContent.find(".divFrame>nav .title.navbar-brand.dropdown-toggle").html($(this).html());
	var tailleAdapter = idDivContent%10;
	if ($(this).hasClass("chatRoomLink")) 
	{
		divContent.css("width",40-tailleAdapter/2+"vw").css("height",80-tailleAdapter+"vh");
		divFrame = divContent.find(".divFrame")
		
		initchatRoomLink(divFrame,$(this).attr("data"));
	}
	
	idDivContent++;
});
function initchatRoomLink(divFrame, idChat)
{
	divFrame.append($("<div></div>",{class:"chatWindow"}));
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
	refreshchatRoomLink(divFrame);

	chatWindow=divFrame.find(".chatWindow");

	chatWindow.animate({ scrollTop: 9999999999999}, 1000);

}
setInterval(function(){ 
	$(".divFrame").each(function()
	{
		refreshchatRoomLink($(this));
	});

}, 500);
var keypresstextarea =    function(e){
	if (e.keyCode == 13) {
                // code for first textarea;
                var divFrame =  $(this).closest(".divFrame");
                var idChat=divFrame.find(".idChat").val();
                var textarea = $(this);
                chatWindow=divFrame.find(".chatWindow");

                chatWindow2=divFrame.find(".chatWindow")

                //localhost:8000/postmessage?idChat=testqueue&message=Hello&sender=Thomas
                if (textarea.val().trim().length>0) {
                	$.ajax({
                		url: "/postmessage",
                		data:{
                			idChat:idChat,
                			message:textarea.val(),
                			sender:$("#nameInput").val(),
                			method:"POST"


                		}
                	})
                	.done(function( data ) {
                		textarea.val("");
                		refreshchatRoomLink(divFrame,-1);
                //	dataobject = $.parseJSON(data);

            });


                }

                else {
                }
            }
        };

        function refreshchatRoomLink(divFrame,msgid)
        {
        	var chatWindow=divFrame.find(".chatWindow")
        	var idChat=divFrame.find(".idChat").val();
        	var inputIdMessage=divFrame.find(".idMessage");

        	$.ajax({
        		url: "/getmessage",
        		data:{
        			idChat:idChat,
        			idMessage:msgid?msgid:inputIdMessage.val()


        		}
        	})
        	.done(function( data ) {
        		dataobject = $.parseJSON(data);
        		$(dataobject).each(function()
        		{
        			chatWindow.append($("<div/>",{
        				html:'<label><span style="color:cyan" class="glyphicon glyphicon-comment" aria-hidden="true"></span> '+this.s+': </label> '+this.m.replace("\n","<br>"),
        				class:"alert",
        				style:"background-color:#"+intToRGB(hashCode(this.s))
        			}));
        			console.log(this.s);
        			
        		})

        		inputIdMessage.val(parseInt( inputIdMessage.val())+dataobject.length);
        	});
        }

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