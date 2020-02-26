Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  properties: {
    stepItems:{type:Array},
  },
  data: {
    scroll:0,
    index:0
  },
  methods: {
    scrollSteps() {
      this.setData({
        scroll: this.data.scroll == 9 ? 0 : this.data.scroll + 1
      })
    }
  }
})
