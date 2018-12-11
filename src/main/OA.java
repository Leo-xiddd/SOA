/** 类说明：本模块用于实现OA服务器相关的API
 *  作   者：Leo
 *  时   间：2017/10/30
 *  版   本：V3.0.1
 *  方   法：本模块支持的方法包括：
 *  	1. 上传测试脚本				String 	UploadTS(String usr,String proj,String mod,HttpServletRequest req)
 *  	2. 删除测试脚本				String 	DelTS(String usr,String TS)
 *  	3. 列出脚本						String	ListTS(String filter, String page_count, String page_num) 
 */
package main;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadBase;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.log4j.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import base.*;
public class OA {
	DBDriver dbd = new DBDriver();
//	配置日志属性文件位置
	static String confpath=System.getProperty("user.dir").replace(File.separator+"bin", "");
	static String logconf=confpath+File.separator+"conf"+File.separator+"SOA"+File.separator+"logconf.properties";
	static String sysconf=confpath+File.separator+"conf"+File.separator+"SOA"+File.separator+"Sys_config.xml";
	Logger logger = Logger.getLogger(OA.class.getName());
	SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
	SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd");
	SimpleDateFormat sdf_sn = new SimpleDateFormat("yyyyMMddHHmm");
	
	public String DoAPI(String API,Map<String, String[]> Param,String body,HttpServletRequest req){						
		PropertyConfigurator.configure(logconf);		
		logger.info("API: "+API+" "+" [Body]"+body);
		String backvalue="412,http 请求的参数缺失或无效";
		String title=checkpara(Param,"title");
		String type=checkpara(Param,"type");
		String author=checkpara(Param,"author");
		String name=checkpara(Param,"name");
		String ver=checkpara(Param,"ver");
		String id=checkpara(Param,"id");
		String room=checkpara(Param,"room");
		String order_date=checkpara(Param,"order_date");
		String st_time=checkpara(Param,"st_time");
		String ed_time=checkpara(Param,"ed_time");
		String master=checkpara(Param,"master");
		String page_count=checkpara(Param,"page_count");
		String page_num=checkpara(Param,"page_num");
//		开始处理API
		try {
			switch(API){
//			公告处理
			case "AddGG":
				if(!body.equals("") && !title.equals("")) {
					logger.info("添加公告...");		
					AddGG(title, body);	
					backvalue="200,ok"; 
				}		
				break;
			case "DelGG":
				if(!title.equals("")) {
					logger.info("删除公告["+title+"]...");		
					DelGG(title);	
					backvalue="200,ok"; 
				}		
				break;
			case "ListGG":   
				logger.info("列出所有公告...");				
				return ListGG(type,page_count,page_num);
			case "GetGG":
				logger.info("获取公告...");		
				return GettGG(title);	
//			文档处理
			case "AddDoc":
				if(!type.equals("") && !name.equals("")) {
					logger.info("添加文档...");		
					AddDoc(type, author, name, ver, req);	
					backvalue="200,ok"; 
				}		
				break;
			case "DelDoc":
				if(!name.equals("")) {
					logger.info("删除文档["+name+"]...");		
					DelDoc(name);	
					backvalue="200,ok"; 
				}		
				break;
			case "ListDoc":   
				logger.info("列出所有文档...");				
				return ListDoc();
//			预订会议室
			case "OrderMeeting":
				if(!room.equals("") && !st_time.equals("") && !ed_time.equals("") && !body.equals("")) {
					logger.info("预订会议...");		
					OrderMeeting(room, st_time, ed_time, body);	
					backvalue="200,ok"; 
				}		
				break;
			case "CancelMeeting":
				if(!id.equals("") && !master.equals("")) {
					logger.info("取消会议...");		
					CancelMeeting(id,master);	
					backvalue="200,ok"; 
				}	
			case "ListMTR":   
				if(!order_date.equals("")) {
					logger.info("列出所有会议...");				
					return ListMTR(order_date);
				}		
				break;
			default:
				logger.error("无效API: "+API);
				backvalue="400,无效API!";
			}
		}catch (Throwable e) {
			backvalue=e.getMessage();
			int firtag=backvalue.lastIndexOf("[info]");
			if(firtag>-1) backvalue=backvalue.substring(firtag+6);
			else backvalue="500,"+backvalue;
			logger.error(backvalue,e);
		}	
		String code=backvalue.substring(0,backvalue.indexOf(","));
		String message=backvalue.substring(backvalue.indexOf(",")+1);
		backvalue="{\"code\":"+code+",\"message\":\""+message+"\"}";
		return backvalue;
	}
	/**
	 * 函数说明：创建一个新的公告
	 * @param  title				公告标题
	 * @param  Rdata			公告内容
	 * @throws Exception 	401,操作权限不足
	 * @throws Exception 	404,用户名参数为空
	 * @throws Exception 	412,参数不正确
	 * @throws Exception 	500,数据库故障
	 */
	void AddGG(String title, String Rdata) throws Exception {
		PropertyConfigurator.configure(logconf);		
		String[] Table_col= {"title","dtime","type","author","content"};
		String[] record= new String[Table_col.length];
		try {
			JSONObject gg=new JSONObject(Rdata);
			for(int i=2;i<Table_col.length;i++)record[i]=gg.getString(Table_col[i]);
			int row=dbd.check("db_gonggao", "title", title);
			if(row>0)throw new Exception("[info]412, 公告["+title+"]已存在");
			record[0]=title;
			record[1]=sdf.format(new Date());						
			dbd.AppendSQl("db_gonggao", Table_col, record, 1, 1);
		} catch(JSONException e) {
			logger.error("数据不完整"+e.toString());
			throw new Exception("[info]412,数据不完整,"+e.toString());
		}catch (Throwable e) {
			logger.error(e.toString());
			throw new Exception(e);
		}		
	}
	
