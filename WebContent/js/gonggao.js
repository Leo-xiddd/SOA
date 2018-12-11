var tr_selected;
var page_sum;
var page_num;
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
// 加载设备列表
function loadlist() {
	var item_ppnum=17;
	tr_selected=null;
	var url="http://192.168.4.60:8080/soa/ListGG?type="+$("#type").val()+"&page_count="+item_ppnum+"&page_num="+page_num;
	TMS_api(url,"GET","",function a(){
		if (xmlHttp.readyState==4 && xmlHttp.status==200){
			var resp = JSON.parse(xmlHttp.responseText);
			if(resp.code==200){	
				$("#tbody_GG tr").remove();
				var objlist=resp.objlist;
				var line="";
				for(var i=0;i<objlist.length;i++){
					line=line+'<tr><td>'+(item_ppnum*(page_num-1)+i+1)+'</td>';
					line=line+'<td>'+objlist[i].title+'</td>';
					line=line+'<td style="text-align: center">'+objlist[i].author+'</td>';
					pt=objlist[i].dtime;
					if(pt=="0001-01-01")pt="";
					line=line+'<td>'+pt+'</td>';
					var cont=objlist[i].content;
					cont=cont.replace(/<p>/gi,"");
					cont=cont.replace(/<\/p>/gi,"");
					line=line+'<td><div class="gg_summary">'+cont+'</div></td>';
					line=line+'</tr>';
						
				}
				$("#tbody_GG").append(line);
				// 变更页码
				var item_sum=parseInt(resp.total_num);
				page_sum=Math.ceil(item_sum/item_ppnum);
				if(page_sum==0)page_sum=1;
				$("#page_num").text(page_sum);
				if(resp.objlist.length==0)page_num=1;
				$("#curr_page").text(page_num);

				$("#sum_server").text(resp.total_num);
				if(page_num<2){
					$("#Fir_page").attr("disabled",true);
					$("#Pre_page").attr("disabled",true);
				}
				else{
					$("#Fir_page").attr("disabled",false);
					$("#Pre_page").attr("disabled",false);
				}
				if(page_num==page_sum){
					$("#Next_page").attr("disabled",true);
					$("#Las_page").attr("disabled",true);
				}
				else{
					$("#Next_page").attr("disabled",false);
					$("#Las_page").attr("disabled",false);
				}	
			}
			else alerm(resp.message);
		}
	});	
}
// 保存公告
function save(){
	if($("#name").val()==""){
		alerm("公告标题不能为空！");
		$("#name").focus();
	}
	else if($("#content").val()==""){
		alerm("公告内容不能为空！");
		$("#content").focus();
	}
	else{
		var b={};
		b.content=$("#content").val();
		b.content=b.content.replace(/\n/g,"</p><p>");
		b.content="<p>"+b.content+"</p>";
		b.type=$("#form_type").val();
		b.author=sessionStorage.usrfullname;
		var body=JSON.stringify(b);
		var url="http://192.168.4.60:8080/soa/AddGG?title="+$("#name").val();
		url=encodeURI(url);
		TMS_api(url,"POST",body,function a(){
			if (xmlHttp.readyState==4 && xmlHttp.status==200){
				var resp = JSON.parse(xmlHttp.responseText);
				if(resp.code==200){	
					CloseForm('#form_GG','#overlay');
					loadlist();
				}
				else alerm(resp.message);
			}
		});	
	}
}
// 添加公告
function add(){
	if(sessionStorage.role=="管理员"){
		$("#name").val("");
		$("#note").val("");
		open_form("#form_GG","#overlay");
	}
	else{
		alerm("您没有权限操作，请联系管理员！");
	}
}
// 删除公告
function del(){
	if(sessionStorage.role=="管理员"){
		if(tr_selected==null)alerm("请选择要删除的公告！");
		else{
			var url="http://192.168.4.60:8080/soa/DelGG?title="+tr_selected.children().eq(1).text();
			TMS_api(url,"GET","",function a(){
				if (xmlHttp.readyState==4 && xmlHttp.status==200){
					var resp = JSON.parse(xmlHttp.responseText);
					if(resp.code==200){	
						loadlist();
					}
					else alerm(resp.message);
				}
			});	
		}
	}
	else{
		alerm("您没有权限操作，请联系管理员！");
	}
}
// 翻页
function Topage(num){
	if(page_num!=num){
		if(num==0)page_num=page_sum;
		else page_num=num;
		loadlist();
	}
}
function Nextpage(tag){
	if(tag=="+" && page_num!=page_sum) page_num++;
	else if(tag=="-" && page_num!=1) page_num--;		
	loadlist();
}

// **************************主程序*******************************
$(document).ready(function(){ 
	tr_selected=null;
	page_sum=0;
	page_num=1;
	loadlist();	

	//选择或取消媒体选择
	$("#tbody_GG").click(function b(e){
		var tr=$(e.target).parent();
		if($(e.target).attr("class")=="gg_summary")tr=tr.parent();
		if(tr_selected!=null)tr_selected.children().css("background-color","transparent");
		tr_selected=tr;
		tr_selected.children().css("background-color","#FCF4ED");	
	});
	//双击打开公告
	$("#tbody_GG").dblclick(function b(e){
		var tr=$(e.target).parent();
		if($(e.target).attr("class")=="gg_summary")tr=tr.parent();
		if(tr_selected!=null)tr_selected.children().css("background-color","transparent");
		tr_selected=tr;
		old_bgcolor=tr.children().eq(0).css("background-color");
		tr_selected.children().css("background-color","#FCF4ED");	

		var url="http://192.168.4.60:8080/soa/GetGG?title="+tr.children().eq(1).text();
		TMS_api(url,"GET","",function a(){
			if (xmlHttp.readyState==4 && xmlHttp.status==200){
				var resp = JSON.parse(xmlHttp.responseText);
				if(resp.code==200){	
					$("#board_title").text(resp.gg.title);
					$("#board_dtime").text(resp.gg.dtime);
					$("#board_author").text(resp.gg.author);
					var cc=resp.gg.content;
					$("#board_content").html(cc);
					open_form("#form_board_gg","#overlay");
				}
				else alerm(resp.message);
			}
		});	
	});
	$("#type").change(function b(e){
		loadlist();
	});
	//弹层移动
	$('#title_form_GG').mousedown(function (event) { 
		var isMove = true; 
		var abs_x = event.pageX - $('#form_GG').offset().left; 
		var abs_y = event.pageY - $('#form_GG').offset().top; 
		$(document).mousemove(function (event) { 
			if (isMove) { 
				var obj = $('#form_GG'); 
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