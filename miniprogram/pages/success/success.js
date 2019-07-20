// miniprogram/pages/success/success.js
const util = require('../../Utils/Util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '交易成功',
    content: '该交易已提交成功！'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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