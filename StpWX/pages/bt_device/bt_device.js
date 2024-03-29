var xBlufi = require("../../utils/blufi/xBlufi.js");
var base64 = require('../../utils/blufi/crypto/lib/base64-js')
var log = require('../../log.js')
var stp = require("../../utils/stp.104");
const { _isEmpty } = require("../../utils/blufi/util.js");

function strToUint8(str){
  for (var i = 0,arr=[]; i < str.length;i++){
    arr.push(str.charCodeAt(i));
  }
  return new Uint8Array(arr);
}
Page({
  data: {
    version: '2.0',
    name: '',
    connectedDeviceId: '',
    connecting: false,
    deviceInfo: null,
    isInitOK: false,
    password: '',
    customData: '',
    waitTimes:0,
    connectSucc:false,
  },
  onShow: function(options) {
    this.initWifi()
  },
  onLoad: function(options) {
    var that = this
    this.initWifi()
    that.setData({
      name: options.name,
      connectedDeviceId: options.deviceId,
    })
    xBlufi.listenDeviceMsgEvent(true, this.funListenDeviceMsgEvent);
   
  },
  onUnload: function() {
    log.info("unload ")
    let that = this
    xBlufi.notifyConnectBle({
      isStart: false,
      deviceId: that.data.connectedDeviceId,
      name: that.data.name,
    });

    xBlufi.listenDeviceMsgEvent(false, this.funListenDeviceMsgEvent);
  },
  funListenDeviceMsgEvent: function(options) {
    let that = this
    switch (options.type) {
      case xBlufi.XBLUFI_TYPE.TYPE_STATUS_CONNECTED:
        log.info("BlueTooth device connected")

        break;
        case xBlufi.XBLUFI_TYPE.TYPE_CONNECTED:
          log.info("连接回调：" + JSON.stringify(options))
          if (options.result) {
            xBlufi.notifyInitBleEsp32({
              deviceId: this.data.connectedDeviceId,
            })
         
          } else {
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: '蓝牙连接已断开',
              showCancel: false
            });
          }
          break;
      case xBlufi.XBLUFI_TYPE.TYPE_CONNECT_ROUTER_RESULT:
        wx.hideLoading();
        if (!options.result)
          wx.showModal({
            title: '温馨提示',
            content: '配网失败，请重试',
            showCancel: false, //是否显示取消按钮
          })
        else {
          if (options.data.progress == 100) {
            let ssid = options.data.ssid;
            wx.showModal({
              title: '温馨提示',
              content: `连接成功路由器【${options.data.ssid}】`,
              showCancel: false, //是否显示取消按钮
              success: function(res) {
                wx.setStorage({
                  key: ssid,
                  data: that.data.password
                })
                //判断是否为空
                if (that.data.customData)
                  //开始发送自定义数据，此方法可以在蓝牙连接esp设备之后，随时随地调用！
                  xBlufi.notifySendCustomData({
                    customData: that.data.customData,
                  })
              },
            })
          }
        }
        break;
      case xBlufi.XBLUFI_TYPE.TYPE_RECIEVE_CUSTON_DATA:
        log.info("收到设备发来的自定义数据结果：", (options.data))
        wx.showModal({
          title: '收到自定义设备数据',
          content: `【${options.data}】`,
          showCancel: false, //是否显示取消按钮
        })
        break;
      case xBlufi.XBLUFI_TYPE.TYPE_INIT_ESP32_RESULT:
        log.info("初始化结果：", JSON.stringify(options))
        if (options.result) {
          log.info('初始化成功')
          const password = `v1#${this.data.password}#${stp.getStpUserId()}#${new Date().getTime()/1000}#`
          var ssid = String(base64.fromByteArray(strToUint8(this.data.ssid))) 
          log.info('开始配网:'+password)
          
          xBlufi.notifySendRouterSsidAndPassword({
            ssid:ssid,
            password:password
          })
          this.setData({
            connecting:true
          })
          this.checkBindResult();
        } else {
          wx.hideLoading();
          log.info('初始化失败')
         
          wx.showModal({
            title: '温馨提示',
            content: `设备初始化失败`,
            showCancel: false, //是否显示取消按钮
            success: function(res) {
              wx.redirectTo({
                url: '../search/search'
              })
            }
          })
        }
        break;
    }
  },
  OnClickStart: function() {

    if (!this.data.ssid) {
      wx.showToast({
        title: 'SSID不能为空',
        icon: 'none'
      })
      return
    }
   
    if (!this.data.password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return;
    }

    wx.showLoading({
      title: '正在配网',
      mask: true
    })
    log.info("notifyConnectBle")
    xBlufi.notifyConnectBle({
      isStart: true,
      deviceId: this.data.connectedDeviceId,
      name:this.data.name
    });

  },

  checkBindResult:function() {
    var maxwait = 15//超时次数
    var newwait = this.data.waitTimes + 1//执行的次数

    if (newwait >= maxwait && !this.data.connectSucc && this.data.connecting) {
     //超时了
      log.info('配网超时')
      wx.showToast({
        title: '配网失败',
        icon:'error'
      })
      this.setData({
        connecting:false
      })
    }else {

      if(this.data.connectSucc){
        log.info('配网成功')
        this.setData({
          waitTimes :0,
          connectSucc:false
        })
        wx.showToast({
          title: '配网成功',
          icon:'success'
        })
        this.setData({
          connecting:false
        })
        wx.redirectTo({
          url: '../ai_device/ai_device',
        })
      }else{
        if(!this.data.connecting){
          log.info("connect wifi is over")
          return;
        }
        stp.getDeviceBindResult(data=>{
          if(data.isBinded){
            wx.hideLoading();
            this.setData({
              connectSucc:true
            })
            log.info('绑定SN：'+JSON.stringify(data)+"成功")
          }else{
            this.setData({
              connectSucc:false
            })
            if(_isEmpty(data.bindtel)){
              wx.showToast({
                title: '非该渠道点读笔',
                icon:'error'
              })
              log.info('绑定失败,非该渠道点读笔')
            }else{
              wx.showToast({
                title: '他人已绑定',
                icon:'error'
              })
              log.info('绑定失败,该设备已被'+data.bindtel+"绑定")
            }
            setTimeout(()=>{
              wx.redirectTo({
                url: '../bt_search/bt_search',
              })
            },2000)
          }
  
          this.setData({
            connecting:false
          })
        },e=>{
          log.info("getDeviceBindResult.error:"+JSON.stringify(e))
        })
        setTimeout(this.checkBindResult,2000)
        log.info('第'+newwait+'次轮询中...')
        this.setData({waitTimes : newwait})
      }
    }
  },
  bindPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    })
  },
  bindCustomDataInput: function(e) {
    this.setData({
      customData: e.detail.value
    })
  },
  initWifi() {
    let that = this
    wx.startWifi();
    wx.getConnectedWifi({
      success: function(res) {
        if (res.wifi.SSID.indexOf("5G") != -1) {
          wx.showToast({
            title: '当前为5G网络',
            icon: 'none',
            duration: 3000
          })
        }

        let password = wx.getStorageSync(res.wifi.SSID)
        log.info("password=>", password)
        that.setData({
          ssid: res.wifi.SSID,
          isInitOK: true,
          password: password==undefined ? "" : password
        })
      },
      fail: function(res) {
        log.info(res);
        that.setData({
          ssid: null,
          isInitOK: false
        })
      }
    });
  }


})