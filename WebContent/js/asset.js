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
	var url="http://192.168.4.60:8080/eas/EAS/ListObj?objtype=all&page_count="+item_ppnum+"&page_num="+page_num+"&user="+sessionStorage.usrfullname;
	TMS_api(url,"GET","",function a(){
		if (xmlHttp.readyState==4 && xmlHttp.status==200){
			var resp = JSON.parse(xmlHttp.responseText);
			if(resp.code==200){	
				var bgcolor="a";
				$("#tbody_MT tr").remove();
				var objlist=resp.objlist;
				for(var i=0;i<objlist.length;i++){
					if(bgcolor=="")bgcolor='background-color:#F0ECF3;';
					else bgcolor="";
					var line='<tr style="'+bgcolor+'">';
					line=line+'<td>'+(item_ppnum*(page_num-1)+i+1)+'</td>';
					line=line+'<td>'+objlist[i].asset_num+'</td>';
					line=line+'<td>'+objlist[i].type+'</td>';
					line=line+'<td>'+objlist[i].series_num+'</td>';

					line=line+'<td>'+objlist[i].brand+'</td>';
					line=line+'<td>'+objlist[i].model+'</td>';
					line=line+'<td>'+objlist[i].capacity+'</td>';
				
					pt=objlist[i].outport_date;
					if(pt=="0001-01-01")pt="";
					line=line+'<td>'+pt+'</td>';
					
					line=line+'</tr>';
					$("#tbody_MT").append(line);	
				}
				// 变更页码
				var item_sum=parseInt(resp.total_num);
				page_sum=Math.ceil(item_sum/item_ppnum);
				$("#page_num").text(page_sum);
				if(resp.objlist.length==0)page_num=0;
				$("#curr_page").text(page_num);

				$("#sum_server").text(resp.total_num);
				// $("#sum_switch").text(resp.sw_num);
				// $("#sum_fireware").text(resp.fw_num);
				// $("#sum_otherdevice").text(resp.other_num);
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
$(document).ready(function(){ 
	tr_selected=null;
	page_sum=0;
	page_num=1;
	loadlist();	
});