	/**
	 * 函数说明：删除公告
	 * @param 	title		公告标题
	 * @throws 	Exception 	401,操作权限不足
	 * @throws 	Exception	500,数据库故障
	 */
	void DelGG(String title)throws Exception  {
		PropertyConfigurator.configure(logconf);	
		try {	
			int row=dbd.check("db_gonggao", "title", title);
			if(row>0) {
				dbd.DelSQl("db_gonggao", row, 1, 1);
			}
		} catch (Throwable e) {
			logger.error(e.toString(),e);
			throw new Exception(e);
		}
	}	
	/**
	 * 函数说明：列出当前所有公告
	 * @param  type	公告类型
	 * @param  page_count		分页显示时，每页显示的条数
	 * @param  page_num		分页显示时，显示的页码
	 * @return	  JSONArray格式字符串
	 * @throws Exception 500,数据库故障
	 */
	String ListGG(String type,String page_count,String page_num) throws Exception {
		PropertyConfigurator.configure(logconf);	
//		检查参数是否有效
		try {
			String filter="id>0";
			if(!type.equals("") && !type.equals("全部"))filter="type='"+type+"'";	
			String filter1=filter+" order by dtime desc";
			filter=filter+" order by dtime desc limit "+Integer.parseInt(page_count)*(Integer.parseInt(page_num)-1)+","+page_count;
			int sum_num=dbd.checknum("db_gonggao", "title", filter1);
			String Colname="title,dtime,author,content";
			String[][] ul=dbd.readDB("db_gonggao", Colname, filter);
			JSONObject gglist=new JSONObject();
			JSONArray jas= new JSONArray();
			int num=ul.length;
			if(!ul[0][0].equals("")) {
				for(int i=0;i<num;i++) {
					JSONObject jsb=new JSONObject();
					jsb.put("title", ul[i][0]);
					ul[i][1]=sdf1.format(sdf.parse(ul[i][1]));
					jsb.put("dtime", ul[i][1]);
					jsb.put("author", ul[i][2]);
					jsb.put("content", ul[i][3]);
					jas.put(jsb);
				}
			}			
			gglist.put("total_num", sum_num);
			gglist.put("objlist", jas);
			gglist.put("code", 200);
			return gglist.toString();
		}catch(Throwable e) {
			logger.error(e.getMessage(), e);
			throw new Exception(e.getMessage());
		}		
	}
	/**
	 * 函数说明：列出指定公告
	 * @param  title		公告标题
	 * @return	  JSONArray格式字符串
	 * @throws Exception 500,数据库故障
	 */
	String GettGG(String title) throws Exception {
		PropertyConfigurator.configure(logconf);	
//		检查参数是否有效
		try {
			String filter="id>0";
			if(!title.equals(""))filter="title='"+title+"'";	
			filter=filter+" order by dtime desc limit 0,1";
	
			String Colname="title,dtime,author,content";
			String[][] ul=dbd.readDB("db_gonggao", Colname, filter);
			
			JSONObject gglist=new JSONObject();
			JSONObject jsb=new JSONObject();
			if(!ul[0][0].equals("")) {		
				jsb.put("title", ul[0][0]);
				ul[0][1]=sdf1.format(sdf.parse(ul[0][1]));
				jsb.put("dtime", ul[0][1]);
				jsb.put("author", ul[0][2]);
				jsb.put("content", ul[0][3]);
			}			
			gglist.put("gg", jsb);
			gglist.put("code", 200);
			return gglist.toString();
		}catch(Throwable e) {
			logger.error(e.getMessage(), e);
			throw new Exception(e.getMessage());
		}		
	}
	
