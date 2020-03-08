const app = getApp()
Page({
  data:{
    index:1,
    picker: ['早餐', '午餐', '晚餐','加餐'],
    region: ["福建省","厦门市","湖里区"],
    stepItems: ["开始","手机验证","身份证验证","人证验证"],
    address:app.globalData.address
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
  onLoad(){
    this.setData({baseURL:app.globalData.baseURL})
  }
})