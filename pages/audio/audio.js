
const record = require("../../utils/util.js").record

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    items:[],
    texts:[],
    scrollTop:0
  },
  
  onLoad(){
    console.log("?????")
    var ctx = wx.createInnerAudioContext({ src: "http://m10.music.126.net/20180809173001/070d716213a3cf7cb910b5b88b638eb8/ymusic/687c/a444/e9e3/66452e1efb0e3f108d6b899010c13ba8.mp3", autoplay: true }
    )
    ctx.play()
    console.log(ctx.src)
  },
  
  /////////插件方式
  _onVoiceStart(){
    record.startRec({
     lang: 'zh_CN',
    })
  },
  _onVoiceEnd(){
    record.stopRec()
  }  
})