const ParseBase = require("./parse.js").ParseBase
class NlpHealth extends ParseBase{
  constructor(){
    super()
  }
  parse(text){
    var result
    var reg = new RegExp("吃了([\\d]+)(个|碗|盘|块)(.*)")
    result = text.match(reg)
    return result
  }
}

exports.nlpHealth = new NlpHealth()