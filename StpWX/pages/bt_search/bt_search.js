const app = getApp()
var xBlufi = require("../../utils/blufi/xBlufi.js");
var log = require('../../log.js')
let _this = null;

Page({
  data: {
    devicesList: [],
    searching: false,
  },
  onLoad: function() {
    _this = this;
    log.info("xBlufi", xBlufi.XMQTT_SYSTEM)
    xBlufi.listenDeviceMsgEvent(true, this.funListenDeviceMsgEvent);
  },

  funListenDeviceMsgEvent: function(options) {
    switch (options.type) {
      case xBlufi.XBLUFI_TYPE.TYPE_GET_DEVICE_LISTS:
        if (options.result)
          _this.setData({
            devicesList: options.data
          });
        break;

  
      case xBlufi.XBLUFI_TYPE.TYPE_GET_DEVICE_LISTS_START:
        if (!options.result) {
          log.info("蓝牙未开启"+JSON.stringify(options.data))
          if(options.data.errno == 1509008){
            wx.showToast({
                title: '未授权地理位置权限',
                icon: 'none'
            })
          }else{
            wx.showToast({
                title: '蓝牙未开启',
                icon: 'none'
            })
          }
        } else {
          //蓝牙搜索开始
          _this.setData({
            searching: true
          });
        }
        break;

      case xBlufi.XBLUFI_TYPE.TYPE_GET_DEVICE_LISTS_STOP:
        if (options.result) {
          //蓝牙停止搜索ok
          log.info('蓝牙停止搜索ok')
        } else {
          //蓝牙停止搜索失败
          log.info('蓝牙停止搜索失败')
        }
        _this.setData({
          searching: false
        });
        break;

    }
  },
  Search: function() {
    log.info("Search this.data.searching:"+this.data.searching)
    if (this.data.searching) {
      xBlufi.notifyStartDiscoverBle({
        'isStart': false
      })
    } else {
      xBlufi.notifyStartDiscoverBle({
        'isStart': true
      })
    }
  },
  Connect: function(e) {
    //停止搜索
    xBlufi.notifyStartDiscoverBle({
      'isStart': false
    })
    for (var i = 0; i < _this.data.devicesList.length; i++) {
      if (e.currentTarget.id === _this.data.devicesList[i].deviceId) {
         let name = _this.data.devicesList[i].name
   

        wx.redirectTo({
          url: '../bt_device/bt_device?deviceId=' + e.currentTarget.id + '&name=' +name,
        });
      }
    }
  },

  onUnload: function() {
    xBlufi.listenDeviceMsgEvent(false, this.funListenDeviceMsgEvent);
  }
});