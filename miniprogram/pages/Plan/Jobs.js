// miniprogram/pages/Plan/Jobs.js
const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    job: {},
    jobId: '',
    jobDetails: [],
    progress: 0,
    authCode: app.globalData.authCode,
    statusCode: app.globalData.statusCode,
    isloadmore: false,
    jobDetailsTotalCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    util.openLoading('数据加载中')
    db.collection('JobDetails').where({
      jobId: options.JobId
    }).count().then(res => {
      this.setData({
        jobDetailsTotalCount: res.total
      })
    })
    db.collection('Jobs').doc(options.JobId).get().then(res => {
      this.setData({
        job: res.data,
      })
      let progress = util.getPercent(res.data.doneCount, res.data.inviteCount)
      this.setData({
        progress: progress
      })
      db.collection('JobDetails').where({
          jobId: res.data._id
        })
        .limit(10)
        .orderBy('date', 'desc')
        .orderBy('time', 'desc')
        .get().then(res => {
          this.setData({
            jobDetails: res.data
          })
          util.closeLoading()
        })
    })
  },
  onReachBottom: function() {
    this.setData({
      isloadmore: true
    })
    var that = this;
    if (this.data.jobDetails.length < this.data.jobDetailsTotalCount) {
      db.collection('JobDetails')
        .where({
          jobId: this.data.job._id
        })
        .orderBy('date', 'desc')
        .orderBy('time', 'desc')
        .skip(this.data.jobDetails.length)
        .limit(10)
        .get().then(res => {
          if (res.data.length > 0) {
            var jobDetails = {};
            jobDetails = that.data.jobDetails.concat(res.data);
            that.setData({
              jobDetails: jobDetails,
            })
          } 
          this.setData({
            isloadmore: false
          })
        }).catch(res => {
          console.log("======" + res);
        })
    } else {
      this.setData({
        isloadmore: false
      })
    }
  }
})