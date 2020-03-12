const util=require("../../utils/util.js").util
const BaiduAI = require("../../utils/baiduAI.js").BaiduAI
var bdAI
const app=getApp()
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
    IconSelf:app.globalData.IconSelf
  },
  methods:{
    _onReload(e){
      console.log(app.globalData)
      var msg = e.target.dataset.link
      console.log("photo onReload", `${app.globalData.baseURL}/img/download/${msg}`)
      util.downloadFile({url:`${app.globalData.baseURL}/img/download/${msg}`}).then(res=>{
        console.log("download",res.tempFilePath)
        let item = this.data.item
        item.src = res.tempFilePath
        console.log(item)
        this.setData({item})
      }).catch(err=>{
         util.showModal("下载文件错误",JSON.stringify(err))
      })
    },
    async _onAction(e){
      bdAI = new BaiduAI(app.globalData.baseURL)
      let imgHash=e.target.dataset.link
      let idx= await util.showActionSheet(["识别营养成分","识别表格","识别菜谱"])
      switch (idx){
        case 0:
          this.parseNutrition(imgHash)
          break;
        case 1:
          this.parseTable(imgHash)
          break;
        case 2:
          this.parseMenu()
          break;
      }
    },
    async parseNutrition(imgHash){
      wx.showLoading({title:"正在分析..."})
      let nutrition = await bdAI.parseNutritionPic(imgHash)
      if (nutrition) {
        this.triggerEvent("addMsg", { msg: "营养成分:" + JSON.stringify(nutrition),"type":"saying","who":"AI"})
      } else {
        this.triggerEvent("addMsg", { msg: "无法识别", "type": "info", "who": "AI" })
      }
      wx.hideLoading()
      return
    },
    async parseTable(imgHash){
      wx.showLoading({ title: "正在分析..." })
      let table = await bdAI.parseTablePic(imgHash)
      if (table) {
        this.triggerEvent("addMsg", { msg: "表格数据:" + JSON.stringify(table,null,2), "type": "saying", "who": "AI" })
      } else {
        this.triggerEvent("addMsg", { msg: "无法识别", "type": "info", "who": "AI" })
      }
      wx.hideLoading()
      return
    },
    async parseMenu() {
    }
  }
})