function save(){

}

// 添加会议
function add(){
	$("#form_room").text($("#room").val());
	$("#form_date").text($("#orderdate").val());
	open_form("#form_order","#overlay");
}
// 取消会议
function del(){

}
$(document).ready(function(){ 
	var now=getDate();
	now=now.substring(0,now.indexOf(" "));
	$("#orderdate").val(now);
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
		});
	});
	
});