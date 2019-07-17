// miniprogram/pages/Plan/Jobs.js
const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    job: {},
    jobId: '',
    JobDetails: [],
    progress: 0,
    authCode: ['待审核', '已拒绝', '审核通过'],
    statusCode: ['进行中', '已完成', '放弃', '计划废弃'],
    planUid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.openLoading('数据加载中')
    db.collection('Jobs').doc(options.JobId).get().then(res => {
      this.setData({
        job: res.data,
        planUid: res.data.planUid
      })
      let progress = this.getPercent(res.data.doneCount, res.data.inviteCount)
      this.setData({
        progress: progress
      })
      db.collection('JobDetails').where({
        JobId: res.data._id
      }).get().then(res => {
        this.setData({
          JobDetails: res.data
        })
        util.closeLoading()
      })
    })  
  },
  getPercent: function (num, total) {
    num = parseFloat(num);
    total = parseFloat(total);
    if (isNaN(num) || isNaN(total)) {
      return "-";
    }
    return total <= 0 ? 0 : (Math.round(num / total * 10000) / 100.00);
  }
})