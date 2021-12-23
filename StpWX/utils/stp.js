var log = require('../log.js')
let self ={
  data:{
    packageId:'',
    token:'',
    userid:'',
    mcids:null,
    mcid:'',
    appId:'',
    production:'wx',
  }
}

 
function init(packageId){
  self.data.token = wx.getStorageSync('token')
  self.data.userid =  wx.getStorageSync('userid')
  self.data.mcids = wx.getStorageSync('mcids')
  self.data.appId =  wx.getStorageSync('appId')
  self.data.mcid =  wx.getStorageSync('mcid')
  self.data.packageId = packageId

  log.info('stp.init token:'+ self.data.token +',userid:'+self.data.userid +",packageId:"+self.data.packageId)
}

function setDeviceInfo(mcid,appId){
    self.data.mcid = mcid
    self.data.appId = appId
    wx.setStorageSync('mcid', mcid)
    wx.setStorageSync('appId', appId)

    log.info("mcid:"+mcid+",appId:"+appId)
}

/* 
账号管理
*/
function login(phone,password,succ, error){
  sendRequest("https://api.aiedevice.com/robot/users/login",{"action":"login","data":{"passwd":password,"phonenum":phone,"tm":"\""+new Date().getTime()+"\"","app_package_id":self.data.packageId,"production":self.data.production}},function(data){
    self.data.token = data.token
    self.data.userid = data.userid
    self.data.mcids = data.mcids
    wx.setStorageSync('token',self.data.token)
    wx.setStorageSync('userid',self.data.userid)
    wx.setStorageSync('mcids', self.data.mcids)
    log.info("token:"+wx.getStorageSync('token')+",userid:"+wx.getStorageSync('userid')+",mcids:"+JSON.stringify(wx.getStorageSync('mcids')))
    if(!_isEmpty(succ)){
      succ(data)
    }
  },error)
}

/* 
账号管理
*/
function loginEx(thirdId,thirdCode,succ, error){
  sendRequest("https://api.aiedevice.com/robot/users/login",{"action":"login","data":{"thirdCode":thirdCode,"phonenum":thirdId,"tm":"\""+new Date().getTime()+"\"","app_package_id":self.data.packageId,"production":self.data.production}},function(data){
    self.data.token = data.token
    self.data.userid = data.userid
    self.data.mcids = data.mcids
    wx.setStorageSync('token',self.data.token)
    wx.setStorageSync('userid',self.data.userid)
    wx.setStorageSync('mcids', self.data.mcids)
    log.info("token:"+wx.getStorageSync('token')+",userid:"+wx.getStorageSync('userid')+",mcids:"+JSON.stringify(wx.getStorageSync('mcids')))
    if(!_isEmpty(succ)){
      succ(data)
    }
  },error)
}
function logout(){
  sendRequest("https://api.aiedevice.com/robot/users/logout",{"action":"logout","data":{"app_package_id":self.data.packageId,"appid":self.data.appId,"mainctl":self.data.mcid,"myid":self.data.userid,"production":self.data.production,"token":self.data.token}},null,null)
  clearLoginData()
}

/* 
设备管理
*/
function getDeviceBindResult(succ, error) {
  sendRequest("https://api.aiedevice.com/robot/users/custom",{"action":"mc/getWifiResult","data":{"app_package_id":self.data.packageId,"appid":self.data.appId,"mainctl":self.data.mcid,"myid":self.data.userid,"from":self.data.userid,"production":self.data.production,"token":self.data.token}},succ,error)
}

function getDeviceList(succ, error){
  sendRequest("https://api.aiedevice.com/robot/users/getbindmcs",{"action":"getmclist","data":{"app_package_id":self.data.packageId,"appid":self.data.appId,"mainctl":self.data.mcid,"myid":self.data.userid,"production":self.data.production,"token":self.data.token}},succ,error)
}

function getDeviceDetail(succ, error) {
    sendRequest("https://api.aiedevice.com/robot/mainctrls/mctlgetter",{"action":"detail","data":{"app_package_id":self.data.packageId,"appid":self.data.appId,"mainctl":self.data.mcid,"myid":self.data.userid,"production":self.data.production,"token":self.data.token}},succ,error)
}

