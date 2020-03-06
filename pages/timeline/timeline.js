const {util}=require("../../utils/util.js")
const {BaiduAI} = require("../../utils/baiduAI.js")
const app = getApp()
const bdAI = new BaiduAI(app.globalData.baseURL)

Page({
  data: {

  },
  async _onTap(){
    try{
      const result = await bdAI.getImageB64("QmRbv6iK4CCBNZ92ppcRxQ4fWjemUBdwZbpe1RqcLMHpCt")
      console.log("step1:",result.data)
      const result1 = await bdAI.general2objParse(result.data)
      console.log("step2:",result1)
      const result2 = await bdAI.general2textParse(result.data)
      console.log("step3:", result2)
      const result3 = await bdAI.table2textParse(result.data)
      console.log("step4:", result3)
    }catch(e){
      console.log(e)
    } 
  }
})