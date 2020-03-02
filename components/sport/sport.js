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
  data:{
    IconAI:app.globalData.IconGirl
  }
})