function getDeviceHardwareInfo(succ, error) {
  sendRequest("https://api.aiedevice.com/robot/mainctrls/mctlgetter",{"action":"puddinfo","data":{"app_package_id":self.data.packageId,"appid":self.data.appId,"mainctl":self.data.mcid,"myid":self.data.userid,"production":self.data.production,"token":self.data.token}},succ,error)
}

function changeDeviceVolume(volume,succ, error) {
  sendRequest("https://api.aiedevice.com/robot/mainctrls/mctlcmd",{"action":"VoiceServer/changeMasterVolume","data":{"app_package_id":self.data.packageId,"appid":self.data.appId,"mainctl":self.data.mcid,"myid":self.data.userid,"production":self.data.production,"token":self.data.token,"volume":volume}},succ,error)
}

function updateDeviceName(name,succ,error) {
  sendRequest("https://api.aiedevice.com/robot/mainctrls/mctlinfo",{"action":"mctlname","data":{"app_package_id":self.data.packageId,"appid":self.data.appId,"mainctl":self.data.mcid,"myid":self.data.userid,"production":self.data.production,"token":self.data.token,"newname":name}},succ,error)
}

function deleteDevice(succ,error) { 
  sendRequest("https://api.aiedevice.com/robot/mainctrls/mcbind",{"action":"delmctl","data":{"app_package_id":self.data.packageId,"appid":self.data.appId,"mainctl":self.data.mcid,"myid":self.data.userid,"production":self.data.production,"token":self.data.token}},succ,error)
}

function uploadDeviceLog(succ,error) {
  sendRequest("https://api.aiedevice.com/robot/mainctrls/mctlcmd",{"action":"upload-local-log","data":{"app_package_id":self.data.packageId,"appid":self.data.appId,"mainctl":self.data.mcid,"myid":self.data.userid,"production":self.data.production,"token":self.data.token}},succ,error)
}

/* 
图书/加油包管理
*/
 
