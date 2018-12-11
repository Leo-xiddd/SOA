var doc_sel;
var xmlHttp;
var formData;
function TMS_api(url,med,dats,cfunc){
	var hostpath=getHostUrl();		
	try{
		url=encodeURI(url);
		xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange=cfunc;		
		xmlHttp.open(med,url,true);
		if(med=="GET")xmlHttp.send();
		else xmlHttp.send(dats);	
	}catch(e){
		alerm(e);
	}	
}
function LoadList(){
	var url="http://192.168.4.60:8080/soa/ListDoc";
	TMS_api(url,"GET","",function a(){
		if (xmlHttp.readyState==4 && xmlHttp.status==200){
			var resp = JSON.parse(xmlHttp.responseText);
			if(resp.code==200){	
				var docs=resp.docs;
				$("#tbody_hr tr").remove();
				$("#tbody_cw tr").remove();
				$("#tbody_xz tr").remove();
				$("#tbody_bus tr").remove();
				$("#tbody_mkt tr").remove();
				$("#tbody_rd tr").remove();
				$("#tbody_bm tr").remove();

				for(var i=0;i<docs.length;i++){
					var doc_ext=docs[i].name;
					doc_ext=doc_ext.substring(doc_ext.indexOf(".")+1);
					var docpic="defultdocpic.jpg";
					if(doc_ext=="pdf")docpic="pdfpic.jpg";
					else if(doc_ext=="doc" || doc_ext=="docx")docpic="docpic.jpg";
					else if(doc_ext=="xls" || doc_ext=="xlsx")docpic="xlspic.jpg";

					var line='<tr><td><img src="img/'+docpic+'" width="30px" onclick="opendoc(\''+docs[i].name+'\')"></td>';
					line=line+'<td>'+docs[i].name+'</td>';
					line=line+'<td>'+docs[i].author+'</td>';
					line=line+'<td>'+docs[i].dtime+'</td>';
					line=line+'<td>'+docs[i].ver+'</td>';
					line=line+'</tr>';
					
					if(docs[i].type=="人事制度")$("#tbody_hr").append(line);
					else if(docs[i].type=="财务制度")$("#tbody_cw").append(line);
					else if(docs[i].type=="行政制度")$("#tbody_xz").append(line);
					else if(docs[i].type=="商务制度")$("#tbody_bus").append(line);
					else if(docs[i].type=="市场制度")$("#tbody_mkt").append(line);
					else if(docs[i].type=="研发制度")$("#tbody_rd").append(line);
					else if(docs[i].type=="保密制度")$("#tbody_bm").append(line);
				}
			}
			else alerm(resp.message);
		}
	});
}
function opendoc(file){
	window.open("/docs/"+file);
}
function addFile(){
	var sourceId='picfile_select';
	formData = new FormData();
	var url;
	if (navigator.userAgent.indexOf("MSIE")>=1) { // IE 
		url = document.getElementById(sourceId).value; 
	} else if(navigator.userAgent.indexOf("Firefox")>0) { // Firefox 
		url = window.URL.createObjectURL(document.getElementById(sourceId).files.item(0)); 
	} else if(navigator.userAgent.indexOf("Chrome")>0) { // Chrome 
		url = window.URL.createObjectURL(document.getElementById(sourceId).files.item(0)); 
	} 
	var fn=document.getElementById(sourceId).files[0].name;
	formData.append("file", document.getElementById(sourceId).files[0]); 

	$("#name").val(fn);
}
function save(){
	if(formData==null){
		alerm("请选择要上传的文件");
	}
	else{
		var name=$("#name").val();
		var author=sessionStorage.usrfullname;
		var type=$("#type").val();
		var ver=$("#ver").val();
		var body=formData;
		var url="http://192.168.4.60:8080/soa/AddDoc?type="+type+"&name="+name+"&ver="+ver+"&author="+author;
		TMS_api(url,"POST",body,function a(){
			if (xmlHttp.readyState==4 && xmlHttp.status==200){
				var resp = JSON.parse(xmlHttp.responseText);
				if(resp.code==200){
					CloseForm('#form_doc','#overlay');
					alerm("添加成功！");					
					LoadList();
				}
				else alerm(resp.message);
			}
		});	
	}	
}

// 添加会议
function add(){
	if(sessionStorage.role=="管理员"){
		$("#name").val("");
		$("#ver").val("");
		open_form("#form_doc","#overlay");
	}
	else{
		alerm("您没有权限操作，请联系管理员！");
	}
}
// 取消会议
function del(){
	if(sessionStorage.role=="管理员"){
		if(doc_sel==null)alerm("请选择要删除的文档！");
		else{
			var url="http://192.168.4.60:8080/soa/DelDoc?name="+doc_sel.children().eq(1).text();
			TMS_api(url,"GET","",function a(){
				if (xmlHttp.readyState==4 && xmlHttp.status==200){
					var resp = JSON.parse(xmlHttp.responseText);
					if(resp.code==200)LoadList();
					else alerm(resp.message);
				}
			});	
		}
	}
	else{
		alerm("您没有权限操作，请联系管理员！");
	}
}
// *******************************主程序**************************
$(document).ready(function(){ 
	doc_sel=null;
	LoadList();

	$(".document_title").click(function b(e){
		$(e.target).next().slideToggle("fast");
	});
	
	//展开收缩文档列表
	$(".doclist").click(function b(e){
		var tr=$(e.target).parent();
		if(doc_sel!=null)doc_sel.children().css("background-color","transparent");
		doc_sel=tr;
		doc_sel.children().css("background-color","#FCF4ED");	
	});
	// 选择文件
	$("#picfile_selector").click(function b(){
		$("#picfile_selector").next().click();
	});
	//选
	//弹层移动
	$('#title_form_doc').mousedown(function (event) { 
		var isMove = true; 
		var abs_x = event.pageX - $('#form_doc').offset().left; 
		var abs_y = event.pageY - $('#form_doc').offset().top; 
		$(document).mousemove(function (event) { 
			if (isMove) { 
				var obj = $('#form_doc'); 
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