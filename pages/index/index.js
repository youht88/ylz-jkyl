//index.js
//获取应用实例
const app = getApp()
const util=require('../../utils/util.js').util
const Map = require("../../utils/util.js").Map
var map
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Page: app.globalData.Page,
    motto: 'Hi 开发者！',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  ////////////测试获得步行数据//////////////
  _getWeRunData(){
    wx.login({
      success:(res)=>{
        console.log("login:",res)
      }
    }) 
    wx.getWeRunData({
      success:(res)=>{
        console.log("getWeRunData:",res)
      }
    })  
  },
  ///////////定位到当前特定位置
  _onMoveTo(event) {
    map.moveTo().then(res => {
      console.log(res)
    }).catch((error) => {
      console.log(error)
    })
  },
  _startUpdateMap() {
    map.startUpdate({
      onChange: (res) => {
        console.log(res.latitude, res.longitude)
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
      }
    }).then((res) => {
      console.log("start update map")
    })
  },
  _stopUpdateMap() {
    map.stopUpdate().then((res) => {
      console.log("stop update map")
    })
  },
  //////////////////////////
  //事件处理函数
  onLoad: function () {
    map = new Map("map")
    this._onMoveTo()
    console.log("wx.env.USER_DATA_PATH:",wx.env.USER_DATA_PATH)
    this.doTest()
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  doTest(){
    
  }
})
