// pages/help/help.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
     cmdList:[
       {"title":"您可以这样说","items":[
          "刚才称了一下，体重75.5公斤",
          "半个小时前吃了一个苹果和两个香蕉",
          "上周五下午走了2184步"
       ]},
       {"title":"寻求帮助时，可以这样说","items":[
          "我不知道该怎么说",
          "给我一些提示",
          "帮助我",
          "这东东怎么使用？"
       ]},
       {"title":"查询数据时，可以这样说","items":[
          "昨天到今天的体重变化情况",
          "给我点今天饮食的建议"
       ]}
     ]
  },

  onUnload: function () {
    console.log("onUnload")
    var pages = getCurrentPages();
    pages[pages.length - 2].setData({ value: this.data.command })
  },

  _onBack(e){
    this.data.command=e.currentTarget.dataset.cmd
    wx.navigateBack({
      delta: 1
    })
  }
})