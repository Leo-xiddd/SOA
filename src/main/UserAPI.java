/**
 * 本模块提供的API包括：
 * 1. Authen	--	User.Authority(String name, String pwd)
 * 2. Add		--	User.Add(String name, String pwd, String fname, String role, String email, String mobile)
 * 3. Delete	--	User.Del(String name) 
 * 4. List			--	User.List(String filter)
 * 5. Getinfo	--	User.Get(String name)
 */
package main;
import java.io.File;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.apache.log4j.*;

import base.*;

public class UserAPI {
	XMLDriver xml= new XMLDriver();
	DBDriver dbd = new DBDriver();
//	配置日志属性文件位置
	static String confpath=System.getProperty("user.dir").replace(File.separator+"bin", "");
	static String logconf=confpath+File.separator+"conf"+File.separator+"CMS"+File.separator+"logconf.properties";
	static String sysconf=confpath+File.separator+"conf"+File.separator+"CMS"+File.separator+"Sys_config.xml";
	Logger logger = Logger.getLogger(UserAPI.class.getName());
	
	/**[Function] 				API解释模块，根据API检查必要的参数和请求数据的完整性，调用对应API实现模块
	 * @param API			API字符串
	 * @param Param		API请求中URL携带的参数表
	 * @param body		API请求携带的body数据，Json格式字符串
	 * @param token		校验字，API请求携带的header参数，用来保证报文的可靠性和安全性
	 * @return [String]		Json格式字符串，返回API执行的结果
	 */
	public String DoAPI(String API,Map<String, String[]> Param,String body){						
		PropertyConfigurator.configure(logconf);		
		String message="";
		logger.info("API: "+API+" "+" [Body]"+body);
		String backvalue="412,http 请求的参数缺失或无效";
		
		String account=checkpara(Param,"user");
		try {
			switch(API){
			case "Authen":
				logger.info("进行用户鉴权...");	
				String p=checkpara(Param,"pwd");
				if((!account.equals(""))&&(!p.equals(""))) {
					int co=Authority(account,p);
					String fn="";
					String role="";
					if(co<300) {
						fn=getfname(account);
						role=getrole(account);
					}
					return "{\"code\":"+co+",\"fullname\":\""+fn+"\""+",\"role\":\""+role+"\"}";
				}
				break;
			case "Add":   					
				if(!body.equals("")) {
					logger.info("创建新用户账户...");
					Add(body);
					backvalue="200,ok";
				}				
				break;
			case "Update":   	
				logger.info("更新用户信息...");
				if(!body.equals("")) {
					JSONObject jsb=new JSONObject(body);			
					String name=jsb.getString("usrname");
					String pwd=jsb.getString("passwd");
					String fname=jsb.getString("fullname");
					String role=jsb.getString("role");
					String email=jsb.getString("email");
					Change(name, pwd, fname, role, email);
					backvalue="200,ok";
				}				
				break;
			case "Delete":  				
				if(!account.equals("")) {
					logger.info("删除用户账户"+account+"...");
					Del(account);
					backvalue="200,ok";
				}			
				break;
			case "List":   
				logger.info("列出所有用户账户...");				
				String filter=checkpara(Param,"filter");
				String page_count=checkpara(Param,"page_count");
				String page_num=checkpara(Param,"page_num");	
				return list(filter,page_count,page_num);
			case "Getinfo":   
				logger.info("获取指定用户信息...");
				if(!account.equals("")) {
					return GetInfo(account);				
				}
			case "CheckUser":   	
				String pd=checkpara(Param,"filter");
				if(pd.indexOf("=")==-1)pd=pd.replace("*", "%");
				if(!pd.equals("")) {
					logger.info("根据条件"+pd+"查询用户...");
					return GetUserinfo(pd);				
				}
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
		message=backvalue.substring(backvalue.indexOf(",")+1);
		backvalue="{\"code\":"+code+",\"message\":\""+message+"\"}";
		return backvalue;
	}
	
	/**[Function] 			为系统添加一个新用户
	 * @param  tbody 		用户数据
	 * @throws Exception		404, 没有找到数据表
	 * @throws Exception		409, 新用户重名
	 * @throws Exception		412, 必选参数未赋值
	 * @throws Exception		500, 数据库操作失败
	 */
	void Add(String tbody) throws Exception{
		String[] pattern={"usrname","passwd","fullname","role","email"};
		String[] userinfo=new String[pattern.length];
		try{
			JSONObject usr_data=new JSONObject(tbody);
//			检查用户名，必选
			for(int i=0;i<pattern.length;i++)userinfo[i]=usr_data.getString(pattern[i]);
			if(userinfo[0].equals(""))throw new Exception("[info]412,用户名为空");
			int row=dbd.check("sys_usrdb", "usrname", userinfo[0]);
			if(row>0)throw new Exception("[info]409,用户名["+userinfo[0]+"]已存在");
			
//			检查密码，必选
			if(userinfo[1].equals(""))throw new Exception("[info]412,密码参数没有赋值,不支持空密码");
			userinfo[1]=encrypt(userinfo[1]);			//对密码进行加密处理
					
//			角色默认为员工，其他还有管理员、HR、面试官
			if(userinfo[3].equals(""))userinfo[3]="normal";
			dbd.AppendSQl("sys_usrdb", pattern,userinfo,1,1);
		}catch(Throwable e){
			throw new Exception(e);			
		}
	}
	/**[Function] 					删除指定的用户，如果系统中无此用户则不作任何操作，也不报错
	 * @param	name - 		用户名 
	 * @throws	Exception	404，没有找到数据表
	 * @throws	Exception	409，要删除的用户不可被删除
	 * @throws	Exception	412，必选参数未赋值
	 * @throws	Exception	500，数据库操作失败
	 */
	void Del(String name) throws Exception{
		if(name.equals(""))throw new Exception("[info]412,name参数没有赋值");
		try{
			int row=dbd.check("sys_usrdb", "usrname", name);
			if(row>0){
				if(name.equals("管理员"))throw new Exception("[info]409,系统管理员用户不可删除");
				dbd.DelSQl("sys_usrdb",row,1,1);
			}
		}catch(Throwable e){
			throw new Exception(e);
		}	
	}
	
	/**
	 * 函数说明：列出当前所有用户
	 * @param  filter	用于选择项目的过滤器，由前端设定
	 * @param  page_count		分页显示时，每页显示的条数
	 * @param  page_num		分页显示时，显示的页码
	 * @return	  JSONArray格式字符串
	 * @throws Exception 500,数据库故障
	 */
	String list(String filter,String page_count,String page_num) throws Exception {
		PropertyConfigurator.configure(logconf);	
//		检查参数是否有效
		try {
			if(filter.equals(""))filter="id>0";	
			else if(filter.indexOf("like")>-1)filter=filter.replace("*", "%");
			filter=filter+" limit "+Integer.parseInt(page_count)*(Integer.parseInt(page_num)-1)+","+page_count;
			int sum_num=dbd.check("sys_usrdb");
			
			String[][] ul=dbd.readDB("sys_usrdb","id,usrname,fullname,role,email",filter);
			JSONObject Userlist=new JSONObject();
			JSONArray jas= new JSONArray();
			int num=ul.length;
			if(!ul[0][0].equals("")) {
				for(int i=0;i<num;i++) {
					JSONObject jsb=new JSONObject();
					jsb.put("id", ul[i][0]);
					jsb.put("usrname", ul[i][1]);
					jsb.put("fullname", ul[i][2]);
					jsb.put("role", ul[i][3]);
					jsb.put("email", ul[i][4]);
					jas.put(jsb);
				}
			}			
			Userlist.put("total_num", sum_num);
			Userlist.put("userlist", jas);
			Userlist.put("code", 200);
			return Userlist.toString();
		}catch(Throwable e) {
			logger.error(e.getMessage(), e);
			throw new Exception(e.getMessage());
		}		
	}

	/**
	 * 函数说明：用于获取用户的单一信息，包括全名、邮箱、手机号等
	 * @param name		要获取信息的用户名，可以是多个用户，用逗号分隔
	 * @param item				要获取的信息项目
	 * @return		单一字符串，用逗号分隔多个结果
	 */
	String GetInfo(String name) throws Exception{
		PropertyConfigurator.configure(logconf);
		try {
			String[][] usrlist=dbd.readDB("sys_usrdb", "usrname,fullname,role,email", "usrname='"+name+"'");
			if(usrlist[0][0].equals(""))throw new Throwable("[info]404,用户"+name+"不存在");
			JSONObject Userinfo=new JSONObject();
			
			Userinfo.put("name", usrlist[0][0]);
			Userinfo.put("fullname", usrlist[0][1]);
			Userinfo.put("role", usrlist[0][2]);
			Userinfo.put("email", usrlist[0][3]);
			Userinfo.put("code", 200);
			return Userinfo.toString();	
		}catch(Throwable e) {
			logger.error(e.getMessage(),e);
			throw new Exception(e);
		}
	}
	/**
	 * 函数说明：查询满足条件的用户账号
	 * @param filter	查询条件
	 * @return		JSON格式字符串，如：{"usrname":"xxxxx","code":200}
	 * @throws Exception
	 */
	String GetUserinfo(String filter) throws Exception{
		PropertyConfigurator.configure(logconf);
		try {
			JSONObject bku=new JSONObject();
			String[][] usrinfo=dbd.readDB("sys_usrdb", "usrname", filter);
			bku.put("usrname", usrinfo[0][0]);
			bku.put("code", 200);
			return bku.toString();
		}catch(Throwable e) {
			logger.error(e.getMessage(),e);
			throw new Exception(e);
		}
	}
	/**
	 * 函数说明：用于获取用户全名列表
	 * @param usrlist		要获取全名的用户名，可以是多个用户，用分号分隔
	 * @return					字符串，全名，用分号分隔多个地址
	 */
	public String getfname(String usrlist) {
		String usrmail_list="";
		String filter="usrname='"+usrlist+"'";
		if(usrlist.indexOf(",")>-1) {
			String[] usrs=usrlist.split(",");
			filter="";
			for(int i=0;i<usrs.length;i++) filter=filter+"usrname='"+usrs[i]+"' or ";
			filter=filter.substring(0, filter.lastIndexOf(" or"));
		}
		try {
			String[][] mails=dbd.readDB("sys_usrdb", "fullname", filter);
			for(int i=0;i<mails.length;i++)usrmail_list=usrmail_list+mails[i][0]+",";
			usrmail_list=usrmail_list.substring(0, usrmail_list.length()-1);
		}catch(Throwable e) {
			e.printStackTrace();			
		}
		return usrmail_list;
	}
	
	/**
	 * 函数说明：用于获取用户角色
	 * @param usrlist		要获取角色的用户名，可以是多个用户，用分号分隔
	 * @return					字符串，全名，用分号分隔多个地址
	 */
	public String getrole(String usrlist) {
		String usrmail_list="";
		String filter="usrname='"+usrlist+"'";
		if(usrlist.indexOf(",")>-1) {
			String[] usrs=usrlist.split(",");
			filter="";
			for(int i=0;i<usrs.length;i++) filter=filter+"usrname='"+usrs[i]+"' or ";
			filter=filter.substring(0, filter.lastIndexOf(" or"));
		}
		try {
			String[][] mails=dbd.readDB("sys_usrdb", "role", filter);
			for(int i=0;i<mails.length;i++)usrmail_list=usrmail_list+mails[i][0]+",";
			usrmail_list=usrmail_list.substring(0, usrmail_list.length()-1);
		}catch(Throwable e) {
			e.printStackTrace();			
		}
		return usrmail_list;
	}
	/**[Function] 					进行用户密码校验，多用于用户登录
	 * @param  name - 		用户名 
	 * @param  pwd - 			用户密码，经过加密处理
	 * @return	  int 				200普通用户，201管理员账户
	 * @throws Throwable	404 - 没有找到数据表
	 * @throws Throwable	412 - 必选参数未赋值或密码错误
	 * @throws Throwable	500 - 数据库操作失败
	 */
	public int Authority(String name,String pwd) throws Throwable{	
		int ra=200;
//		检查用户名和密码参数，必选
		if(name.equals(""))throw new Exception("[info]412,user参数没有赋值");
		if(pwd.equals(""))throw new Exception("[info]412,pwd参数没有赋值,不支持空密码");
		try{
			String[][] adm=dbd.readDB("sys_usrdb", "type,role,passwd","usrname='"+name+"'");
			if(adm[0][0].equals(""))throw new Exception("[info]404,用户不存在");
			
//			对密码进行解密
			pwd=decrypt(pwd);
//			进行鉴权认证
			if(auth(pwd,adm[0][2])) {
				ra=200;
			}
			else throw new Exception("[info]412,用户名或密码错误");			
		}catch (Throwable e){
			throw new Exception(e.getMessage());
		}
		return ra;
	}
	/**[Function] 				校验密码正确性
	 * @param Dpass		用来校验的用户密码
	 * @param Spass		数据库中用户的密文密码
	 * @return [Boolean]	返回校验结果，校验通过为True
	 */
	public Boolean auth(String Dpass, String Spass){
		boolean res=false;
		Dpass=encrypt(Dpass);
		if(Dpass.equals(Spass))res=true;
		return res;
	}
	
	/**[Function] 					修改用户信息(包括密码、全名、一级部门、二级部门、角色、邮件、手机号和用户类型)
	 * @param	name - 		用户名
	 * @param	pwd - 		密码
	 * @param	fname - 	全名(支持中文)
	 * @param	role - 		角色(目前支持admin\owner\viewer)
	 * @param	email - 		电子邮件地址
	 * @throws Throwable	404 - 没有找到数据表或者用户
	 * @throws Throwable	412 - 缺少必要参数
	 * @throws Throwable	500 - 数据库操作失败
	 */
	public void Change(String name,String pwd,String fname,String role,String email) throws Throwable{
//		检查用户名参数，必选
		if(name.equals(""))throw new Exception("[info]412,user参数没有赋值");
		try{
			if(name.equals("管理员")){
				fname="";
				role="";
			}
			int row=dbd.check("sys_usrdb", "usrname", name);
			if(!pwd.equals(""))dbd.UpdateSQl("sys_usrdb", row, "passwd", encrypt(pwd));
			if(!fname.equals(""))dbd.UpdateSQl("sys_usrdb", row, "fullname", fname); 
			if(!role.equals(""))dbd.UpdateSQl("sys_usrdb", row, "role", role);
			if(!email.equals(""))dbd.UpdateSQl("sys_usrdb", row, "email", email);
		}catch(Throwable e){
			throw e;
		}
	}
	/**[Function] 				对数据加密并返回加密后的结果，用于用户密码保存
	 * @return [String]		加密后的用户密码
	 */
	public String encrypt(String data){
		String ency="";
		char[] tcr;
		String pi="31415926535897932384626";
		char[] key=pi.toCharArray();
		int i=0;
		tcr=data.toCharArray();
		for(char a : tcr){
			tcr[i]=(char) (a+key[i]);			
			i=i+1;
		}
		ency=String.valueOf(tcr);
		return ency;
	}
	
	/**[Function] 				对加密数据进行解密并返回解密后的结果，用于用户密码传输
	 * @return [String]		解密后的用户密码
	 */
	public String decrypt(String data){
		String ency="";
		String pi="31415926535897932384626";
		char[] key=pi.toCharArray();	
		String[] num_dat=data.split(":");
		for(int i=0;i<num_dat.length;i++) {
			int asc_data=Integer.parseInt(num_dat[i]);
			int asc_pi=key[i];
			char tt=(char) (asc_data-asc_pi);
			ency=ency+tt;
		}
		return ency;
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
				if(ba.indexOf(" ")>-1)ba=ba.substring(0,ba.indexOf(" "));
			}catch(NullPointerException e){
				logger.error(e.getMessage());
			}
		}	
		return ba;
	}
}