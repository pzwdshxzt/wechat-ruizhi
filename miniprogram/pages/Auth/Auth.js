// miniprogram/pages/Auth/Auth.js
const util = require('../../Utils/Util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  onGetUserInfo: function() {
    var context = this;
    const version = wx.getSystemInfoSync().SDKVersion

    if (util.compareVersion(version, '1.3.0') >= 0) {
      wx.openBluetoothAdapter()
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
    wx.getUserInfo({
      success: res => {
        this.setData({
          userInfo: res.userInfo
        })
        app.globalData.userInfo = res.userInfo
        wx.navigateBack()
      }
    })
  },
  backPage:function(){
    util.backPage(1)
  }
})