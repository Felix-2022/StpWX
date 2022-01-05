// pages/ai_device/ai_device.js
var stp = require("../../utils/stp.104")
var log = require('../../log.js')
var that = this
//音量档位
var volumeLevels =[50,55,65,75,85,90,100]
let testBookId ="YWlyZXM6MjU3NzIzMg"
let startDate = '2021-12-20'
let endDate = '2021-12-31'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    devicesList:[],
    selectedIndex:0,
    deviceInfo:null,
    newName:'',
  },

  onLoad: function (options) {
    this.refreshDeviceList()
  },
 
  onPullDownRefresh: function () {

  },


  /**
   * 切换设备
   */
  changeDevice:function (e) {
    let index = e.currentTarget.dataset.index
    log.debug("change device to:"+e.currentTarget.id)
    this.setData({
      selectedIndex:index,
      deviceInfo:this.data.devicesList[index]
    })
    stp.setDeviceInfo(this.data.devicesList[index].mcid,this.data.devicesList[index].appId)
  },

  /**
   * 修改设备名称
   */
  changeDeviceName:function() {
    stp.updateDeviceName(this.data.newName,(data) =>{
        wx.showToast({
          title: '操作成功',
          icon:'success'
        })
        this.refreshDeviceList()
    },(e)=> {
      wx.showToast({
        title: '操作失败',
        icon:'error'
      })
      log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
     })
  },
 
  bindPasswordInput :function(e) {
    this.setData({
      newName:e.detail.value
    })
    log.debug("bindPasswordInput value:"+this.data.newName)
  },
 
  /**
   * 读取绑定设备列表
   */
  refreshDeviceList:function (){
    wx.showLoading({
      mask:true
    })
    stp.getDeviceList(data=>{
      wx.hideLoading()
      if(data.mcids != null && data.mcids.length >0){
        this.setData({
          devicesList:data.mcids,
          deviceInfo:data.mcids[0]
        })
        stp.setDeviceInfo(data.mcids[0].mcid, data.mcids[0].appId)
        log.debug("bind device count:"+ this.data.devicesList.length)
      }else{
        this.setData({
          devicesList:null,
          deviceInfo:null,
          selectedIndex : 0,
        })
        wx.redirectTo({
          url: '../bt_search/bt_search',
        })
      }
    },e=>{
      log.debug(JSON.stringify(e))
    })
  },


  /**
   * 点读笔配网（绑定新点读笔）
   */
  bindDevice :function(){
    log.debug("bindDevice")
    wx.navigateTo({
      url: '../bt_search/bt_search',
    })
  },

  
  /**
   * 获取设备详情
   */
  getDeviceDetail:function(){
    log.debug("getDeviceDetail")
    stp.getDeviceDetail(data=>{
      
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
      log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  getDeviceHardwareInfo:function(){
    log.debug("getDeviceHardwareInfo")
    stp.getDeviceHardwareInfo(data=>{
      
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
      log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  /**
   * 音量+1级
   */
  volumeUp:function(){
    let newLevel= this.getVolumeLevel(this.data.deviceInfo.volume) +1;
    if(newLevel >=volumeLevels.length){
      newLevel = volumeLevels.length-1
    }
    let newVolume = volumeLevels[newLevel];
    log.debug("volumeUp newLevel:"+newLevel+",newVolume:"+newVolume)
    this.data.deviceInfo.volume = newVolume
    stp.changeDeviceVolume(newVolume,data=>{
      wx.showToast({
        title: '修改成功',
        icon:'success'
      })
    },e=>{
      log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
      if(e.errCode == -81 || e.errCode == 300){
        wx.showToast({
          title: '设备未联网',
          icon:'error'
        })
      }
    })
  },  

  /**
   * 音量-1级
   */
  volumeDown:function(){
    let newLevel= this.getVolumeLevel(this.data.deviceInfo.volume) -1;
    if(newLevel <0){
      newLevel = 0
    }
    let newVolume = volumeLevels[newLevel];
    log.debug("volumeUp newLevel:"+newLevel+",newVolume:"+newVolume)
    this.data.deviceInfo.volume = newVolume
    stp.changeDeviceVolume(newVolume,data=>{
      wx.showToast({
        title: '修改成功',
        icon:'success'
      })
    },e=>{
      log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
      if(e.errCode == -81 || e.errCode == 300){
        wx.showToast({
          title: '设备未联网',
          icon:'error'
        })
      }
    })
  },  
  
  /**
   * 获取音量等级
   * @param {*} volume 音量数值
   */
  getVolumeLevel:function(volume){
    for(let i = 0;i<volumeLevels.length;i++){
      if (volume <= volumeLevels[i]) {
        return i
      }
    }
    return volumeLevels.length-1
  },

  /**
   * 上传点读笔日志到服务器
   */
  uploadLog:function () {
    stp.uploadDeviceLog(data=>{
      wx.showToast({
        title: '修改成功',
        icon:'success'
      })
    },e=>{
      log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg) 
      if(e.errCode == -81 || e.errCode == 300){
        wx.showToast({
          title: '设备未联网',
          icon:'error'
        })
      }  
    })
  },

/**
   * 解绑
   */
  unbind:function () {
    log.debug("unbind")
    stp.deleteDevice(data=>{
      wx.showToast({
        title: "解绑成功" ,
      })
      this.refreshDeviceList()
    },e=>{
      log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  /**
   * 获取全部绘本
   */
  getAllBookList:function(){
    stp.getAllBookList(0,10,data=>{
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  /**
   * 关键字搜索绘本
   */
  searchBook:function(){
    stp.searchBook("abc",data=>{
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },


  /**
   * 设备内绘本
   */
  getDeviceBookList:function(){
    stp.getDeviceBookList(0,20,data=>{
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  /**
   * 获取绘本详情
   */
  getBookDetail:function(){
    stp.getBookDetail(testBookId,data=>{
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  /**
   * 按绘本/点读包id，让点读笔下载资源
   */
  downloadBook:function(){
    stp.downloadBook(testBookId,data=>{
      wx.showToast({
        title: '操作成功',
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  /**
   * 按绘本/点读包id，让点读笔删除已下载资源
   */
  deleteDeviceBook:function(){
    stp.deleteDeviceBook(testBookId,data=>{
      wx.showToast({
        title: '操作成功',
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  /**
   * 按绘本/点读包id数组，让点读笔删除已下载资源
   * 最大长度10
   */
  deleteDeviceBookArray:function(){
    stp.deleteDeviceBookArray([testBookId],data=>{
      wx.showToast({
        title: '操作成功',
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  /**
   * 获取当前选中点读笔存储卡空间信息
   */
  getDeviceStorage:function(){
    stp.getDeviceStorage(data=>{
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

    /**
   * 获取当前选中点读笔存储卡空间信息
   */
  getAllReadingPackage:function(){
    stp.getAllReadingPackage(data=>{
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

    /**
   * 获取当前选中点读笔存储卡空间信息
   */
  getDeviceReadingPackage:function(){
    stp.getDeviceReadingPackage(data=>{
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  /**
   * 获取阅读的绘本列表，按分页查询
   */
  getReadBookList:function(){
    stp.getReadBookList(0,10,data=>{
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  /**
   * 获取阅读的绘本列表，按日期查询
   */
  getReadBookListByDate:function(){
    stp.getReadBookListByDate(startDate,endDate,data=>{
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  /**
   * 趋势报告
   * type:
   * "point-reading"(点读次数)
   * "follow-reading"(跟读次数)
   * "duration"(学习时长)
   * "pic-book"(阅读绘本数)
   */
  getReportTrend:function(){
    let type = "duration"
    stp.getReportTrend(type,startDate,endDate,data=>{
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },  

  /**
   * 学习报告，按分页查询
   * "follow-reading"(跟读详情)
   */
  getReportList:function(){
    let type = "follow-reading"
    stp.getReportList(type,0,10,data=>{
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  
  /**
   * 学习报告，按日期查询
   * "follow-reading"(跟读详情)
   * 
   */
  getReportListByDate:function(){
    stp.getReportListByDate("follow-reading",startDate,endDate,data=>{
      wx.showToast({
        title: "请求成功" ,
        icon:'success'
      })
    },e=>{
        log.debug("fail errCode:"+e.errCode+",errMsg:"+e.errMsg)   
    })
  },

  logout:function(){
    stp.logout()
    wx.redirectTo({
      url: '../login/login',
    })
  }
})


