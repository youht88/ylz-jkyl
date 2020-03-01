const util = require("/utils/util.js").util

class ParseBase{
  constructor(){
    this.Title="I am a base!"
  }
  sayHello(){
    console.log(this.Title)
  }
  
}
exports.ParseBase = ParseBase