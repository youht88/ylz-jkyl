const app = getApp();
const _ = require('underscore')
const SMcrypto = require("../../utils/smcrypto.js").SMcrypto
const {util,Record,BaiduAI} = require("../../utils/util.js")
var record= new Record()
var interval

const bdAI = new BaiduAI(app.globalData.baseURL)

Page({
  data: {
    value:"",
    InputBottom:0,
    CustomBar: app.globalData.CustomBar,
    Page: app.globalData.Page,
    items: [],
    scrolltop:0,
    color:"blue",
    currIdx:0,
    currentEat:"",
    currentImgHash:""
  },
  ////////生命周期函数////////////
  _nextQuestion(msg){
    this._add({msg},"info")
    util.speech({ content:msg}).then((res) => {
      console.log("are you hear??")
    })
  },
  onUnload() {
    console.log("onUnload")
    clearInterval(interval)

    util.setStorage("ITEMS",this.data.items).then(res=>{
      console.log(res)
    })
  },
  onShow1(){
    this._add({msg:"重新定位"},"location")
    var question1 = ["记录点什么？","有什么可以记录的？"]
    var question2 = ["还有吗？","记录点其他的？","再记录些？","再来一条！"]
    var answerEnd=["可以了","没有了","不用了","就这样","行了"]
    this._nextQuestion(_.sample(question1,1))
    var lastword=""
    this._onVoiceStart()
    //定义一个定时器，每隔2秒检查
    var count=0
    interval = setInterval(()=>{
        console.log(1,lastword,2,this.data.value,3,count,4,interval)
        if (lastword && (lastword==this.data.value))  {//用户暂时停止说话了
          if (count++ >2){ //连续两次停止说话了，可以停止录音了
            this._onVoiceEnd()
          }
          lastword=""
          count = 0
          this._nextQuestion(_.sample(question2,1))
          this._onVoiceStart()
        }else{
          lastword=this.data.value
        }      
    },2000)
  },
  onLoad(){
    this._registerRecord()
    this._loadData()
  },
  _loadData(){
    util.getStorage("ITEMS").then(res=>{
      console.log("loadData:",res)
      this.setData({
        items:res,
        currIdx:res.length - 1
      })
      var data = this.data.items.map(x => {
        switch (x.type) {
          case "eat": return {"eat":x.msg}
          case "sign_weightKg": return { key:"sign_weightKg",value:x.msg}
          case "emotion": return { key:"emotion", value:x.msg }
          case "behavior": return { key:"behavior",value:x.msg }
          case "sport": return { key:"sport",value:x.msg }
          default: return null
        }
      }).filter(x=>x)
      console.log("data:", data)
      this.setData({data:data})
    })
  },
  _registerRecord(){
    let cbRecognize = (res) => {
      let text = res.result
      console.log("识别中的文字：", text)
      this.setData({value:text})
    }
    let cbStop = (res) => {
      console.log("cbStop:",res)
      let text = res.result
      let type
      if (text == '') {
        // 用户没有说话，可以做一下提示处理...
        text = "[没有检测出你的发言]"
        type="info"
      }else{
        type="self"
      }
      console.log("识别出来的文字:", text)
      this._add({msg:text},type)
    }
    record.init(cbRecognize, cbStop)
  },
  /////////////////////////////////////
  _onClear(e){
    this.setData({value:"",items:[]})
  },
  _onFocus(e) {
    this.setData({
      InputBottom: e.detail.height
    })
  },
  _onBlur(e) {
    var value = e.detail.value
    this.setData({ value ,
      InputBottom: 0
    })
    if (!value){
      this._add({msg:"[没有检测到你的发言]"},"info")
    }else{
     this._add({msg:value},"self")
    }
  },
  _onTouchStart(e){
    clearInterval(interval)
    console.log("touchstart:",e)
    this._onVoiceStart()
  },
  _onTouchEnd(e){
    console.log("touchend:",e)
    this._onVoiceEnd()
  },
  //zh_CN,en_US,zh_HK,sichuanghua
  _onVoiceStart() {
    record.startRec({
      lang: 'zh_CN',
    })
    this.setData({color:"red"})
  },
  _onVoiceEnd() {
    console.log("voice end")
    record.stopRec()
    this.setData({color:"blue"})
  }, 

  async _add(obj,type){
    //this.data.items.push()
    let value = obj.msg
    let temp
    if (this.data.currentImgHash && value.match(new RegExp(`^识别.*营养成分`))){
      var result = await bdAI.getImageB64(this.data.currentImgHash)
      result = await bdAI.general2textParse(result.data)
      result = result.data.words_result.map(x=>x.words).join("")
      console.log("营养成分", result)
      let nutrition={}
      temp = result.match(new RegExp(`(能量)([\\d\\.]+)(kj|千焦)([\\d\\.]+)%`,"i"))
      nutrition.energyKj = temp?[parseFloat(temp[2]),temp[4]/100]:null
      temp = result.match(new RegExp(`(蛋[白百]质)([\\d\\.]+)(g|克)([\\d\\.]+)%`))
      nutrition.proteinG = temp ? [parseFloat(temp[2]),temp[4]/100]:null
      temp = result.match(new RegExp(`(脂肪)([\\d\\.]+)(g|克)([\\d\\.]+)%`))
      nutrition.fatG = temp ? [parseFloat(temp[2]), temp[4] / 100]:null
      temp = result.match(new RegExp(`(碳水化合物)([\\d\\.]+)(g|克)([\\d\\.]+)%`))
      nutrition.chG = temp ? [parseFloat(temp[2]), temp[4] / 100]:null
      temp = result.match(new RegExp(`(钠)(钙)?(铁)?(([\\d\\.]+)(mg|毫克)([\\d\\.]+)%)(([\\d\\.]+)(mg|毫克)([\\d\\.]+)%)?(([\\d\\.]+)(mg|毫克)([\\d\\.]+)%)?`))
      console.log("??????",temp)
      nutrition.sodiumMg = temp ? [parseFloat(temp[5]), temp[7] / 100]:null
      if (temp[8]) nutrition.CaMg = temp ? [parseFloat(temp[9]), temp[11] / 100] : null
      if (temp[12]) nutrition.FeMg = temp ? [parseFloat(temp[13]), temp[15] / 100] : null
      console.log(nutrition)
      return
    }
    if (this.data.currentEat && type!="info" && value.match(new RegExp(`^(吃了|喝了|抽了)`))) {
      value=value+this.data.currentEat
      this.setData({ currentEat: "" })
    }

    this.data.items.push({ msg: value, imgHash:obj.imgHash,type: type, dateTime: (new Date()).toISOString()})
    this.setData({ value: ""})
    if (!value || type=="info"){
      this.setData({
        items:this.data.items,
        "currIdx": this.data.items.length - 1
      })  
      return
    }
    if (this._isGraph(value)) return
    var url = `${app.globalData.baseURL}/health/parse/${value}`
    console.log("url:",url)
    util.request({
       url:url
     }).then((res)=>{
        console.log("result:",res.data)
        if (JSON.stringify(res.data)=="{}"){
          this.data.items.push({ msg: "抱歉，我没有理解这句话。愿意帮我标记一下吗？我会努力学习的！", type: "info",text:value})
          this.setData({
            items: this.data.items,
            "currIdx": this.data.items.length - 1
          })  
        }else{
          Object.keys(res.data).map(x=>{
            res.data[x].map(y=>{
              //如果是饮食，需要精确定位找出营养量
              if (x=="eat"){
                util.request({url:`${app.globalData.baseURL}/food/${y.stuff}`}).then((food)=>{
                  if (food.data.length==0){
                    console.log("no")
                    this.data.items.push({ msg: y, type: x, dateTime: (new Date()).toISOString() })
                    this.data.data.push({ key: x, value: y })
                    this.setData({
                      items: this.data.items,
                      "currIdx": this.data.items.length - 1
                    })  
                  }else if (food.data.length==1){
                    console.log("one", `${ food.data[0].split(":")[1] }`)
                    util.request({
                      url: `${app.globalData.baseURL}/food/${food.data[0].split(":")[1]}/${y.value}/${y.unit}`
                    }).then(res2 => {
                      console.log("one:",res2.data)
                      this.data.items.push({ 
                         msg: {
                           stuff:res2.data.name,
                           value:y.value,
                           unit: y.unit,
                           nutrition:res2.data.nutrition,
                           imgHash:res2.data.imgHash,
                           eDate:y.eDate,
                           eTime:y.eTime
                         }, type: x, dateTime: (new Date()).toISOString() })
                      this.data.data.push({ key: x, value: {
                        stuff: res2.data.name,
                        value: y.value,
                        unit: y.unit,
                        nutrition: res2.data.nutrition,
                        eDate: y.eDate,
                        eTime: y.eTime
                       }})
                      this.setData({
                        items: this.data.items,
                        "currIdx": this.data.items.length - 1
                      })  
                    })
                  }else{
                    console.log("multi")
                    util.showActionSheet(food.data).then(idx=>{
                      util.request({
                        url: `${app.globalData.baseURL}/food/${food.data[idx].split(":")[1]}/${y.value}/${y.unit}`})
                         .then(res2=>{
                          console.log("one:", res2.data)
                          this.data.items.push({
                            msg: {
                              stuff: res2.data.name,
                              value: y.value,
                              unit: y.unit,
                              nutrition: res2.data.nutrition,
                              imgHash:res2.data.imgHash,
                              eDate: y.eDate,
                              eTime: y.eTime
                            }, type: x, dateTime: (new Date()).toISOString()
                          })
                          this.data.data.push({
                            key: x, value: {
                              stuff: res2.data.name,
                              value: y.value,
                              unit: y.unit,
                              nutrition: res2.data.nutrition,
                              eDate: y.eDate,
                              eTime: y.eTime
                            }
                          })
                           this.setData({
                             items: this.data.items,
                             "currIdx": this.data.items.length - 1
                           })  
                      })
                    })
                  }
                })
              }else{
                this.data.items.push({msg:y, type: x, dateTime: (new Date()).toISOString() })
                this.data.data.push({key:x,value:y})
                this.setData({
                  items: this.data.items,
                  "currIdx": this.data.items.length - 1
                })  
              }
            })
          })
          console.log("data:",this.data.data)
        }
     }).catch((error)=>{
       console.log(error)
     })
  },
  _onCameraTap(){
    if (!this.data.isCamera){
      this.setData({isCamera:true})
    }
  },
  _takePhoto(){
    util.chooseImage(true).then((res)=>{
      console.log(res)
      var tempFilePath = res.tempFilePaths[0]
      if (res){
        this.data.items.push({ msg: "正在存入ipfs网络...", type: "photo", src: tempFilePath, dateTime: (new Date()).toISOString() })
        this.setData({
          items: this.data.items,
          "currIdx": this.data.items.length-1
        }) 
        //上传到服务器
        var pg = this.selectComponent("#progress")
        console.log("uploadFile start:",pg)
        util.uploadFile({
           url:`${app.globalData.baseURL}/img/upload`,
           filePath:tempFilePath,
           name:"img",
        }, pg, "loading").then((res1)=>{
            var hash = JSON.parse(res1.data).hash
            console.log("uploadFile end:",res1.data)
            this.data.currentImgHash=hash
            util.setClipboardData(hash)
            this.setData({
              ["items["+(this.data.items.length - 1)+"].msg"]:hash
            })
            //识别这张图片
            util.readFile({
               filePath:tempFilePath,
               encoding:"base64"
            }).then((res2)=>{
              console.log("res2",res2)
              util.request({
                url: "https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general?access_token=24.a17d67af3872c1938ede5b73021f0e2e.2592000.1583635267.282335-18405725",
                method: "post",
                header: { "content-type": "application/x-www-form-urlencoded" },
                data: {
                  image: res2.data,
                  baike_num: 0
                }
              }).then((res3) => {
                console.log(res3)
                util.showToast("success")
                this.setData({
                  ["items[" + (this.data.items.length - 1) + "].what"]: res3.data.result[0]
                })
              }).catch((err)=>{
                util.showModal("警告",JSON.stringify(err))
              })
            })
        }).catch((err)=>{
            console.log("uploadFile end:",err)
        })
      }
      this.setData({isCamera:false})
    })
  },
  _onQrcodeTap(){
    console.log("start qrcode")
    util.scanCode().then((res)=>{
      util.request({
        url: `${app.globalData.baseURL}/food/id/${res.result}`
      }).then((res1)=>{
        if (res1.data){
          this.setData({currentEat: res1.data.name})
          console.log("this.data.currentEat", this.data.currentEat)
          this._add({imgHash:res1.data.imgHash,msg:res1.data.name+",吃了多少？"}, "info")
        }else{
          this.setData({currentEat:""})
          this._add({msg:"未能识别"+res.result+",它是什么？"}, "info")
        }
        
      })
    }).catch((e)=>{
      console.log(e)
    })
  },

  _onTest(){
    /* util.setStorage("abc",{a:new Date(),b:"xyz",c:[1,2,3],d:true})
        .then((res)=>{
          console.log("setStorage complete!")
        })
     util.getStorage("abc")
       .then((res)=>{
         console.log("getStorage:",res)
       }).catch((err)=>{
         console.log("getStorage:",err)
       })
    */
    util.removeStorage("abc").then((res)=>{
      util.showModal("提示",JSON.stringify(res)).then((res)=>{
        util.showToast("是否确认"+res)
        util.showActionSheet(["a", "b", "c"])
          .then(res => {
            console.log(res)
            util.showToast(res, "error")
          }).catch(e => console.log(e))
      })
    })
    this.setData({isHelp:true})
    util.speech({ content: "0101，我是007，听到请回答！" })
      .then((res)=>{
        console.log("get voice...",res)
        var pg = this.selectComponent("#progress")
        util.downloadFile({
          url:res.filename
        },pg,"loading").then((res1)=>{
          console.log("playVoice...", res1)
          this.setData({audioFile:res1.tempFilePath})
          console.log(this.data.audioFile)
          wx.playVoice({
            filePath:encodeURI(res1.tempFilePath),
            success:((res)=>{
              console.log("success",res)
            }),
            fail:((res)=>{
              console.log("fail:",res)
            })
          })
        })
      })
  },
  _onMark(e){
    console.log(e)
    var text=e.target.dataset.text
    if (!text) return
    wx.navigateTo({
      url:`/pages/mark/mark?text=${e.target.dataset.text}`
    })
  },
  _onHelp(e){
    wx.navigateTo({
      url: `/pages/help/help`
    })
  },

  _isGraph(value){
    var option
    var temp
    if (value.match("体重情况")) {
      option = this._graphWeight()
    }else if (value=="动态图"){
      option = this._graphDynamic()  
    }else{
      return false
    }
    this.data.items.push({ msg: "I am echart", type: "chart", option: option, dateTime: (new Date()).toISOString() })
    temp = "items[" + (this.data.items.length - 1) + "]"
    this.setData({
      [temp]: this.data.items[this.data.items.length - 1],
      "currIdx": this.data.items.length - 1
    })
    return true
  },
  _graphWeight(){
    var data = _.filter(this.data.data,(x)=>{
                   return x.key == "sign_weightKg"})
      .map(x => { 
        return { value:x.value.value,
                 eDate:x.value.eDate,
                 eTime:x.value.eTime,
             timestamp:(new Date(x.value.eDate + " " + x.value.eTime)).getTime()
             }
      })
      .sort((x,y)=>{
        return x.timestamp-y.timestamp                        
      })
    console.log("!!!!!",data)
    var option = {
      title: {
        text: '体重情况(公斤)',
        subtext: '测试'
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(x=>{
          let date = x.eDate.split(".")
          let time = x.eTime.split(":") 
          return `${date[1]}/${date[2]} ${time[0]}:${time[1]}`
        })
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}'
        }
      },
      dataZoom: [
        {
          show: true,
          realtime: true,
          start: 0,
          end: 150,
          xAxisIndex: [0, 1]
        },
      ],
      series: [{
        name: '体重(公斤)',
        type: 'line',
        symbolSize: 8,
        data: data.map(x=>{
            return x.value
        }),
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        } 
      }]
    };
    console.log("option:",option)
    return option
  },
  _graphDynamic(){
    var data = [{
      fixed: true,
      x: 2,
      y: 2,
      symbolSize: 20,
      id: '-1'
    }];

    var edges = [];

    option = {
      series: [{
        type: 'graph',
        layout: 'force',
        animation: false,
        data: data,
        force: {
          // initLayout: 'circular'
          // gravity: 0
          repulsion: 100,
          edgeLength: 5
        },
        edges: edges
      }]
    };

    setInterval(function () {
      data.push({
        id: data.length
      });
      var source = Math.round((data.length - 1) * Math.random());
      var target = Math.round((data.length - 1) * Math.random());
      if (source !== target) {
        edges.push({
          source: source,
          target: target
        });
      }
      myChart.setOption({
        series: [{
          roam: true,
          data: data,
          edges: edges
        }]
      });

      // console.log('nodes: ' + data.length);
      // console.log('links: ' + data.length);
    }, 500);
  }
})