	/**
	 * 函数说明：预订会议
	 * @param 	room		会议室
	 * @param 	st_time		开始时间
	 * @param 	ed_time		结束时间
	 * @param 	Rdata		会议数据
	 * @throws 	Exception 	401,操作权限不足
	 * @throws 	Exception 	404,用户名参数为空
	 * @throws 	Exception 	412,参数不正确
	 * @throws Exception 	500,数据库故障
	 */
	void OrderMeeting(String room, String st_time, String ed_time, String Rdata) throws Exception {
		PropertyConfigurator.configure(logconf);		
	
		String[] Table_col= {"room","st_time","ed_time","master","master_name","p_number","video","note"};
		String[] record= new String[Table_col.length];
		try {
//			检查会议室是否被占用
			String filter="room='"+room+"' and (st_time>'"+ed_time+"' or ed_time<'"+st_time+"')";
			int num=dbd.checknum("db_meetorder", "id", filter);
			if(num>0)throw new Exception("[info]414,该时段已有会议，请另选时间！");
//			预订会议
			JSONObject mtr=new JSONObject(Rdata);
			for(int i=3;i<Table_col.length;i++)record[i]=mtr.getString(Table_col[i]);
			record[0]=room;			
			record[1]=st_time;
			record[2]=ed_time;
			
			dbd.AppendSQl("db_meetorder", Table_col, record, 1, 1);
			
//			检查是否需要添加新的会议室
			num=dbd.check("db_meetroom", "room", room);
			String[] colname= {"room"};
			String[] record1= new String[1];
			record1[0]=room;
			if(num==0)dbd.AppendSQl("db_meetroom", colname, record1, 1, 1);
		} catch(JSONException e) {
			logger.error("数据不完整"+e.toString());
			throw new Exception("[info]412,数据不完整,"+e.toString());
		}catch (Throwable e) {
			logger.error(e.toString());
			throw new Exception(e);
		}		
	}
	
	/**
	 * 函数说明：取消会议
	 * @param 	id		会议ID
	 * @param 	master		会议预定人工号
	 * @throws 	Exception 	401,操作权限不足
	 * @throws 	Exception	500,数据库故障
	 */
	void CancelMeeting(String id, String master)throws Exception  {
		PropertyConfigurator.configure(logconf);	
		try {	
//			判断会议是否预定人本人取消
			String[][] mtr=dbd.readDB("db_meetorder", "master", "id="+id);
			if(mtr[0][0].equals(master)) {
				int row=Integer.parseInt(id);
				if(row>0) {
					dbd.DelSQl("db_meetorder", row, 1, 1);
				}
			}
			else if(!mtr[0][0].equals(""))throw new Exception("[info]414, 该会议只能由本人取消！");
		} catch (Throwable e) {
			logger.error(e.toString(),e);
			throw new Exception(e);
		}
	}	
	
