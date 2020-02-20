const plugin = requirePlugin("WechatSI")

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

class Util{
  //返回日期字串 格式为YYYY/MM/DD HH:mi:SS
  formatTime(date){  
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
  //扫描条形码或二维码
  scanCode(onlyFromCamera=false){
    return new Promise((resolve,reject)=>{
      wx.scanCode({
          onlyFromCamera:onlyFromCamera,
          success:resolve,
          fail:reject
      })
    })
  }
  //获取网络数据
  request(option) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: option.url,
        method: option.method,
        data: option.data || {},
        success: resolve,
        fail: reject
      })
    })
  }
  //中英文互译
  translate(option){
    return new Promise((resolve,reject)=>{
      plugin.translate({
        lfrom:option.lfrom,
        lto:option.lto,
        content:option.content,
        success: function(res) {
          if (res.retcode == 0) {
            resolve(res.result)
          } else {
            console.warn("翻译失败", res)
            resolve(null)
          }
        },
        fail: function(res) {
          console.log("网络失败", res)
          reject(res)
        }
      })
    })
  }
  //语音合成播放
  speech(option){
    return new Promise((resolve,reject)=>{
      plugin.textToSpeech({
        lang: option.lang||"zh_CN",
        tts: true,
        content: option.content,
        obeyMuteSwitch: false,
        success: function (res) {
          console.log("succ tts", res.filename)
          wx.createInnerAudioContext({src:res.filename,autoplay:true})
          resolve(res)
        },
        fail: function (res) {
          console.log("fail tts", res)
          reject(res)
        }
      })
    })
  }
}
class Map{
  constructor(id){
    this.ctx = wx.createMapContext(id,this)
  }
  moveTo(option={}){
    return new Promise((resolve,reject)=>{
      this.ctx.moveToLocation({
        longitude: option.longitude || null,
        latitude: option.latitude || null,
        success: resolve,
        fail: reject
      })
    })
  }
  getLocation(option={}){
    return new Promise((resolve,reject)=>{
      wx.getLocation({
        type:option.type,
        success:resolve,
        fail:reject
      })
    })
  }
  startUpdate(option={background:true,onChange:null}){
    return new Promise((resolve,reject)=>{
      if (option.background){
        wx.startLocationUpdateBackground({
          success:(res)=>{
            wx.onLocationChange(option.onChange)
            resolve(res)
          },
          fail:reject
        })
      }else{
        wx.startLocationUpdate({
          success:(res)=>{
            wx.onLocationChange(option.onChange)
            resolve(res)
          },
          fail:reject
        })
      }
    })
  }
  stopUpdate(){
    return new Promise((resolve,reject)=>{
      wx.stopLocationUpdate({
        success:(res)=>{
          wx.offLocationChange(null)
          resolve(res)
        },
        fail:reject
      })
    })
  }
}

class Record{
  constructor(){
    this.manager = plugin.getRecordRecognitionManager()

  }
  init(cbRecognize,cbStop){
    this.manager.onRecognize = cbRecognize
    this.manager.onStop=cbStop 

  }
  startRec(option){
    this.manager.start(option)
  }
  stopRec(){
    this.manager.stop()
  }
  play(option={}){
    this.audio = wx.createInnerAudioContext(option)
    this.audio.play()
  }
  stop(){
    this.audio.stop()
  }
}
module.exports = {
  util  : new Util(),
  Map   : Map,
  record: new Record()
}
