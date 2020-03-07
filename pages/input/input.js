const app = getApp();
const _ = require('underscore')
const SMcrypto = require("../../utils/smcrypto.js").SMcrypto
const {util,Record} = require("../../utils/util.js")
const {BaiduAI} = require("../../utils/baiduAI.js")
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
          case "eat": return {key:"eat",value:x.msg}
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
    let value = obj.msg
    let temp,res1,res2
    if (value.match(new RegExp("^播放"))){
      await util.speech("还有其他吗",true)
      await util.speech("估计没有了",true)
      return
    }

    if (value.match(new RegExp("^建议"))){
      temp = util.list2json(this.data.data)
      console.log("建议1:",JSON.stringify(temp))
      console.log("aaaaa", `${ app.globalData.baseURL }/food/analyse`)
      res1=await util.request({
        url:`${app.globalData.baseURL}/food/analyse`,
        method:"post",
        data:{
          data:JSON.stringify(temp),
          date:"2020.03.05"
        }
      })
      console.log("建议2:",res1.data)
      wx.navigateTo({
        url: `/pages/chart/chart?data=${JSON.stringify(res1.data)}`,
      })

      return
    }
    if (this.data.currentImgHash && value.match(new RegExp(`^(识别|分析|解析|辨析|翻译).*营养成分`))){
      let nutrition = await bdAI.parseNutritionPic(this.data.currentImgHash)
      if (nutrition){ 
       await util.showModal(JSON.stringify(nutrition))
    }
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
    res1 = await util.request({
       url:url
     })
    console.log("result:",res1.data)
    if (JSON.stringify(res1.data)=="{}"){
      this.data.items.push({ msg: "抱歉，我没有理解这句话。愿意帮我标记一下吗？我会努力学习的！", type: "info",text:value})
    }else{
      await Promise.all(Object.keys(res1.data).map(x=>{
        return Promise.all(res1.data[x].map(async y=>{
          //如果是饮食，需要精确定位找出营养量
          if (x=="eat"){
            let food = await util.request({url:`${app.globalData.baseURL}/food/${y.stuff}`})
            if (food.data.length==0){
              console.log("no")
              this.data.items.push({ msg: y, type: x, dateTime: (new Date()).toISOString() })
              this.data.data.push({ key: x, value: y })  
            }else{
              if (food.data.length==1){
                console.log("one", `${ food.data[0].split(":")[1] }`)
                res2 = await util.request({
                  url: `${app.globalData.baseURL}/food/${food.data[0].split(":")[1]}/${y.value}/${y.unit}`
                })
              }else{
                console.log("multi")
                let idx = await util.showActionSheet(food.data)
                res2 = await util.request({
                  url: `${app.globalData.baseURL}/food/${food.data[idx].split(":")[1]}/${y.value}/${y.unit}`})
              }
              this.data.items.push({
                msg: {
                  stuff: res2.data.name,
                  value: y.value,
                  unit: y.unit,
                  nutrition: res2.data.nutrition,
                  imgHash: res2.data.imgHash,
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
            }
          }else{
            this.data.items.push({msg:y, type: x, dateTime: (new Date()).toISOString() })
            this.data.data.push({key:x,value:y})
          }
        }))
      }))
    }
    console.log("data！！:",this.data.items)
    this.setData({
      items: this.data.items,
      "currIdx": this.data.items.length - 1
    })  
  },
  _onCameraTap(){
    if (!this.data.isCamera){
      this.setData({isCamera:true})
    }
  },
  async _takePhoto(){
    let res,res1,res2,res3
    res = await util.chooseImage(true)
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
      try{
        res1 = await util.uploadFile({
            url:`${app.globalData.baseURL}/img/upload`,
            filePath:tempFilePath,
            name:"img",
          }, pg, "loading")
        let hash = JSON.parse(res1.data).hash
        console.log("uploadFile end:", res1.data)
        this.data.currentImgHash = hash
        util.setClipboardData(hash)
        this.setData({
          ["items[" + (this.data.items.length - 1) + "].msg"]: hash
        })
      }catch(err){
        console.log("uploadFile end:", err)
      }
      //识别这张图片
      res2 = await util.readFile({
          filePath:tempFilePath,
          encoding:"base64"
      })
      console.log("res2",res2)
      try{
        res3=await util.request({
          url: "https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general?access_token=24.a17d67af3872c1938ede5b73021f0e2e.2592000.1583635267.282335-18405725",
          method: "post",
          header: { "content-type": "application/x-www-form-urlencoded" },
          data: {
            image: res2.data,
            baike_num: 0
          }
        })
        console.log(res3)
        util.showToast("success")
        this.setData({
          ["items[" + (this.data.items.length - 1) + "].what"]: res3.data.result[0]
        })
      }catch(err){
        util.showModal("警告", JSON.stringify(err))
      }
    }
    this.setData({isCamera:false})
  },
  async _onQrcodeTap(){
    console.log("start qrcode")
    try{
      let res = await util.scanCode()
      let res1 = await  util.request({
        url: `${app.globalData.baseURL}/food/id/${res.result}`
      })
      if (res1.data){
        this.setData({currentEat: res1.data.name})
        console.log("this.data.currentEat", this.data.currentEat)
        this._add({imgHash:res1.data.imgHash,msg:res1.data.name+",吃了多少？"}, "info")
      }else{
        this.setData({currentEat:""})
        this._add({msg:"未能识别"+res.result+",它是什么？"}, "info")
      }
    }catch(err){
      console.log("_onQrcoceTap:",err)
    }
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