// miniprogram/pages/Plan/Plan.js

const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    plan: {},
    authJobs:[],
    authCode: ['待审核', '已拒绝', '审核通过']
  },
  onLoad: function(options){
    util.openLoading('数据加载中')
    db.collection('Plans').doc(options.PlanId).get().then(res => {
      this.setData({
        plan: res.data,
        openId: options.uid
      })
      db.collection('JobDetails').where({
        planId: options.PlanId
      }).get().then(res => {
        util.closeLoading()
        this.setData({
          authJobs: res.data
        })
      })
    })
  }
})