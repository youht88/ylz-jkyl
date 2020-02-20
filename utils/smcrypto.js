const sm2 = require('miniprogram-sm-crypto').sm2;
const sm3 = require('miniprogram-sm-crypto').sm3;
const sm4 = require('miniprogram-sm-crypto').sm4;
const sha256 = require('js-sha256').sha256

class SMcrypto{
  constructor(options){
    //keypair:
    //{"publickKey":公钥,
    // "privateKey":私钥,
    // "gen":是否生sm2密钥对,
    // "keyNane":读取或存储的文件名}
    options=options||{}
    this.keyName = options.keyName||"key"
    var keyStr = wx.getStorageSync(this.keyName)
    if (options.keypair){
      this.publicKey = options.keypair.publicKey
      this.privateKey = options.keypair.privateKey
      wx.setStorageSync(this.keyName, JSON.stringify({ publicKey: this.publicKey, privateKey: this.privateKey }))
    }else if (options.gen){
      this.generateKeyPairHex()
    }else{
      if (keyStr){
        keyStr = JSON.parse(keyStr)
        this.publicKey=keyStr.publicKey
        this.privatKey=keyStr.privateKey
      }else{
        this.generateKeyPairHex()
      }
    }
  }
  generateKeyPairHex() {
    let keypairHex = sm2.generateKeyPairHex()
    if (keypairHex) {
      this.publicKey  = keypairHex.publicKey
      this.privateKey = keypairHex.privateKey
      wx.setStorageSync(this.keyName, JSON.stringify({ publicKey: this.publicKey, privateKey: this.privateKey }))    
    }
  }
  sign(message,prvkey=null){
    prvkey = prvkey?prvkey:this.privateKey
    return sm2.doSignature(message,prvkey,{hash:true})
  }
  verify(message,signStr,pubkey){
    pubkey = pubkey?pubkey:this.publicKey
    return sm2.doVerifySignature(message,signStr,pubkey,{hash:true})
  }
  sign256(message, prvkey = null) {
    prvkey = prvkey ? prvkey : this.privateKey
    var msgHash=this.sha256(message)
    return sm2.doSignature(msgHash, prvkey, { hash: false })
  }
  verify256(message, signStr, pubkey) {
    pubkey = pubkey ? pubkey : this.publicKey
    const msgHash=this.sha256(message)
    return sm2.doVerifySignature(msgHash, signStr, pubkey, { hash: false })
  }
  encrypt(message,pubkey,cipherMode=1){
    pubkey = pubkey?pubkey:this.publicKey
    return sm2.doEncrypt(message,pubkey,cipherMode)
  }
  decrypt(encryptData,prvkey,cipherMode){
    prvkey = prvkey?prvkey:this.privateKey
    return sm2.doDecrypt(encryptData,prvkey,cipherMode=1)
  }
  sm3(message){
    return sm3(message)
  }
  encipher(msgBuffer,key){
    return sm4.encrypt(msgBuffer,key)
  }
  decipher(encryptBuffer,key){
    return sm4.decrypt(encryptBuffer,key)
  }
  sha256(message){
    return sha256(message)
  }
  //ArrayBuffer转字符串
  ab2str(arrayBuffer) {
    try{
      let s = decodeURIComponent(arrayBuffer.map(function (value, index) { return '%' + value.toString(16) }).join(''));
      console.log(s)
      return s
    }catch(e){
      console.log("不能转换为字符串！")
    }
  }
  //字符串转字符串ArrayBuffer
  str2ab(str) {
    let val=""
    for(let i=0;i<str.length;i++){
      if(val==''){
        val=str.charCodeAt(i).toString(16)
      }else{
        val+=','+str.charCodeAt(i).toString(16)
      }
    }
    console.log("val:",val)
    //将16进制转化为ArrayBuffer
    return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function(h){
      return parseInt(h,16)
    }))
  }
}

module.exports={
  SMcrypto:SMcrypto
}