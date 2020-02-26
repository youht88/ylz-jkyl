Page({
  data:{
    index:1,
    picker: ['早餐', '午餐', '晚餐','加餐'],
    region: ["福建省","厦门市","湖里区"],
    stepItems: ["开始","手机验证","身份证验证","人证验证"]
  },
  _onChange(e){
    console.log("changed!!!!",e.detail)
  },
  _onNext(e){
    var steps=this.selectComponent("#steps")
    steps.scrollSteps()
  }
})