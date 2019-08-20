const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },
  addCard: function(e) {
    wx.navigateTo({
      url: 'addCard',
    })
  },
  onShow: function(options) {
    let that = this
    db.collection('CardInfos').get().then(res => {
      that.setData({
        list: res.data
      })
    })
  },
  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
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
            if(res.stats.removed === 1){
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
  }
})