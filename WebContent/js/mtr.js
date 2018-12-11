var mt_sel;
var xmlHttp;
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
function LoadList(o_date){
	var url="http://192.168.4.60:8080/soa/ListMTR?order_date="+o_date;
	TMS_api(url,"GET","",function a(){
		if (xmlHttp.readyState==4 && xmlHttp.status==200){
			var resp = JSON.parse(xmlHttp.responseText);
			if(resp.code==200){	
				var mto=resp.mto;
				$(".orderlist").remove();
				for(var i=0;i<mto.length;i++){
					var orders=mto[i].orders;
					var line="<tr class='orderlist'><td></td>";
					for(var j=0;j<orders.length;j++){
						if(parseInt(orders[j].num)==0)line=line+"<td></td>";
						else{
							if(parseInt(orders[j].num)>3){
								line=line+'<td id="'+parseInt(orders[j].id)+'" colspan="'+parseInt(orders[j].num)+'" valign="middle" class="meetnote">';
								line=line+'预定人：'+orders[j].master_name+'<br>';
								line=line+'投影仪：'+orders[j].video+'<br>';
								line=line+'会议人数：'+orders[j].p_number+'<br>';
								line=line+'会议事由：'+orders[j].note+'<br></td>';

							}
							else{
								line=line+'<td id="'+parseInt(orders[j].id)+'" colspan="'+parseInt(orders[j].num)+'" ';
								line=line+'valign="middle" class="meetnote" ';
								line=line+'value1="'+orders[j].master_name+'" value2="'+orders[j].video+'" value3="'+orders[j].p_number+'" value4="'+orders[j].note+'">';
								line=line+'</td>';
							} 
							
						}
					}
					line=line+"</tr>";
					$("#"+mto[i].room).after(line);
				}
			}
			else alerm(resp.message);
		}
	});
}
function save(){
	var mtr={};
	mtr.master=sessionStorage.customerId;
	mtr.master_name=sessionStorage.usrfullname;
	mtr.p_number=$("#num").val();
	mtr.video=$("#video").val();
	mtr.note=$("#note").val();
	if(mtr.note==""){
		alerm("请输入会议内容！");
		$("#note").focus();
	}
	else{
		if(parseInt($("#ed_time option:selected").attr("id")) > parseInt($("#st_time option:selected").attr("id"))){
			var st_time=$("#form_date").text()+" "+$("#st_time").val();
			var ed_time=$("#form_date").text()+" "+$("#ed_time").val();
			var body=JSON.stringify(mtr);
			var url="http://192.168.4.60:8080/soa/OrderMeeting?room="+$("#room option:selected").attr("value")+"&st_time="+st_time+"&ed_time="+ed_time;
			TMS_api(url,"POST",body,function a(){
				if (xmlHttp.readyState==4 && xmlHttp.status==200){
					var resp = JSON.parse(xmlHttp.responseText);
					if(resp.code==200){
						CloseForm('#form_order','#overlay');
						alerm("添加成功！");					
						LoadList($("#orderdate").val());
					}
					else alerm(resp.message);
				}
			});	
		}
		else alerm("会议的结束时间应该大于开始时间！");
	}	
}

