const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
const dbConsole = require('../../Utils/DbConsole.js');
const app = getApp()
const buttons = [{
    openType: 'contact',
    label: 'Contact',
    icon: '/images/icon/contact.png',
  },
  {
    label: 'Delete Job',
    icon: '/images/icon/delete.png'
  }
]
Page({
  data: {
    buttons: buttons,
    statusCode: app.globalData.statusCode,
    authCode: app.globalData.authCode,
    job: {},
    jobDetails: [],
    progress: 0,
    jobDetailsTotalCount: 0,
    isloadmore: false,
    loading: true
  },
  onLoad: function(options) {
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
        }).orderBy('date', 'desc')
        .orderBy('time', 'desc')
        .limit(10)
        .get().then(res => {
          this.setData({
            jobDetails: res.data,
            loading: false
          })
        })
    })
  },
  openApplyPage() {
    wx.navigateTo({
      url: 'Apply?JobId=' + this.data.job._id + '&pid=' + this.data.job.planId
    })
  },
  onClick(e) {
    if (e.detail.index === 1) {
      if (this.data.job.status === 1) {
        wx.showModal({
          title: '提示',
          content: '该计划已完成不能删除'
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '是否真的放弃这个任务计划',
          success: res => {
            if (res.confirm) {
              dbConsole.updateJobStatus(this.data.job._id, 2).then(res => {
                util.homePage()
              }).catch(res => {
                wx.showToast({
                  title: '放弃计划失败',
                  icon: 'none'
                })
              })
            }
          }
        })
      }
    }
  },
  onContact(e) {
    console.log('onContact', e)
  },
  onChange(e) {},

  gotoPlanDetails: function() {
    wx.navigateTo({
      url: 'ShowPlanDetails?PlanId=' + this.data.job.planId,
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