//app.js
const SMcrypto = require("/utils/smcrypto.js").SMcrypto
const crypto = new SMcrypto()
const util = require("/utils/util.js").util
App({
  onLaunch: function() {
    // 本地密钥体系
    console.log("keys:",crypto)
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    // 获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
         	this.globalData.Custom = capsule;
        	this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
        	this.globalData.CustomBar = e.statusBarHeight + 50;
        }
        this.globalData.Page=e.windowHeight - e.statusBarHeight - this.globalData.CustomBar
        console.log(this.globalData)
      }
    })
    //设置程序属性
    //this.globalData.baseURL="http://web1.imac1.youht.cc:8084"
    //this.globalData.baseURL = "http://192.168.31.119:6001"
    //this.globalData.baseURL = "http://10.10.0.199:5000"
    util.getStorage("baseURL").then(x=>{
      this.globalData.baseURL = x
    })
    this.globalData.IconAnimal ="https://dss1.bdstatic.com/6OF1bjeh1BF3odCf/it/u=4064283291,520199009&fm=74&app=80&f=JPEG&size=f121,90?sec=1880279984&t=b24f80de85ff357047609f47d65dc3b3"
    this.globalData.IconGirl ="http://pics.sc.chinaz.com/Files/pic/icons128/rw_7/Vivian%20Chow.png"
    this.globalData.IconSelf = "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1582012008723&di=0313c52d1339be9920becb023c7cb9d2&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201609%2F29%2F20160929122645_QwZfR.thumb.700_0.jpeg"

    this.globalData.crypto = crypto
    this.globalData.address = crypto.exportAddress()
  },
  globalData: {
    userInfo: null
  },
  changeBaseURL(baseURL){
    this.globalData.baseURL=baseURL
  }
})