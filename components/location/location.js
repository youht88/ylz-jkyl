// components/sign/sign.js
console.log("location")
const Map=require("../../utils/util").Map
var map 
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
    longitude:null,
    latitude:null
  },
  ready: function () {
    // 在组件实例进入页面节点树时执行
    map = new Map("map")
    map.getLocation().then((loc)=>{
      console.log(loc)
      this.setData({loc})
    })
  }
})
