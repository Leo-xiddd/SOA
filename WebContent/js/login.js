var xmlHttp;
function TMS_api(url,med,dats,cfunc){	
	var hostpath=getHostUrl();
	try{
		url=encodeURI(hostpath+url);
		xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange=cfunc;		
		xmlHttp.open(med,url,true);
		if(med=="GET")xmlHttp.send();
		else xmlHttp.send(dats);	
	}catch(e){
		alerm(e);
	}	
}

$(document).ready(function(){
	$("body").css({"height":getWindowInnerHeight,"width":getWindowInnerWidth});
	$("#butt_login").click(function(){	
		var user=$("#loginuser").val();
		var pwd= $("#loginpwd").val();	
		sessionStorage.currpage="home";
		sessionStorage.customerId=user;
		sessionStorage.customerPwd=pwd;
		if(user==""){
			alerm("用户名不能为空！");
			$("#loginuser").focus();
		}
		else if(pwd==""){
			alerm("密码不能为空！");
			$("#loginpwd").focus();
		}
		else{	 
			url="User/Authen?user="+user+"&pwd="+encypt(pwd);
			TMS_api(url,"GET","",function(){
				if(xmlHttp.readyState==4 && xmlHttp.status==200){
					var resp = JSON.parse(xmlHttp.responseText);
					if(resp.code==200){
						sessionStorage.currpage="home";
						sessionStorage.customerId=user;
						sessionStorage.customerPwd=pwd;
						sessionStorage.usrfullname=resp.fullname;
						sessionStorage.role=resp.role;
						window.open("index.html",'_self');

					}
					else alerm(resp.message);
				}
			});
		}
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

$(document).keyup(function(event){
	if(event.keyCode ==13) $("#butt_login").trigger("click");
});