// 添加会议
function add(){
	$("#form_date").text($("#orderdate").val());
	var curtime=getDate();
	var ct_h=parseInt(curtime.substr(curtime.indexOf(" ")+1,2));
	var ct_m=parseInt(curtime.substr(curtime.indexOf(":")+1,2));
	var mm="";
	var mm1="";
	var edh=ct_h+1;
	if(ct_m<30){
		mm='30';
		mm1='00';
	}
	else {
		mm="00";
		mm1='30';
		ct_h++;
	}
	$("#st_time").val(ct_h+":"+mm);
	$("#ed_time").val(edh+":"+mm1);
	$("#note").val("");
	open_form("#form_order","#overlay");
}
// 取消会议
function del(){
	if(mt_sel==null)alerm("请选择要取消的会议！");
	else{
		var url="http://192.168.4.60:8080/soa/CancelMeeting?id="+mt_sel.attr("id")+"&master="+sessionStorage.customerId;
		TMS_api(url,"GET","",function a(){
			if (xmlHttp.readyState==4 && xmlHttp.status==200){
				var resp = JSON.parse(xmlHttp.responseText);
				if(resp.code==200)LoadList($("#orderdate").val());
				else alerm(resp.message);
			}
		});	
	}
}
$(document).ready(function(){ 
	mt_sel=null;	
	var now=getDate();
	now=now.substring(0,now.indexOf(" "));
	$("#orderdate").val(now);
	LoadList(now);
	// 选择会议
	$("#tbody_mtr").click(function b(e){
		if($(e.target).attr("class")=="meetnote"){
			CloseForm('#form_floatmess','#overlay');
			if(mt_sel!=null)mt_sel.css("background-color","#f1e3eb");
			$(e.target).css("background-color","#ecabd2");
			mt_sel=$(e.target);
			if(parseInt(mt_sel.attr("colspan"))<4){
				$("#fm_master_name").text(mt_sel.attr("value1"));
				$("#fm_video").text(mt_sel.attr("value2"));
				$("#fm_p_number").text(mt_sel.attr("value3"));
				$("#fm_note").text(mt_sel.attr("value4"));
				$("#form_floatmess").css({"top": event.clientY + 10,"left":event.clientX});
				open_form("#form_floatmess","#overlay");
			}
		}
	});
	$("body").click(function b(e){
		if($(e.target).attr("class")!="meetnote")CloseForm("#form_floatmess","#overlay");
	});
	//选择会议室日期
	$("#orderdate").click(function b(){
		$("#orderdate").change(function b(){	
			var newdate=$("#orderdate").val();
			var oDate1 = new Date();
	    	var oDate2 = new Date(newdate);
	    	var oDate3 = new Date();
	        oDate3.setDate(oDate1.getDate() + 2);

			if(oDate1.getTime() > oDate2.getTime()){
				alerm("不能选择今天之前的日期");
				$("#orderdate").val(now);
			}
			else if(oDate2.getTime() > oDate3.getTime()){
				alerm("只能选择三天之内的日期");
				$("#orderdate").val(now);
			}
			else LoadList(newdate);
		});
	});
	//选择会议起始时间
	$("#st_time").change(function b(){	
		var newtime=$("#st_time").val();
		var nt_h=parseInt(newtime.substr(0,newtime.indexOf(":")));
		var nt_m=parseInt(newtime.substring(newtime.indexOf(":")+1)); 
		
		var curtime=getDate();
		var ct_h=parseInt(curtime.substr(curtime.indexOf(" ")+1,2));
		var ct_m=parseInt(curtime.substr(curtime.indexOf(":")+1,2));

		if(nt_h<ct_h){
			var curtime=getDate();
			var ct_h=parseInt(curtime.substr(curtime.indexOf(" ")+1,2));
			var ct_m=parseInt(curtime.substr(curtime.indexOf(":")+1,2));
			var mm="";
			var mm1="";
			var edh=ct_h+1;
			if(ct_m<30){
				mm='30';
				mm1='00';
			}
			else {
				mm="00";
				mm1='30';
				ct_h++;
			}
			$("#st_time").val(ct_h+":"+mm);
			$("#ed_time").val(edh+":"+mm1);
			alerm("不能选择比当前更早的时间");
		}
		else if(nt_h==ct_h && nt_m<ct_m){
			var curtime=getDate();
			var ct_h=parseInt(curtime.substr(curtime.indexOf(" ")+1,2));
			var ct_m=parseInt(curtime.substr(curtime.indexOf(":")+1,2));
			var mm="";
			var mm1="";
			var edh=ct_h+1;
			if(ct_m<30){
				mm='30';
				mm1='00';
			}
			else {
				mm="00";
				mm1='30';
				ct_h++;
			}
			$("#st_time").val(ct_h+":"+mm);
			$("#ed_time").val(edh+":"+mm1);
			alerm("不能选择比当前更早的时间");
		}
		else{
			
			$("#ed_time").val($("#st_time").val());
		}
	});

	//选择会议结束时间
	$("#ed_time").change(function b(){	
		var st_time=$("#st_time").val();
		var nt_h=parseInt(st_time.substr(0,st_time.indexOf(":")));
		var nt_m=parseInt(st_time.substring(st_time.indexOf(":")+1)); 

		var ed_time=$("#ed_time").val();
		var ct_h=parseInt(ed_time.substr(0,ed_time.indexOf(":")));
		var ct_m=parseInt(ed_time.substring(ed_time.indexOf(":")+1)); 
		if(nt_h>ct_h){
			$("#ed_time").val($("#st_time").val());
			alerm("结束时间不能早于开始时间");
		}
		else if(nt_h==ct_h && nt_m>ct_m){
			$("#ed_time").val($("#st_time").val());
			alerm("结束时间不能早于开始时间");
		}
	});
	//弹层移动
	$('#title_form_order').mousedown(function (event) { 
		var isMove = true; 
		var abs_x = event.pageX - $('#form_order').offset().left; 
		var abs_y = event.pageY - $('#form_order').offset().top; 
		$(document).mousemove(function (event) { 
			if (isMove) { 
				var obj = $('#form_order'); 
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