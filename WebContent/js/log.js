var xmlHttp;
var tr_selected;
// 与后台传递API
function TMS_api(url,med,dats,cfunc){	
	var hostpath=getHostUrl('hostpath_api');	
	try{
		url=hostpath+url;
		xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange=cfunc;		
		xmlHttp.open(med,url,true);
		if(med=="GET")xmlHttp.send();
		else xmlHttp.send(dats);	
	}catch(e){
		alerm(e);
	}	
}
// 加载日志列表
function load_Logs(filter){
	//清除当前列表
	$("#tbody_log tr").remove();
	tr_selected=null;
	if(filter=="")filter="filter=";
	var url="EAS/ListLogs?"+filter+"&type="+type;
	TMS_api(url,"GET","",function a(){
		if (xmlHttp.readyState==4 && xmlHttp.status==200){
			var resp = JSON.parse(xmlHttp.responseText);
			if(resp.code==200){	
				for(var i=0;i<resp.logs.length;i++){			
					var tr0='<tr>';				
					var td1='<td>'+resp.logs[i].logdate+'</td>';
					var td2='<td>'+resp.logs[i].operator+'</td>';
					var td3='<td>'+resp.logs[i].obj+'</td>';
					var td4='<td><div class="logtext">'+resp.logs[i].log+'</div></td>';			
					var tr1="</tr>";
					var record=tr0+td1+td2+td3+td4+tr1;
					$("#tbody_log").append(record);					
				}	
			}
			else alerm(resp.message);
		}		
	});
}
// 查找设备
function filt(){
	var fts="";
	var filter=$("#filt_value").val();
	var phase=$("#filt_key option:selected").attr("value");
	if(filter!="")fts="filter="+phase+" like '*"+filter+"*'";
	load_Logs(fts);
}
// 翻页
function Topage(num){
	if(page_num!=num){
		if(num==0)page_num=page_sum;
		else page_num=num;
		filt();
	}
}
function Nextpage(tag){
	if(tag=="+" && page_num!=page_sum) page_num++;
	else if(tag=="-" && page_num!=1) page_num--;		
	filt();	
}
/*******************主函数****************/
$(document).ready(function(){ 
	tr_selected=null;
	type="物理设备";
	if(typeof(sessionStorage.customerId)=='undefined'){
		var url="login.html";
		window.open(encodeURI(url),'_parent');
	}
	//初始化页面
	load_Logs("");

	// 点击选择日志
	$("#tbody_log").click(function b(e){
		var tr=$(e.target).parent();
		if($(e.target).attr("class")=='logtext')tr=$(e.target).parent().parent();
		if(tr_selected!=null)tr_selected.css("background-color",old_bgcolor);
		tr_selected=tr;
		old_bgcolor=tr.css("background-color");
		tr_selected.css("background-color","#E3F1F7");	
	});
	
	// 双击日志显示操作详情
	$("#tbody_log").dblclick(function b(e){
		var tr=$(e.target).parent();
		if($(e.target).attr("class")=='logtext')tr=$(e.target).parent().parent();
		$("#logdate").text(tr.children().eq(0).text());
		$("#operator").text(tr.children().eq(1).text());
		$("#log").text(tr.children().eq(3).children().eq(0).text());
		open_form('#form_loginfo','#overlay');
	});

	// 点击按钮切换日志类型
	$(".headbutt").click(function b(e){
		type=$(e.target).text();		
		$(".headbutt").css("background-color","#37A4A4");
		$(e.target).css("background-color","#2C5C77");
		load_Logs("");
	});
});