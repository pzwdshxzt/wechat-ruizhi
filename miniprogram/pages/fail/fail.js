// miniprogram/pages/fail/fail.js
const util = require('../../Utils/Util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '交易失败',
    content: '交易失败，请稍后再试!'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    if (!util.checkObject(options.title)) {
      this.setData({
        title: options.title
      })
    }
    if (!util.checkObject(options.content)) {
      this.setData({
        content: options.content
      })
    }
  },
  backTohome: function() {
    util.homePage()
  }
})