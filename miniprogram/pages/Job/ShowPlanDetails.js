// miniprogram/pages/Job/ShowPlanDetails.js
const util = require('../../Utils/Util.js');
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    plan: {},
    authCode: app.globalData.authCode,
    statusCode: app.globalData.statusCode,
    typeCode: app.globalData.typeCode,
    showCode: app.globalData.showCode,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    db.collection('Plans').doc(options.PlanId).get().then(res => {
      this.setData({
        plan: res.data,
        loading: false
      })
    })
  }
})