function getAllBookList(from,size,succ,error) {
  sendRequest("https://api.aiedevice.com/robot/app/book-list",{"from":from,"size":size,"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)
}

function searchBook(keyword,succ,error) {
  sendRequest("https://api.aiedevice.com/robot/app/book-list",{"from":0,"size":20,"name":keyword,"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)
}

function getDeviceBookList(from,size,succ,error) {
  sendRequest("https://api.aiedevice.com/robot/app/device/book-list",{"from":from,"size":size,"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)
}

function getBookDetail(mid,succ,error) {
  sendRequest("https://api.aiedevice.com/robot/app/book-info",{"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid,"mid":mid},succ,error)
}

function downloadBook(mid,succ,error) {
  sendRequest("https://api.aiedevice.com/robot/app/add-book-download",{"mid":mid,"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)
}

function deleteDeviceBook(mid,succ,error) {
  sendRequest("https://api.aiedevice.com/robot/app/del-book-download",{"mid":mid,"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)  
}

function deleteDeviceBookArray(mids,succ,error) {
  sendRequest("https://api.aiedevice.com/robot/app/del-book-download",{"mids":mids,"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)  
}

function getAllReadingPackage(from,size,succ,error) {
  sendRequest("https://api.aiedevice.com/robot/app/package-list",{"from":from,"size":size,"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)  
}

function getDeviceReadingPackage(from,size,succ,error) {
  sendRequest("https://api.aiedevice.com/robot/app/device/package-list",{"from":from,"size":size,"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)
}

/*学习报告*/
function getReadBookList(from,size,succ,error) {
  sendRequest("https://api.aiedevice.com/interact/report/book-list",{"from":from,"size":size,"withDetail":0,"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)
}

function getReadBookListByDate(startDate,endDate,succ,error) {
  sendRequest("https://api.aiedevice.com/interact/report/book-list",{"start":startDate,"end":endDate,"withDetail":0,"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)
}

function getReportList(type,from,size,succ,error) {
  sendRequest("https://api.aiedevice.com/interact/report/list",{"type":type,"from":from,"size":size,"withDetail":1,"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)
}

function getReportListByDate(type,startDate,endDate,succ,error) {
  sendRequest("https://api.aiedevice.com/interact/report/list",{"type":type, "start":startDate,"end":endDate,"withDetail":1,"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)
}

/**
 * 学习报告，按日期查询
 * @param {String}type 点读详情 point-reading  跟读详情 follow-reading  
 * @param {String} startDate 开始时间 'yyyy-MM-dd' 
 * @param {String} endDate 结束时间 'yyyy-MM-dd'
 * @param succ data{total:0,[{day:'2021-01-01',value:2}]}
 * @param error e{errCode:e.data.result,errMsg:e.data.msg}
 */
function getReportTrend(type,startDate,endDate,succ,error) {
  sendRequest("https://api.aiedevice.com/interact/report/trend",{"type":type, "start":startDate,"end":endDate,"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)
}

/**
 * 获取当前选中点读笔存储卡空间信息
 * @param succ data{total:0,[{day:'2021-01-01',value:2}]}
 * @param error e{errCode:错误码,errMsg:错误描述}
 */
function getDeviceStorage(succ,error) {
  sendRequest("https://api.aiedevice.com/robot/app/device/mem-info",{"appId":self.data.appId,"app_package_id":self.data.packageId,"clientId":self.data.mcid,"token":self.data.token,"userId":self.data.userid},succ,error)
}


function sendRequest(url, data, succ, error){
  log.info("request url:"+ url);
  log.info("request data:"+JSON.stringify(data) );

  wx.getNetworkType({
    success: (result) => {},
  })
  wx.getNetworkType({
    success: (result) => {
      if(result.networkType != 'none'){
        wx.request({
          url: url,
          data: data,
          header: {
            'Content-Type': 'application/json'
          },
          method: "POST",
          success: function(e) {
            log.info("response:"+JSON.stringify(e))
            if (!_isEmpty(succ)) {
              var result = e.data.result
              var rc = e.data.rc
              if(result == 0 || rc == 0){
                succ(e.data.data);
              }else{
                if (!_isEmpty(error)) {
                  if(e.data.result == -102){
                    wx.showToast({
                      title: '该账号已在其他设备登录',
                      icon:'error'
                    })
                    clearLoginData()
                    wx.redirectTo({
                      url: '../login/login',
                    })
                  }else{
                    error({errCode:e.data.result,errMsg:e.data.msg});
                  }
                }
              }
            }
          },
          fail: function(e) {
            if (!_isEmpty(error)) {
              error({errCode:-1,errMsg:JSON.stringify(e)});
            }
          }
        })
      }
    },
  })
}

function getCurrentMcid(){
  return self.data.mcid
}

function clearLoginData() {
  log.info('clearLoginData')
  self.data.token = ''
  self.data.mcids = null
  self.data.userId = ''
  self.data.mcid = ''
  self.data.appId = ''

  wx.setStorageSync('token','')
  wx.setStorageSync('userid','')
  wx.setStorageSync('mcids',null)
  wx.setStorageSync('appId','')
  wx.setStorageSync('mcid','')
}



const _isEmpty = str => {
  if (str === "" || str === null || str === undefined || str === "null" || str === "undefined") {
    return true;
  } else {
    return false;
  }
}


module.exports = {
 init,
 login,
 loginEx,
 setDeviceInfo,
 getDeviceList,
 getCurrentMcid,
 getDeviceDetail,
 changeDeviceVolume,
 updateDeviceName,
 deleteDevice,
 uploadDeviceLog,
 getAllBookList,
 searchBook,
 getDeviceBookList,
 getBookDetail,
 downloadBook,
 deleteDeviceBook,
 deleteDeviceBookArray,
 getAllReadingPackage,
 getDeviceReadingPackage,
 getReadBookList,
 getReadBookListByDate,
 getReportList,
 getReportListByDate,
 getDeviceBindResult,
 getReportTrend,
 getDeviceStorage,
 getDeviceHardwareInfo,
 logout
};