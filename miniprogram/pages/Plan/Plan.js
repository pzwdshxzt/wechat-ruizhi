// miniprogram/pages/Plan/Plan.js

const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
const dbConsole = require('../../Utils/DbConsole.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    plan: {},
    Jobs:[],
    authCode: ['待审核', '已拒绝', '审核通过']
  },
  onLoad: function(options){
    util.openLoading('数据加载中')
    db.collection('Plans').doc(options.PlanId).get().then(res => {
     
      this.setData({
        plan: res.data
      })
      /**
       * 查询plan
       */
      dbConsole.queryJobs(options.PlanId).then(res => {
        res.forEach(obj => {
          dbConsole.queryUserInfos(obj.jober).then(u => {
            let userInfo = u[0]
            if (!util.checkObject(userInfo)){
              db.collection('JobDetails').where({
                _openid: userInfo._openid
              }).get().then(JobDetails => {
                obj.userInfo.JobDetails = JobDetails.data
              })
              obj.userInfo = userInfo
            }
          })
            this.setData({
              Jobs: res
            })
        })

      })
      
      console.log(this.data.Jobs)
      util.closeLoading()
      
    })
  },
  onShareAppMessage: function () {
    return {
      title: '邀请您完成计划',
      path: '/pages/invited/invited?planId=' + this.data.plan._id,
      success: function (res) {
        console.log('转发成功', res)
      }
    }
  },
})