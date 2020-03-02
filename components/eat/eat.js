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
  data:{
    IconAI: app.globalData.IconAnimal,
    baseURL:app.globalData.baseURL
  },
  ready: function(){
    console.log("eat component:", this.data.item)
  }
})