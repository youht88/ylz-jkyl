const app=getApp()
const {util}=require("../../utils/util.js")
class Query{
  async parseDateRange(value){
    var sDate, eDate, temp
      temp = await util.request({
        url: `${app.globalData.baseURL}/moment/parse/${value}`
      })
      console.log("建议.日期区间", temp.data)
      eDate = temp.data.eDate
      sDate = temp.data.sDate
      if (!sDate) sDate = eDate
      console.log("sDate",sDate,"eDate",eDate)
    return {sDate,eDate}
  }
  async isQuery(value,inputPage) {
    var option
    var res1,res2
    var sDate,eDate,temp,temp1
    if (value.match("(体重).*(情况|分析|查看|检查|状况|状态|怎么样|变化)")||
        value.match("体重$")) {
      temp = await this.parseDateRange(value)
      sDate = temp.sDate
      eDate = temp.eDate
      temp = util.list2rangeJson(inputPage.data.data, "sign_weightKg", sDate, eDate)
      if (!temp.value["sign_weightKg"]) {
        await util.showModal("结果", "没有查到数据")
      }else{
        option = this.graphWeight(temp.value["sign_weightKg"],sDate,eDate)
        wx.navigateTo({
          url: `/pages/chart/chart?data=${JSON.stringify([{name:"体重分析",width:"100%",height:"100%",option:option}])}`,
        })
      }
    } else if (value.match("(饮食|进食).*(情况|分析|查看|检查|状况|状态|怎么样|变化)")||
               value.match("饮食$")) {
      temp = await this.parseDateRange(value)
      sDate = temp.sDate
      eDate = temp.eDate
      temp = util.list2rangeJson(inputPage.data.data, "eat", sDate, eDate)
      if (!temp.value.eat) {
        await util.showModal("结果", "没有查到数据")
      }else{
        console.log("建议.按区间要求的json列表数据:", JSON.stringify(temp, null, 4))
        temp1 = "能量摄入达:" + temp.value.eat.reduce((x, y) => { return x + (y.nutrition.energyKj ? y.nutrition.energyKj[0] : 0) }, 0) + "千焦"
        util.speech(temp1, false)
        inputPage._add({ msg: temp1 }, "info")
        res1 = await util.request({
          url: `${app.globalData.baseURL}/food/analyse`,
          method: "post",
          data: {
            data: JSON.stringify(temp.value.eat),
            sDate: sDate,
            eDate: eDate
          }
        })
        console.log("建议2:", res1.data)
        wx.navigateTo({
          url: `/pages/chart/chart?data=${JSON.stringify(res1.data)}`,
        })
      }
    }else if (value == "动态图") {
      option = this.graphDynamic()
    }else{
      console.log("query.js:不是query语句")
      return false
    }
    //this.data.items.push({ msg: "I am echart", type: "chart", option: option, dateTime: (new Date()).toISOString() })
    inputPage.data.items.push({msg:value,type:"saying",who:"self"})
    temp = "items[" + (inputPage.data.items.length - 1) + "]"
    inputPage.setData({
      value:"",
      [temp]: inputPage.data.items[inputPage.data.items.length - 1],
      "currIdx": inputPage.data.items.length - 1
    })
    return true
  }
  graphWeight(data,sDate,eDate) {
    console.log("!!!!!", data)
    var option = {
      title: {
        text: '体重情况(公斤)',
        left:'center',
        subtext: (sDate?sDate:"")+"-"+(eDate?eDate:""),
        backgroundColor:"rgb(256,0,0)"
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(x => {
          return `${x.eDate.substr(5)}\n${x.eTime.substr(0,5)}`
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
        data: data.map(x => {
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
    console.log("option:", option)
    return option
  }
  _graphDynamic() {
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
}
exports.query=new Query()
