const {util}=require("./util.js")
const app=getApp()

class YlzLink{
  constructor(){
    this.address = app.globalData.address
    this.crypto  = app.globalData.crypto
    this.baseURL = app.globalData.baseURL
    console.log(this)
  }
  setBaseURL(baseURL){
    this.baseURL = baseURL
  }
  async setData(data,cryptData=false,cryptCid=true,useBlockchain=true){
    //默认流程是
    //1、如果data是基本数据类型，统一转换为JSON后加入ipfs；如果是文件名则读取后转base64后加入ipfs。返回ipfs的cid
    //2、对利用私钥对cid加密
    //3、将加密结果用私钥签名
    //4、将签名结果签名的数据入链
    console.log("setData:data",data)
    let cid = await this.ipfsDagPut(data)
    console.log("setData:cid",cid)
    let dbid = await this.dbSave(cid)
    console.log("setData:dbid",dbid)
    return dbid
  }
  async getData(dbid,path,cryptData = false, cryptCid = true, useBlockchain = true){
    console.log("getData:dbid,path",dbid,path)
    let {data,sign} = await this.dbFetch(dbid)
    console.log("getData:dbdata,sign",data,sign)
    //验证
    let cid = this.crypto.decrypt(data)
    console.log("getData:cid",cid)
    let verify = this.crypto.verify(data, sign)
    if (!verify) {
      wx.showToast("验证签名失败", "none")
      return
    }
    let result = await this.ipfsDagGet(cid,path)
    console.log("getData:data",result)
    return result
  }
  async ipfsDagPut(data){
    let result = await util.request({
      url: `${app.globalData.baseURL}/ipfs/dagPut`,
      method: "post",
      data: { data: data }
    })
    let cid = result.data
    return cid
  }
  async ipfsDagGet(cid,path){
    let result = await util.request({
        url: `${app.globalData.baseURL}/ipfs/dagGet`,
        method: "post",
        data: { cid: cid, path: path }
      })
    return result.data
  }
  async ipfsUpload(){

  }
  async ipfsDownload(){

  }
  async bcSet(){

  }
  async bcGet(){

  } 
  async dbSave(cid){
    let cryptCid = this.crypto.encrypt(cid)
    let sign = this.crypto.sign(cryptCid, this.crypto.privatKey)
    let result = await util.request({
      url: `${app.globalData.baseURL}/db/save`,
      method: "post",
      data: {
        data: {
          address: this.address,
          data: cryptCid,
          publicKey: this.crypto.publicKey,
          sign: sign,
          timestamp: new Date()
        }
      }
    })
    return result.data.insertedId
  }
  async dbFetch(dbid){
    let result = await util.request({
      url: `${app.globalData.baseURL}/db/fetch/${dbid}`,
      method: "get"
    })
    return result.data
  }
}

module.exports={
  ylzLink : new YlzLink()
}