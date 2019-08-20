const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    isloadmore: false,
    list: [],
    cardInfosTotalCount: 0
  },
  onLoad: function(options) {
    db.collection('CardInfos').count().then(res => {
      this.setData({
        cardInfosTotalCount: res.total
      })
    })
  },
  addCard: function(e) {
    wx.navigateTo({
      url: 'addCard',
    })
  },
  onShow: function(options) {
    let that = this
    db.collection('CardInfos').orderBy('timestamp', 'desc').limit(10).get().then(res => {
      res.data.map(res => {
        if (res.type === 1) {
          res.number = res.number.replace(/(.{4})/g, "$1 ")
        }
      })
      that.setData({
        list: res.data,
        loading: false
      })
    })
  },
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },
  deleteCardInfo(e) {
    let id = e.currentTarget.dataset.id
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定删除改卡信息',
      success: function(e) {
        if (e.confirm) {
          db.collection('CardInfos').doc(id).remove().then(res => {
            if (res.stats.removed === 1) {
              wx.showToast({
                title: '删除成功',
              })
              that.onShow()
            } else {
              wx.showToast({
                icon: 'none',
                title: '删除失败'
              })
            }
          })
        }
      }
    })
    console.log(e)
  },
  onReachBottom: function() {
    this.setData({
      isloadmore: true
    })
    let that = this;
    if (this.data.list.length < this.data.cardInfosTotalCount) {
      db.collection('CardInfos')
        .skip(this.data.list.length)
        .orderBy('timestamp', 'desc').limit(10)
        .get().then(res => {
          if (res.data.length > 0) {
            let cardInfos = {};
            res.data.map(res => {
              if (res.type === 1) {
                res.number = res.number.replace(/(.{4})/g, "$1 ")
              }
            })
            cardInfos = that.data.list.concat(res.data);
            that.setData({
              list: cardInfos,
            })
          }
          this.setData({
            isloadmore: false
          })
        }).catch(res => {
          console.log("======" + res);
        })
    } else {
      this.setData({
        isloadmore: false
      })
    }
  }
})