Component({
  data: {
    show: [
      '/images/loading/loading-white.gif',
      '/images/loading/rhomb-white.gif',
      '/images/loading/loading-1.gif'
    ],
    num: 9
  },
  lifetimes: {
    attached: function() {
      this.setData({
        num: Math.floor(Math.random() * (3))
      })
    }
  }
})