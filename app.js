//app.js
App({
  onLaunch: function() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

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
    this.globalData.baseURL = "http://192.168.31.119:6001"
    this.globalData.IconAI ="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1582900534631&di=a023f2a2434f880a4dc6e49997f2f0db&imgtype=0&src=http%3A%2F%2Fg.hiphotos.baidu.com%2Fzhidao%2Fwh%253D450%252C600%2Fsign%3D952742d3a01ea8d38a777c00a23a1c78%2F0dd7912397dda1440be999dab4b7d0a20df486f2.jpg"
    this.globalData.IconSelf=""
  },
  globalData: {
    userInfo: null
  }
})