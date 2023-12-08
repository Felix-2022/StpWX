// pages/login/login.js
var stp = require("../../utils/stp.104")
var xBlufiInit = require("../../utils/blufi/xBlufi-init")
var log = require('../../log.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xInit:false,
     phone:'',
    password:'',
    thirdId:'',//客户用户唯一标识
    thirdCode:''//客户用户鉴权码
  },

  bindPhoneInput:function(e){
    this.setData({phone,e})
  },

  bindPasswordInput:function(e){
    this.setData({password,e})
  },

  login:function(){
    let that = this
    // stp.loginEx(that.data.thirdId,that.data.thirdCode,function(data){
   stp.login(that.data.phone,that.data.password,function(data){
        log.info("succ:"+ JSON.stringify(data) +",deviceCount:"+data.mcids.length)
        if(data.mcids.length == 0){
          wx.redirectTo({
            url: '../bt_search/bt_search',
          })
        }else{
          //设置当前操作的设备，该步骤非常重要，后续跟设备有关的接口，都是查询此设备
           stp.setDeviceInfo( data.mcids[0].mcid, data.mcids[0].appId)
           wx.redirectTo({
             url: '../ai_device/ai_device',
           })
        }
     }, function(e){
      log.info("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)
      if(e.errCode == -111){
        wx.showToast({
          title: '密码错误',
          icon:'error'
        })
      }else if(e.errCode == -110){
        wx.showToast({
          title: '账号未注册',
          icon:'error'
        })
      } else {
        wx.showToast({
          title: '登录失败',
          icon:'error'
        })
      }
    })
  },

  onLoad: function (options) {
    
    if(!this.data.init){
     console.log("before initXBlufi")
      xBlufiInit.initXBlufi()
      console.log("after initXBlufi")

      this.setData({
        phone:"13552966915",
        password:"fe2bbfc9608277ab624fedc677b8a21f",
        init:true
      })
    }
    

    stp.init("aie.app",true)
    let curMcid = stp.getCurrentMcid()
    log.info("curMcid:"+curMcid)
    if(curMcid != ''){
      wx.navigateTo({
        url: '../ai_device/ai_device',
      })
    }
    log.info("before onNeedPrivacyAuthorization")

    wx.onNeedPrivacyAuthorization(resolve => {
        // 需要用户同意隐私授权时
        // 弹出开发者自定义的隐私授权弹窗
        this.setData({
          showPrivacy: true
        })
        this.resolvePrivacyAuthorization = resolve
      })
  
      wx.requirePrivacyAuthorize({
        success: () => {
          // 用户同意授权
          // 继续小程序逻辑
        },
        fail: () => {}, // 用户拒绝授权
        complete: () => {}
      })
      log.info("after onNeedPrivacyAuthorization")
  },
   
  agree(e){
    console.log("用户同意隐私授权, 接下来可以调用隐私协议中声明的隐私接口")
    // wx.getClipboardData({
    //   success(res) {
    //     console.log("getClipboardData success", res)
    //   },
    //   fail(res) {
    //     console.log("getClipboardData fail", res)
    //   },
    // })
  },
  disagree(e){
    console.log("用户拒绝隐私授权, 未同意过的隐私协议中的接口将不能调用")
  },
  onReady: function () {

  },

  onShow: function () {

  },


  onHide: function () {

  },


  onUnload: function () {

  },


  onPullDownRefresh: function () {

  },


  onReachBottom: function () {

  },


  onShareAppMessage: function () {

  }
})