const app = getApp()
const util = require("../../utils/util.js").util
Page({
  data:{
    index:1,
    picker: ['早餐', '午餐', '晚餐','加餐'],
    region: ["福建省","厦门市","湖里区"],
    stepItems: ["开始","手机验证","身份证验证","人证验证"],
    address:app.globalData.address,
    baseURL: ["nothing","http://10.10.0.199:5000", "http://192.168.31.119:6001"]
  },
  _onChange(e){
    console.log("changed!!!!",e.detail)
  },
  _onNext(e){
    var steps=this.selectComponent("#steps")
    steps.scrollSteps()
  },
  _onTest(e){
    //测试小程序之间跳转
    console.log("onTest")
    wx.navigateToMiniProgram({
      appId: "wxdc03b02a8c326536",
      path: 'pages/index/index',
      success(res) {
        // 打开成功
        console.log(res)
      }
    })
  },
  async onLoad(){
    try{
      let baseURL  = await util.getStorage("baseURL")
      console.log("!!!!",baseURL)
      let index  = this.data.baseURL.indexOf(baseURL)
      if (index==-1) index=1
      this.setData({baseURLIndex:index})
      app.changeBaseURL(this.data.baseURL[index])
    }catch(err){
      this.setData({baseURLIndex:2})
      util.setStorage("baseURL","http://192.168.31.119:6001")
    }
  },
  _onChangeBaseURL(e) {
    let index = e.detail.index
    app.changeBaseURL(this.data.baseURL[index])
    util.setStorage("baseURL", this.data.baseURL[index])
  }
})