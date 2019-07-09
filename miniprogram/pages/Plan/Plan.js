// miniprogram/pages/Plan/Plan.js

const db = wx.cloud.database()
const _ = db.command
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
    console.log(options)
    db.collection('Plans').doc(options.PlanId).get().then(res => {
      this.setData({
        plan: res.data,
        openId: options.uid
      })
      db.collection('JobDetails').where({
        planId: options.PlanId
      }).get().then(res => {
        this.setData({
          authJobs: res.data
        })
      })
    })
  }
})