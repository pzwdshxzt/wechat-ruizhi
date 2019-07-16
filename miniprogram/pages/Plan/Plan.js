// miniprogram/pages/Plan/Plan.js
const db = wx.cloud.database()
const util = require('../../Utils/Util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    plan: {},
    Jobs: [],
    authCode: ['待审核', '已拒绝', '审核通过']
  },
  onLoad: function(options){
    util.openLoading('数据加载中')
    db.collection('Plans').doc(options.PlanId).get().then(res => {
      this.setData({
        plan: res.data
      })
    })
    db.collection('Jobs').where({
      planId: options.PlanId
    }).get().then(res => {
      this.setData({
        Jobs: res.data
      })
    })
    
    util.closeLoading()
  },
  onShareAppMessage: function () {
    return {
      title: '邀请您完成计划',
      path: '/pages/invited/invited?planId=' + this.data.plan._id,
      success: function (res) {
        console.log('转发成功', res)
      }
    }
  }
})