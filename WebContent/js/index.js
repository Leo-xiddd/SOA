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
function getweekday(){
	var d=new Date();
	var days=d.getDay();
	switch(days){
		case 1:
			days='星期一'
			break;
		case 2:
			days='星期二'
			break;
		case 3:
			days='星期三'
			break;
		case 4:
			days='星期四'
			break;
		case 5:
			days='星期五'
			break;
		case 6:
			days='星期六'
			break;
		case 0:
			days='星期日'
			break;
	}
	return days;
}
function exit(){
	sessionStorage.currpage="";
	window.open("login.html",'_self');
}
function clickmenu(oldpage,module){	
	if(oldpage!=''){
		$("#"+oldpage).css("background-color", "transparent");	
		$("#"+oldpage).children().eq(0).css("background-color", "transparent");
	}
	
	sessionStorage.currpage=module;
	$("#"+module).css("background-color", "#112243");	
	$("#"+module).children().eq(0).css("background-color", "#5989fe");	
	$("#main").load(sessionStorage.currpage+".html");
}
$(document).ready(function(){ 
	if(typeof(sessionStorage.customerId)=='undefined'){
		var url="login.html";
		window.open(encodeURI(url),'_self');
	}
	if(typeof(sessionStorage.currpage)=='undefined' ||sessionStorage.currpage=='')sessionStorage.currpage="home";
	clickmenu('',sessionStorage.currpage);
	
	$("#lside").css('height',($(document).height()));
	$("#user").text(sessionStorage.usrfullname);
	// $("#accout_pic").attr("src","http://192.168.4.60:8080/hrm/img/"+sessionStorage.customerId+".jpg");
	var dd=getDate();
	dd=dd.substring(0,10);
	var tt=dd.split("-");
	$("#current_date").text(tt[0]+"年"+tt[1]+"月"+tt[2]+"日");
	$("#current_day").text(getweekday());
	//避免页面刷新调回主页面，默认登录进入工作空间页面，对应按钮置亮

	//鼠标滑过菜单按钮的变色效果
	// $(".menutxt").mouseenter(function(e) { 
	// 	$(e.target).parent().css("background-color", "#112243");	
	// 	$(e.target).parent().children().eq(0).css("background-color", "#5989fe");	
	// });
	// $(".menutxt").mouseleave(function (e) { 
	// 	$(e.target).parent().css("background-color", "transparent");	
	// 	$(e.target).parent().children().eq(0).css("background-color", "transparent");
	// });
	
	//选择模块跳转
	$(".menutxt").click(function b(e){
		clickmenu(sessionStorage.currpage,$(e.target).parent().attr("id"));
	});
});