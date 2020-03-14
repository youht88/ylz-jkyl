const util = require("../../utils/util.js").util
const BaiduAI = require("../../utils/baiduAI.js").BaiduAI
var bdAI
const app = getApp()
Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  properties: {
    item: {
      type: Object
    }
  },
  data: {
    IconAI: app.globalData.IconAnimal,
    IconSelf: app.globalData.IconSelf
  },
  methods: {
    _onReload(e) {
      console.log(app.globalData)
      var msg = e.target.dataset.link
      util.setClipboardData(msg)
      console.log("photo onReload", `${app.globalData.baseURL}/ipfs/download/${msg}`)
      util.showLoading("加载视频...", 5000)
      util.downloadFile({ url: `${app.globalData.baseURL}/ipfs/download/${msg}` }).then(res => {
        util.hideLoading()
        console.log("download", res.tempFilePath)
        let item = this.data.item
        item.src = res.tempFilePath
        console.log(item)
        this.setData({ item })
      }).catch(err => {
        util.hideLoading()
        util.showModal("下载文件错误", JSON.stringify(err))
      })
    },
    _onPause(e){
      console.log(e)
    },
    async _onAction(e) {
      bdAI = new BaiduAI(app.globalData.baseURL)
      let idx = await util.showActionSheet(["识别当前帧"])
      switch (idx) {
        case 0:
          this.parseObject(e)
          break;
      }
    },
    
    async parseObject(e) {
      console.log(e)
      //识别这张图片
      res2 = await util.readFile({
        filePath: tempFilePath,
        encoding: "base64"
      })
      console.log("res2", res2)
      try {
        res3 = await bdAI.general2objParse(res2.data)
        console.log(res3)
        this.setData({
          ["items[" + (this.data.items.length - 1) + "].what"]: res3
        })
      } catch (err) {
        util.showModal("警告", JSON.stringify(err))
      }
    }
  }
})