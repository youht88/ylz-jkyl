import * as echarts from '../../ec-canvas/echarts';

Page({
  data: {
    ec: {lazyLoad: true},
    options:null
  },
  onLoad(args){
    this.setData({options : JSON.parse(args.data)})
    this.data.options.map((x,i)=>{
      var c = this.selectComponent("#echart"+i)
      c.init((canvas, width, height) => {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        console.log("setoption:", this.data.options[i])
        chart.setOption(this.data.options[i].option, true, true);
        return chart;
      })
    })
  }
});