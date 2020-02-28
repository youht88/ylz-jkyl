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
  //交互
  showToast(title,icon){
    wx.showToast({title,icon})
  }
  showModal(title,content){
    return new Promise((resolve,reject)=>{
      wx.showModal({
        title:title,
        content:content,
        success:(res)=>{
          if (res.confirm){
            resolve(true)
          }else{
            resolve(false)
          }
        },
        fail:reject
      })
    })
  }
  showActionSheet(itemList){
    return new Promise((resolve,reject)=>{
      wx.showActionSheet({
        itemList: itemList,
        success: (res)=>{
          resolve(res.tapIndex)
        },
        fail:(res)=>{
          reject(res.errMsg)
        }
      })
    })
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
  takePhoto(){
    console.log("takePhoto is begin")
    return new Promise((resolve,reject)=>{
      const ctx = wx.createCameraContext()
      console.log("ctx:",ctx)
      ctx.takePhoto({
        quality: 'high',
        success: resolve,
        fail:reject
      })
    }) 
  }
  //storage
  setStorage(key,value) {
    return new Promise((resolve, reject) => {
      try{
        let data = JSON.stringify(value)
        wx.setStorage({
          key: key,
          data:data,
          success: resolve,
          fail: reject
        })
      }catch(e){
        reject(e)
      }
    })
  }
  getStorage(key) {
    return new Promise((resolve, reject) => {
      try{
        wx.getStorage({
          key: key,
          success: (res)=>{
            resolve(JSON.parse(res.data))
          },
          fail: reject
        })
      }catch(e){
        reject(e)
      }
    })
  }
  getStorageInfo() {
    return new Promise((resolve, reject) => {
      wx.getStorageInfo({
        success: (res) => resolve(res),
        fail: reject
      })
    })
  }
  clearStorageInfo() {
    return new Promise((resolve, reject) => {
      wx.clearStorageInfo({
        success: (res) => resolve(res),
        fail: reject
      })
    })
  }
  removeStorage(key) {
    return new Promise((resolve, reject) => {
      wx.removeStorage({
        key : key,
        success: resolve,
        fail: reject
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
  downloadFile(option,pgComponent,key){
    //pgComponent是一个progress组件，key为该组件反应进度指标（0-100）的值
    return new Promise((resolve,reject)=>{
      var task = wx.downloadFile(
        {
          url:option.url,
          filePath:option.filePath,
          success:resolve,
          failt:reject
        }
      )
      if (!pgComponent) return
      task.onProgressUpdate((res)=>{
        pgComponent.setData({ show: true, [key]: res.progress })
        if (res.progress==100){
          setTimeout(()=>{
            pgComponent.setData({show:false,[key]:0})
          },500)
        }
      })
    })
  }
  uploadFile(option,pgComponent,key){
    //pgComponent是一个progress组件，key为该组件反应进度指标（0-100）的值
    return new Promise((resolve, reject) => {
      var task = wx.uploadFile(
        {
          url: option.url,
          filePath: option.filePath,
          header:{"content-type":"multipart/form-data"},
          name:option.name,
          formData:option.formData,
          success: resolve,
          failt: reject
        }
      )
      if (!pgComponent) return
      task.onProgressUpdate((res) => {
        pgComponent.setData({ show: true, [key]: res.progress })
        if (res.progress == 100) {
          setTimeout(() => {
            pgComponent.setData({ show: false, [key]: 0 })
          }, 500)
        }
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
          wx.createInnerAudioContext({src:encodeURI(res.filename),autoplay:true})
          wx.playVoice({
            filePath:encodeURI(res.filename)
          })
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
  Record: Record
}