	/**
	 * 函数说明：列出当前所有新闻
	 * @param  filter	过滤器，由前端设定
	 * @param  page_count		分页显示时，每页显示的条数
	 * @param  page_num		分页显示时，显示的页码
	 * @return	  JSONArray格式字符串
	 * @throws Exception 500,数据库故障
	 */
	String ListMTR(String order_date) throws Exception {
		PropertyConfigurator.configure(logconf);	
//		检查参数是否有效
		try {
			JSONObject mtrs=new JSONObject();
//			获取会议室列表			
			JSONArray mrlist= new JSONArray();
			String[][] mrs=dbd.readDB("db_meetroom", "room", "id>0");
			if(!mrs[0][0].equals("")) {
				String Colname="st_time,ed_time,id,master_name,p_number,video,note";
				SimpleDateFormat sdf2 = new SimpleDateFormat("HH");
				SimpleDateFormat sdf3 = new SimpleDateFormat("mm");
				String cols[]=Colname.split(",");
				for(int i=0;i<mrs.length;i++) {
					JSONObject mto=new JSONObject();
					JSONArray orders= new JSONArray();
					mto.put("room", mrs[i][0]);
					String[] times= {"09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30"};
					for(int j=0;j<times.length;j++) {
						JSONObject order=new JSONObject();
						String[][] mtr=dbd.readDB("db_meetorder", Colname, "room='"+mrs[i][0]+"' and st_time like '"+order_date+" "+times[j]+"%'");
						if(mtr[0][0].equals("")) order.put("num", "0");
						else{
							int st_h=Integer.parseInt(sdf2.format(sdf.parse(mtr[0][0])));
							int st_m=Integer.parseInt(sdf3.format(sdf.parse(mtr[0][0])));
							int ed_h=Integer.parseInt(sdf2.format(sdf.parse(mtr[0][1])));
							int ed_m=Integer.parseInt(sdf3.format(sdf.parse(mtr[0][1])));
							
							int r_num=((ed_h-st_h)*60+(ed_m-st_m))/30;
							order.put("num", ""+r_num);
							for(int k=2;k<cols.length;k++)order.put(cols[k], mtr[0][k]);
							orders.put(order);
							j=j+r_num-1;
						}
					}
					mto.put("orders", orders);
					mrlist.put(mto);
				}				
			}
			mtrs.put("mto", mrlist);
			mtrs.put("code", 200);
			return mtrs.toString();
		}catch(Throwable e) {
			logger.error(e.getMessage(), e);
			throw new Exception(e.getMessage());
		}		
	}
	
