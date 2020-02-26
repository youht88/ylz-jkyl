Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  properties: {
    show:{
      type:Boolean,
      value:false
    },
    color: {
      type: String,
      value:"green"
    },
    striped: {
      type: Boolean,
      value: false
    },
    active: {
      type: Boolean,
      value: false
    },
    loading:{
      type: Number,
      value: 0
    }
  }
})
