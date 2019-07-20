// miniprogram/pages/Job/ShowPlanDetails.js
const util = require('../../Utils/Util.js');
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    plan: {},
    authCode: ['待审核', '已拒绝', '审核通过'],
    statusCode: ['进行中', '计划废弃'],
    typeCode: ['打卡'],
    showCode: ['否', '是']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    util.openLoading('数据加载中')
    db.collection('Plans').doc(options.PlanId).get().then(res => {
      this.setData({
        plan: res.data
      })
    })
    util.closeLoading()
  }
})