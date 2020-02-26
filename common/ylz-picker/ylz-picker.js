const app = getApp();
Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  properties:{
    type: {type:String},
    title:{type:String},
    index:{type:Number}, //0
    multiIndex: {type:Array}, //[0, 0, 0],
    time: {type:String}, //'12:01',
    date: {type:String}, //'2018-12-25',
    region: {type:Array}, //['广东省', '广州市', '海珠区'],
    picker: { type: Array },//['早','中','晚']
    multiArray:{type:Array}, 
  },
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    multiArray: [
      ['无脊柱动物', '脊柱动物'],
      ['扁性动物', '线形动物', '环节动物', '软体动物', '节肢动物'],
      ['猪肉绦虫', '吸血虫']
    ],
    objectMultiArray: [
      [{
        id: 0,
        name: '无脊柱动物'
      },
      {
        id: 1,
        name: '脊柱动物'
      }
      ],
      [{
        id: 0,
        name: '扁性动物'
      },
      {
        id: 1,
        name: '线形动物'
      },
      {
        id: 2,
        name: '环节动物'
      },
      {
        id: 3,
        name: '软体动物'
      },
      {
        id: 3,
        name: '节肢动物'
      }
      ],
      [{
        id: 0,
        name: '猪肉绦虫'
      },
      {
        id: 1,
        name: '吸血虫'
      }
      ]
    ]
  },
  methods:{
    PickerChange(e) {
      console.log(e);
      this.setData({
        index: e.detail.value
      })
      this.triggerEvent("change", { "index": e.detail.value })
    },
    MultiChange(e) {
      this.setData({
        multiIndex: e.detail.value
      })
    },
    MultiColumnChange(e) {
      let data = {
        multiArray: this.data.multiArray,
        multiIndex: this.data.multiIndex
      };
      data.multiIndex[e.detail.column] = e.detail.value;
      switch (e.detail.column) {
        case 0:
          switch (data.multiIndex[0]) {
            case 0:
              data.multiArray[1] = ['扁性动物', '线形动物', '环节动物', '软体动物', '节肢动物'];
              data.multiArray[2] = ['猪肉绦虫', '吸血虫'];
              break;
            case 1:
              data.multiArray[1] = ['鱼', '两栖动物', '爬行动物'];
              data.multiArray[2] = ['鲫鱼', '带鱼'];
              break;
          }
          data.multiIndex[1] = 0;
          data.multiIndex[2] = 0;
          break;
        case 1:
          switch (data.multiIndex[0]) {
            case 0:
              switch (data.multiIndex[1]) {
                case 0:
                  data.multiArray[2] = ['猪肉绦虫', '吸血虫'];
                  break;
                case 1:
                  data.multiArray[2] = ['蛔虫'];
                  break;
                case 2:
                  data.multiArray[2] = ['蚂蚁', '蚂蟥'];
                  break;
                case 3:
                  data.multiArray[2] = ['河蚌', '蜗牛', '蛞蝓'];
                  break;
                case 4:
                  data.multiArray[2] = ['昆虫', '甲壳动物', '蛛形动物', '多足动物'];
                  break;
              }
              break;
            case 1:
              switch (data.multiIndex[1]) {
                case 0:
                  data.multiArray[2] = ['鲫鱼', '带鱼'];
                  break;
                case 1:
                  data.multiArray[2] = ['青蛙', '娃娃鱼'];
                  break;
                case 2:
                  data.multiArray[2] = ['蜥蜴', '龟', '壁虎'];
                  break;
              }
              break;
          }
          data.multiIndex[2] = 0;
          break;
      }
      this.setData(data);
    },
    TimeChange(e) {
      this.setData({
        time: e.detail.value
      })
      this.triggerEvent("change", { "time": e.detail.value })
    },
    DateChange(e) {
      this.setData({
        date: e.detail.value
      })
      this.triggerEvent("change",{"date":e.detail.value})
    },
    RegionChange: function (e) {
      this.setData({
        region: e.detail.value
      })
      this.triggerEvent("change", { "region": e.detail.value })
    }  
  }
})
