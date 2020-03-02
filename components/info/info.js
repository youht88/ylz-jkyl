// components/info/info.js
const app = getApp()
Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  properties: {
    item: {
      type: Object
    },
    imgHash:{type:String}
  },
  data:{
    baseURL:app.globalData.baseURL
  }
})
