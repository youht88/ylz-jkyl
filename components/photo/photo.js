const util=require("../../utils/util.js").util
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
    baseURL:app.globalData.baseURL
  },
  methods:{
    _onReload(e){
      var msg = e.target.dataset.link
      util.downloadFile({url:`${this.data.baseURL}/img/download/${msg}`}).then(res=>{
        console.log("download",res.tempFilePath)
        let item = this.data.item
        item.src = res.tempFilePath
        console.log(item)
        this.setData({item})
      })
    }
  }
})