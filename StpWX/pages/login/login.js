// pages/login/login.js
var stp = require("../../utils/stp.103")
var log = require('../../log.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    this.setData({
      phone:"13552966915",
      password:"7d5546c516031e7802f13c8ecc403134"
    })

    stp.init("aie.app",true)
    let curMcid = stp.getCurrentMcid()
    log.info("curMcid:"+curMcid)
    if(curMcid != ''){
      wx.redirectTo({
        url: '../ai_device/ai_device',
      })
    }
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