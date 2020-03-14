// components/info/info.js
const app = getApp()
const {util}=require("../../utils/util.js")
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
  },
  ready(){
    
  },
  methods:{
    _onLongpress(e){
      util.setClipboardData(e.target.dataset.msg)
    }
  }
})