	/**[Function] 	添加文档
	 * @param type			文档类型
	 * @param author		文档发布人
	 * @param name		文档名
	 * @param ver			文档版本
	 * @param req			文档数据
	 * @return	 JSON格式字符串，message字段会给出上传结果
	 * @throws Exception 201, 文件上传成功，但存在重名文件
	 * @throws Exception 402, 上传文件格式不正确或上传失败
	 * @throws Exception 403, 上传文件容量过大
	 * @throws Exception 404, 项目或模块不存在 
	 */
	void AddDoc(String type, String author, String name, String ver, HttpServletRequest req) throws Exception{
		PropertyConfigurator.configure(logconf);		
		String[] Table_col= {"name","dtime","type","author","ver"};
		String[] record= new String[Table_col.length];
		try {
			record[0]=name;
			record[1]=sdf.format(new Date());
			record[2]=type;
			record[3]=author;
			record[4]=ver;
			int row=dbd.check("db_document", "name", name);
			if(row>0)throw new Exception("[info]412, 文档["+name+"]已存在");
			dbd.AppendSQl("db_document", Table_col, record, 1, 1);					

	//		判断文件格式是否正确
			if(!ServletFileUpload.isMultipartContent(req))throw new Exception("[info]402, 上传的文件格式不正确！");		
	//		开始上传文件
			String tempPath = confpath+File.separator+"webapps"+File.separator+"SOA"+File.separator+"docs"+File.separator+"temp";
			String filepath=confpath+File.separator+"webapps"+File.separator+"SOA"+File.separator+"docs"+File.separator;
	
	//		1、创建一个DiskFileItemFactory工厂
			DiskFileItemFactory factory = new DiskFileItemFactory();                     									
			factory.setRepository(new File(tempPath));
			factory.setSizeThreshold(1024*1024*50);	
				
	//		2、创建一个文件上传解析器
			ServletFileUpload upload = new ServletFileUpload(factory);
			upload.setHeaderEncoding("UTF-8");
			upload.setFileSizeMax(1024*1024*50);
			upload.setSizeMax(1024*1024*100);	      
			logger.info("上传路径确认，开始上传文件...");	
				
	//		3、使用ServletFileUpload解析器解析上传数据，解析结果返回的是一个List<FileItem>集合，每一个FileItem对应一个Form表单的输入项
	         List<FileItem> list = upload.parseRequest(req);
	//      初始化重复文件列表
	         for(FileItem item : list){
	           	String filename = item.getName();
	            if(filename==null || filename.trim().equals("")) continue;                             
	            String tfn=filepath + filename;
	            File file = new File(tfn);
	            if(file.exists())file.delete();
	                
	           	InputStream in = item.getInputStream();		// 获取item中的上传文件的输入流
	           	FileOutputStream outa = new FileOutputStream(tfn);			//创建一个文件输出流
	           	byte buffer[] = new byte[1024];
	           	int len = 0;
	           	while((len=in.read(buffer))>0){
	                outa.write(buffer, 0, len);
	             } 
	           	in.close();  
	 	        outa.close();  
	        }
		}catch (FileUploadBase.FileSizeLimitExceededException e) {
			logger.error(e.getMessage(), e);
			throw new Exception("[info]403, 单个文件超出最大值！");
        }catch (FileUploadBase.SizeLimitExceededException e) {
        	logger.error(e.getMessage(), e);
			throw new Exception("[info]403, 上传文件的总的大小超出限制的最大值！");
        }catch (Throwable e) {
        	logger.error(e.getMessage(), e);
			throw new Exception("[info]402, 文件上传失败！");
        }
	}
	/**
	 * 函数说明：列出文档
	 * @param  type	文档类型
	 * @return	  JSONArray格式字符串
	 * @throws Exception 500,数据库故障
	 */
	String ListDoc() throws Exception {
		PropertyConfigurator.configure(logconf);	
//		检查参数是否有效
		try {
			String Colname="id,name,author,dtime,ver,type";
			String cols[]=Colname.split(",");
			String[][] ul=dbd.readDB("db_document", Colname, "id>0");
	
			JSONObject docs=new JSONObject();
			JSONArray jas= new JSONArray();
			int num=ul.length;
			if(!ul[0][0].equals("")) {
				for(int i=0;i<num;i++) {
					JSONObject jsb=new JSONObject();
					if(ul[i][3].indexOf("0001-01-01")>-1)ul[i][3]="";
					else ul[i][3]=sdf.format(sdf.parse(ul[i][3]));
					for(int k=0;k<cols.length;k++)jsb.put(cols[k], ul[i][k]);
					jas.put(jsb);
				}
			}			
			docs.put("total_num", num);
			docs.put("docs", jas);
			docs.put("code", 200);
			return docs.toString();
		}catch(Throwable e) {
			logger.error(e.getMessage(), e);
			throw new Exception(e.getMessage());
		}		
	}
	/**
	 * 函数说明：删除文档
	 * @param 	name		文档名称
	 * @throws 	Exception 	401,操作权限不足
	 * @throws 	Exception 	404,文件不存在
	 * @throws 	Exception 	412,参数不正确
	 * @throws Exception 	500,数据库故障
	 */
	void DelDoc(String name) throws Exception {
		PropertyConfigurator.configure(logconf);		
		try {
			int row=dbd.check("db_document", "name", name);
			if(row>0) {
				dbd.DelSQl("db_document", row, 1, 1);			
				File src = new File(confpath+File.separator+"webapps"+File.separator+"SOA"+File.separator+"docs"+File.separator+""+name);
				if(src.isFile())src.delete();
			}
		} catch(JSONException e) {
			logger.error("数据不完整"+e.toString());
			throw new Exception("[info]412,数据不完整,"+e.toString());
		}catch (Throwable e) {
			logger.error(e.toString());
			throw new Exception(e);
		}		
	}
	/**[Function] 				获取http请求报文中的参数值
	 * @author para		请求报文中的参数序列
	 * @author key			预期的参数名
	 * @return [String]		返回参数结果，如果请求的参数序列为空，或者没有要查询的参数，返回“”，否则返回查询到的参数值
	 */
	String checkpara(Map<String,String[]> para,String key){
		PropertyConfigurator.configure(logconf);
		String ba="";		
		if(para.size()>0){
			try{
				String[] val=para.get(key);
				if(null!=val)ba=val[0];
			}catch(NullPointerException e){
				logger.error(e.toString());
			}
		}	
		return ba;
	}
	
	/**[Function] 				验证Token参数是否正确，以及用户名和密码是否匹配
	 * @return [int]			返回执行结果代码，200对应操作成功，412对应校验不通过，500为数据库或系统错误
	 */
	int TokenVerify(String token){
		int code=0;
		return code;
	}
}