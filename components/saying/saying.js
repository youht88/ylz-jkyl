// pages/components/saying/saying.js
const app = getApp()
Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  properties: {
    item:{
      type:Object
    }
  },
  data: {
    IconAI: app.globalData.IconAnimal,
    IconSelf: app.globalData.IconSelf,
  },
})
