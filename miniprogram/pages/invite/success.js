// miniprogram/pages/success/success.js
const util = require('../../Utils/Util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '计划发布成功',
    content: '该计划已提交成功！',
    planId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      planId: options.planId
    })
  },
  backTohome: function() {
    util.homePage()
  },
  shareMenu: function() {
    wx.showToast({
      title: '点击右上角分享给好友',
      icon: 'none'
    })
  },
  onShareAppMessage: function() {
    return {
      path: '/pages/invited/invited?planId=' + this.data.planId,
      desc: '快来完成我发布的计划吧',
      imageUrl: '/images/invite/share_' + util.getRandInt(0, 4) + '.png',
      success: function(res) {
        console.log('转发成功', res)
      }
    }
  },
})