var xmlHttp;
function TMS_api(url,med,dats,cfunc){
	var hostpath=getHostUrl();		
	try{
		xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange=cfunc;		
		xmlHttp.open(med,url,true);
		if(med=="GET")xmlHttp.send();
		else xmlHttp.send(dats);	
	}catch(e){
		alerm(e);
	}	
}
function init(){
	var url="http://192.168.4.60:8080/soa/GetGG?title=";
	TMS_api(url,"GET","",function a(){
		if (xmlHttp.readyState==4 && xmlHttp.status==200){
			var resp = JSON.parse(xmlHttp.responseText);
			if(resp.code==200){	
				$("#gg_title").text(resp.gg.title);
				$("#gg_dtime").text(resp.gg.dtime);
				$("#gg_author").text(resp.gg.author);
				var cc=resp.gg.content;
				cc=cc.replace(/<p>/gi,"");
				cc=cc.replace(/<\/p>/gi,"");
				$("#gg_content").text(cc);
			}
			else alerm(resp.message);
		}
	});	
}
$(document).ready(function(){ 
	init();

	$("#hrm").click(function b(){	
		var role=sessionStorage.role;
		if(role=='管理员' || role=='HR'){
			sessionStorage.currpage="Req.html";
			window.open("http://192.168.4.60:8080/hrm/home.html");
		}
		else if(role=='面试官'){
			sessionStorage.currpage="Review_arrange.html";
			window.open("http://192.168.4.60:8080/hrm/home_a.html");
		}
		else {
			sessionStorage.currpage="EIT.html";
			window.open("http://192.168.4.60:8080/hrm/home_b.html");
		}
	});

	$("#ips").click(function b(){
		window.open("http://192.168.4.60:8080/ips/login.html");
	});
	$("#eas").click(function b(){	
		window.open("http://192.168.4.60:8080/eas/login.html");
	});
	$("#butt_moredetails").click(function b(){	
		var url="http://192.168.4.60:8080/soa/GetGG?title="+$("#gg_title").text();
		TMS_api(url,"GET","",function a(){
			if (xmlHttp.readyState==4 && xmlHttp.status==200){
				var resp = JSON.parse(xmlHttp.responseText);
				if(resp.code==200){	
					$("#board_title").text(resp.gg.title);
					$("#board_dtime").text(resp.gg.dtime);
					$("#board_author").text(resp.gg.author);
					var cc=resp.gg.content;
					$("#content").html(cc);
					open_form("#form_board_gg","#overlay");
				}
				else alerm(resp.message);
			}
		});	
	});
	$("#neikan").click(function b(){	
		
	});
	$("#neikan").click(function b(){	
		
	});

	//弹层移动
	$('#title_form_board_gg').mousedown(function (event) { 
		var isMove = true; 
		var abs_x = event.pageX - $('#form_board_gg').offset().left; 
		var abs_y = event.pageY - $('#form_board_gg').offset().top; 
		$(document).mousemove(function (event) { 
			if (isMove) { 
				var obj = $('#form_board_gg'); 
				var rel_left=event.pageX - abs_x;
				if(rel_left<0)rel_left=0;
				if(rel_left>1080)rel_left=1080;
				var rel_top=event.pageY - abs_y;
				if(rel_top<0)rel_top=0;
				if(rel_top>740)rel_top=740;
				obj.css({'left':rel_left, 'top':rel_top}); 
			} 
		}).mouseup( function () { 
			isMove = false; 
		}); 
	});

	$('#form_alert_title').mousedown(function (event) { 
		var isMove = true; 
		var abs_x = event.pageX - $('#form_alert').offset().left; 
		var abs_y = event.pageY - $('#form_alert').offset().top; 
		$(document).mousemove(function (event) { 
			if (isMove) { 
				var obj = $('#form_alert'); 
				var rel_left=event.pageX - abs_x;
				if(rel_left<0)rel_left=0;
				if(rel_left>1080)rel_left=1080;
				var rel_top=event.pageY - abs_y;
				if(rel_top<0)rel_top=0;
				if(rel_top>740)rel_top=740;
				obj.css({'left':rel_left, 'top':rel_top}); 
			} 
		}).mouseup( function () { 
			isMove = false; 
		}); 
	});
});