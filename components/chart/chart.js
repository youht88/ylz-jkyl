import * as echarts from '../../ec-canvas/echarts';
Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  properties: {
    item: {
      type: Object
    }
  },
  data: {
    ec:{
      lazyLoad:true
    }
  },
  lifetimes:{
    ready:function(){
      this.echartComponent = this.selectComponent("#echart1")
      this.initChart()
    }
  },
  methods:{
   initChart:function(){
     this.echartComponent.init((canvas, width, height)=>{
      console.log("hello I am here!")
      const chart = echarts.init(canvas, null, {
          width: width,
          height: height
      });
      chart.setOption(this.data.item.option);
      return chart;
    })
   }
  }
});
