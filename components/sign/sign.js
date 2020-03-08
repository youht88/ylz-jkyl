// components/sign/sign.js
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
    tag:null
  },
  ready(){
    switch (this.data.item.type) {
      case "sign_weightKg":
        this.setData({color:"blue",tag:"体重"})
        break;   
      case "sign_heartRate":
        this.setData({color:"red",tag:"心率"})
        break;
    } 
  }
})
