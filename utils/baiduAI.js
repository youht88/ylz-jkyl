const util = require("./util.js").util
class BaiduAI{
  constructor(baseURL){
    this.baseURL = baseURL
    this.accessTokenText="24.60a30d8c2a50c28ed0de1394b6412c2d.2592000.1586531108.282335-18401314"
    this.accessTokenPic ="24.bb28ede58dccc137c820833f2cd32113.2592000.1586484913.282335-18405725"
  }

  async getImageB64(ipfsHash){
    return new Promise((resolve,reject)=>{
      util.downloadFile({
        url:`${this.baseURL}/img/download/${ipfsHash}`
      }).then((res1)=>{
        util.readFile({
          filePath: res1.tempFilePath,
          encoding: "base64"
        }).then(resolve).catch(reject)
      }).catch(reject)
    })
  }
  async table2textParse(imgB64){
    return new Promise((resolve,reject)=>{
      util.request({
        url: `https://aip.baidubce.com/rest/2.0/solution/v1/form_ocr/request?access_token=${this.accessTokenText}`,
        method: "post",
        header: { "content-type": "application/x-www-form-urlencoded" },
        data: {
          image: imgB64,
          is_sync: true,
          request_type: "json"
        }
      }).then(resolve).catch(reject)
    })
  }
  async general2textParse(imgB64){
    return new Promise((resolve,reject)=>{
      util.request({
        url: `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate?access_token=${this.accessTokenText}`,
        method: "post",
        header: { "content-type": "application/x-www-form-urlencoded" },
        data: {
          image: imgB64
        }
      }).then(resolve).catch(reject)
    })
  }
  async general2objParse(imgB64){
    return new Promise((resolve,reject)=>{
      util.request({
        url: `https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general?access_token=${this.accessTokenPic}`,
        method: "post",
        header: { "content-type": "application/x-www-form-urlencoded" },
        data: {
          image: imgB64
        }
      }).then((res)=>{
        resolve(res.data.result)
      }).catch(reject)
    })
  }
  async general2tableParse(imgB64) {
    return new Promise((resolve, reject) => {
      util.request({
        url: `https://aip.baidubce.com/rest/2.0/solution/v1/form_ocr/request?access_token=${this.accessTokenText}`,
        method: "post",
        header: { "content-type": "application/x-www-form-urlencoded" },
        data: {
          image: imgB64,
          is_sync:true,
          request_type:"json"
        }
      }).then(resolve).catch(reject)
    })
  }
  async parseTablePic(imgHash){
    let result, table = {}
    let temp
    result = await this.getImageB64(imgHash)
    result = await this.general2tableParse(result.data)
    console.log("result0:", result.data.result.result_data)
    return JSON.parse(result.data.result.result_data)
  }
  async parseNutritionPic(imgHash) {
    let result, nutrition = {}
    let temp
    result = await this.getImageB64(imgHash)
    result = await this.general2textParse(result.data)
    console.log("result0:", result)
    let bdExtra = new BaiduExtra(result.data)
    let p=bdExtra.find("蛋白质")
    console.log("*****",p,p[0].idx)
    console.log("*****",bdExtra.exclude(p[0].idx,{left:0}))
    p = bdExtra.maxRight(["4%","7%"])
    console.log("****",p)

    result = result.data.words_result.map(x => x.words).join("")
    console.log("营养成分:", result)

    temp = result.match(new RegExp(`(能量[^\\.^\\d]*)([\\d\\.]+)(kj|千焦)([\\d\\.]+)%`, "i"))
    nutrition.energyKj = temp ? [parseFloat(temp[2]), temp[4] / 100] : null
    temp = result.match(new RegExp(`(蛋[白百]质)([\\d\\.]+)(g|克)([\\d\\.]+)%`, "i"))
    nutrition.proteinG = temp ? [parseFloat(temp[2]), temp[4] / 100] : null
    temp = result.match(new RegExp(`(脂肪)([\\d\\.]+)(g|克)([\\d\\.]+)%`, "i"))
    nutrition.fatG = temp ? [parseFloat(temp[2]), temp[4] / 100] : null
    temp = result.match(new RegExp(`(碳水化合物)([\\d\\.]+)(g|克)([\\d\\.]+)%`, "i"))
    nutrition.chG = temp ? [parseFloat(temp[2]), temp[4] / 100] : null
    temp = result.match(new RegExp(`(钠)(钙)?(铁)?(([\\d\\.]+)(mg|毫克)([\\d\\.]+)%)(([\\d\\.]+)(mg|毫克)([\\d\\.]+)%)?(([\\d\\.]+)(mg|毫克)([\\d\\.]+)%)?`, "i"))
    console.log("??????", temp)
    if (temp) {
      nutrition.sodiumMg = temp ? [parseFloat(temp[5]), temp[7] / 100] : null
      if (temp[8]) nutrition.CaMg = temp ? [parseFloat(temp[9]), temp[11] / 100] : null
      if (temp[12]) nutrition.FeMg = temp ? [parseFloat(temp[13]), temp[15] / 100] : null
      console.log(nutrition)
    }
    console.log("nutrition:", nutrition)
    return nutrition
  }
}

class BaiduExtra{
  constructor(source){
    this.source = source
    this.reset()  
  }
  reset(){
    this.words = this.source.words_result.map((x, i) => {
      return { idx: i, words: x.words, location: x.location }
    })
  }
  find(patten) {
    //返回符合patten的index数组
    return this.words.
      filter((x, i) => {
        if (x.words.match(new RegExp(patten))) return true
      })
  }
  exclude(index, pos = {}) {
    let left = pos.left
    let right = pos.right
    let top = pos.top
    let bottom = pos.bottom
    let word = this.words[index]
    let toMove = [], word_result = []
    this.words = this.words.filter((x, i) => {
      if (left != undefined && word.location.left - x.location.left - x.location.width > left) {
        return false
      }
      if (top != undefined && word.location.top - x.location.top - x.location.height > top) {
        return false
      }
      if (right != undefined && x.location.left - word.location.left - word.location.width > right) {
        return false
      }
      if (bottom != undefined && x.location.top - word.location.top - word.location.top > bottom) {
        return false
      }
      return true
    }).sort((x, y) => { return x.idx - y.idx })
      .map((x, i) => { return { idx: i, words: x.words, location: x.location } })
    console.log("after exclude:", word.words, this.words)
    return this.words
  }
  findNearTop(index, distance = null) {
    //定位最近的location.top
    //返回words数组
    let word = this.words[index]
    let left = word.location.left
    let top = word.location.top
    let dis
    return this.words.map((x, i) => {
      let xleft = x.location.left
      let xtop = x.location.top
      if (top > xtop) {
        dis = Math.sqrt((left - xleft) ** 2 + (top - xtop) ** 2)
        console.log("findNearTop", i, word, x.words, "word:", left, top, "x:", xleft, xtop, "dis:", dis)
        if (!distance) {
          return { "index": i, "words": x.words, "location": x.location, "distance": dis }
        }
        if (dis < distance) {
          return { "index": i, "words": x.words, "location": x.location, "distance": dis }
        }
      }
    }).filter(w => w).sort((m, n) => m.distance - n.distance)
  }
  maxRight(pattens) {
    //返回length最长的words的index
    pattens = pattens.join("|")
    return this.words
      .filter(x => {
        return x.words.match(new RegExp(pattens))
      })
      .sort((x, y) => y.location.left + y.location.width - x.location.left - x.location.width)
      .map(x => x.idx)[0]
  }
}

module.exports={
  BaiduAI : BaiduAI
}