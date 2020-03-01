import * as echarts from '../../ec-canvas/echarts';
Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  properties: {
    item: {type: Object},
    index:{type: Number}
  },
  data: {
    ec:{
      lazyLoad:true
    }
  },
  lifetimes:{
    ready:function(){
      this.echartComponent = this.selectComponent("#echart"+this.data.index)
      this.initChart()
    }
  },
  methods:{
   initChart:function(){
     this.echartComponent.init((canvas, width, height)=>{
      const chart = echarts.init(canvas, null, {
          width: width,
          height: height
      });
      console.log("setoption:",this.data.item.option)
      chart.setOption(this.data.item.option,true,true);
      return chart;
    })
   }
  }
});
