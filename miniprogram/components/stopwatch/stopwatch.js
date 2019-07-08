Component({
  data: {
    text: '00:00.000'
  },
  methods: {
    start: function() {
      var convertTimeStampToString = function(ts) {
        var ms = String(1000 + Math.floor(ts) % 1000).slice(1)
        var s = String(100 + Math.floor(ts / 1000) % 60).slice(1)
        var m = Math.floor(ts / 60000)
        if (m < 10) m = '0' + m
        return m + ':' + s + '.' + ms
      }
      this.setData({
        text: convertTimeStampToString(0)
      })
      var startTime = Date.now()
      var self = this
      this._interval = setInterval(function() {
        self.setData({
          text: convertTimeStampToString(Date.now() - startTime)
        })
      }, 33)
    },
    stop: function() {
      clearInterval(this._interval)
    }
  }
})
