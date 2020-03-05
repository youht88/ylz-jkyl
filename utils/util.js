const plugin = requirePlugin("WechatSI")
const _ = require("underscore")
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

class Util{
  constructor(){
    wx.setInnerAudioOption({
      mixWithOther: true,
      obeyMuteSwitch: false,
    })
  }
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
  //clipboard
  async setClipboardData(data){
    return new Promise((resolve,reject)=>{
      wx.setClipboardData({
        data: data,
        success: resolve,
        fail: reject
      })
    })
  }
  async getClipboardData() {
    return new Promise((resolve, reject) => {
      wx.getClipboardData({
        data: data,
        success: (res)=>resolve(res.data),
        fail: reject
      })
    })
  }
  //交互
  showToast(title,icon){
    wx.showToast({title,icon})
  }
  async showModal(title,content){
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
  async showActionSheet(itemList){
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
  async scanCode(onlyFromCamera=false){
    return new Promise((resolve,reject)=>{
      wx.scanCode({
          onlyFromCamera:onlyFromCamera,
          success:resolve,
          fail:reject
      })
    })
  }
  async takePhoto(){
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
  async chooseImage(isCompressed){
    return new Promise((resolve,reject)=>{
      wx.chooseImage({
        count: 1,
        sizeType: isCompressed?['compressed']:['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success:resolve,
        fail:reject
      })
    })
  }
  //file
  async readFile(option){
    return new Promise((resolve,reject)=>{
      wx.getFileSystemManager().readFile(
        {
          filePath:option.filePath,
          encoding: option.encoding, //ascii,base64,binary,utf-8
          success:resolve,
          fail:reject
        }
      )       
    })    
  }
  async writeFile(option) {
    return new Promise((resolve, reject) => {
      wx.FileSystemManager().writeFile(
        {
          filePath: option.filePath,
          data    : option.data,
          encoding: option.encoding,  //ascii,base64,binary,utf-8
          success: resolve,
          fail: reject
        }
      )
    })
  }
  async rmFile(option) {
    return new Promise((resolve, reject) => {
      wx.FileSystemManager().unlinkFile(
        {
          filePath: option.filePath,
          success: resolve,
          fail: reject
        }
      )
    })
  }
  //storage
  async setStorage(key,value) {
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
  async getStorage(key) {
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
  async getStorageInfo() {
    return new Promise((resolve, reject) => {
      wx.getStorageInfo({
        success: (res) => resolve(res),
        fail: reject
      })
    })
  }
  async clearStorageInfo() {
    return new Promise((resolve, reject) => {
      wx.clearStorageInfo({
        success: (res) => resolve(res),
        fail: reject
      })
    })
  }
  async removeStorage(key) {
    return new Promise((resolve, reject) => {
      wx.removeStorage({
        key : key,
        success: resolve,
        fail: reject
      })
    })
  }

  //获取网络数据
  async request(option) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: option.url,
        method: option.method,
        header: option.header,
        data: option.data || {},
        success: resolve,
        fail: reject
      })
    })
  }
  async downloadFile(option,pgComponent,key){
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
  async uploadFile(option,pgComponent,key){
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
  async translate(option){
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
  async speech(content,wait=true){
    return new Promise((resolve,reject)=>{
      plugin.textToSpeech({
        lang: "zh_CN",
        tts: true,
        content: content,
        success: function (res) {
          console.log("succ tts", res.filename)
          const innerAudioContext = wx.createInnerAudioContext()
          innerAudioContext.src = encodeURI(res.filename)
          innerAudioContext.play()
          if (wait){
            innerAudioContext.onEnded(()=>{
              resolve(res)
            })
          }else{
            resolve(res)
          }
        },
        fail: function (err) {
          console.log("fail tts", err)
          reject(res)
        }
      })
    })
  }

  /*
  list = [{ key: "eat", value: { stuff: "apple", value: 1, eDate: "2020.03.04", eTime: "07:00:00" } },
            {key:"eat",value:{stuff:"banana",value:2,eDate:"2020.03.04",eTime:"06:00:00"}},
            {key:"eat",value:{stuff:"pear",value:3,eDate:"2020.03.04",eTime:"08:00:00"}},
            {key:"eat",value:{stuff:"mongo",value:1,eDate:"2020.03.05",eTime:"07:00:00"}},
            {key:"weight",value:{value:77.5,eDate:"2020.03.05",eTime:"10:00:00"}},
            {key:"weight",value:{value:75,eDate:"2020.03.05",eTime:"07:30:00"}}
           ]
  */
  list2json(list,key,date){
    //将具备key为类别，value为具体数据，且具体数据中含有eDate,eTime的日期和时间的记录数组转换成json结构
    //json的结构将以日期为键分组，然后对每个key类别形成按时间生序的对象列表
    //例如：传入数据：
    //list = [{key:"eat",value:{stuff:"apple",value:1,eDate:"2020.03.04",eTime:"07:00:00"}},
    // {key:"eat",value:{stuff:"banana",value:2,eDate:"2020.03.04",eTime:"06:00:00"}},
    // {key:"eat",value:{stuff:"pear",value:3,eDate:"2020.03.04",eTime:"08:00:00"}},
    // {key:"eat",value:{stuff:"mongo",value:1,eDate:"2020.03.05",eTime:"07:00:00"}},
    // {key:"weight",value:{value:77.5,eDate:"2020.03.05",eTime:"10:00:00"}},
    // {key:"weight",value:{value:75,eDate:"2020.03.05",eTime:"07:30:00"}}
    // ]
    // 输出数据:
    // {
    // "2020.03.04":{"eat":[{stuff:"banana",value:2,eDate:"2020.03.04",eTime:"06:00:00"},
    // { stuff: "apple", value: 1, eDate: "2020.03.04", eTime: "07:00:00" },
    // { stuff: "pear", value: 3, eDate: "2020.03.04", eTime: "08:00:00" }]},
    // "2020.03.05":{"eat":[{stuff:"mongo",value:1,eDate:"2020.03.05",eTime:"07:00:00"}],
    // "weight":[{value:75,eDate:"2020.03.05",eTime:"07:30:00"},
    // {value:77.5,eDate:"2020.03.05",eTime:"10:00:00"}]
    // }
    try {
      let res1, res2, res3
      res1 = _.chain(list).filter(x => x.key == key || !key).filter(x => x.date == date || !date)
      res2 = res1.groupBy(x => x.value.eDate).mapObject(x => _.sortBy(x, y => y.value.eTime))
      res3 = res2.mapObject(x => {
        return _.chain(x).groupBy(y => y.key).mapObject(y => _.map(y, z => z.value)).value()
      }).value()
      return res3
    }catch(err){
      console.log("!!!!!","list2json函数出错",list,err)
    } 
  }
  combData(data,sDate,eDate){
    //将标准的数据结构按指定的日期区间合并，合并后数据按eDate，eTime排序
    //标准的数据结构来自mongo数据库，或list2json函数
    //例如输入数据:
    // {
    //   "2020.03.04":{"eat":[{stuff:"banana",value:2,eDate:"2020.03.04",eTime:"06:00:00"},
    //                      { stuff: "apple", value: 1, eDate: "2020.03.04", eTime: "07:00:00" },
    //                      { stuff: "pear", value: 3, eDate: "2020.03.04", eTime: "08:00:00" }]},
    //   "2020.03.05":{"eat":[{stuff:"mongo",value:1,eDate:"2020.03.05",eTime:"07:00:00"}],
    //               "weight":[{value:75,eDate:"2020.03.05",eTime:"07:30:00"},
    //                         {value:77.5,eDate:"2020.03.05",eTime:"10:00:00"}]
    // }
    // 输出数据为:
    // {
    //   start:"2020.03.04",end:"2020.03.05",
    //     value:{"eat":[{stuff:"banana",value:2,eDate:"2020.03.04",eTime:"06:00:00"},
    //                   {stuff: "apple", value: 1, eDate: "2020.03.04", eTime: "07:00:00" },
    //                   {stuff: "pear", value: 3, eDate: "2020.03.04", eTime: "08:00:00" },
    //                   {stuff:"mongo",value:1,eDate:"2020.03.05",eTime:"07:00:00"}],
    //            "weight":[{value:75,eDate:"2020.03.05",eTime:"07:30:00"},
    //                      {value:77.5,eDate:"2020.03.05",eTime:"10:00:00"}]
    // }
    
  }
}

const util = new Util()

class Map{
  constructor(id){
    this.ctx = wx.createMapContext(id,this)
  }
  async moveTo(option={}){
    return new Promise((resolve,reject)=>{
      this.ctx.moveToLocation({
        longitude: option.longitude || null,
        latitude: option.latitude || null,
        success: resolve,
        fail: reject
      })
    })
  }
  async getLocation(option={}){
    return new Promise((resolve,reject)=>{
      wx.getLocation({
        type:option.type,
        success:resolve,
        fail:reject
      })
    })
  }
  async startUpdate(option={background:true,onChange:null}){
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
  async stopUpdate(){
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
  util  : util,
  Map   : Map,
  Record: Record
}
