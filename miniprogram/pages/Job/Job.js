const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
const dbConsole = require('../../Utils/DbConsole.js');
Page({
  data: {
    sAngle: 0,
    eAngle: 360,
    spaceBetween: 10,
    buttons: [{
        openType: 'contact',
        label: 'Contact',
        icon: '/images/contact.png',
      },
      {
        label: 'Delete Job',
        icon: '/images/delete.png'
      }
    ],
    job: {},
    jobId: '',
    JobDetails: [],
    progress: 0,
    statusCode: ['进行中', '已完成', '放弃', '计划废弃'],
    authCode: ['待审核', '已拒绝', '审核通过'],
    planUid: '',
    jobDetailsTotalCount: 0,
    isloadmore: false
  },
  onLoad: function(options) {
    util.openLoading('数据加载中')
    db.collection('JobDetails').where({
      JobId: options.JobId
    }).count().then(res => {
      this.setData({
        jobDetailsTotalCount: res.total
      })
    })
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
        }).orderBy('date', 'desc')
        .orderBy('time', 'desc')
        .limit(10)
        .get().then(res => {
          this.setData({
            JobDetails: res.data
          })
          util.closeLoading()
        })
    })
  },
  openApplyPage() {
    wx.navigateTo({
      url: 'Apply?JobId=' + this.data.job._id + '&pid=' + this.data.job.planId + '&planUid=' + this.data.planUid
    })
  },
  getPercent: function(num, total) {
    num = parseFloat(num);
    total = parseFloat(total);
    if (isNaN(num) || isNaN(total)) {
      return "-";
    }
    return total <= 0 ? 0 : (Math.round(num / total * 10000) / 100.00);
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
  onAngle(e) {
    console.log(e)
    const {
      value
    } = e.detail
    const sAngle = value ? -90 : 0
    const eAngle = value ? -210 : 360
    const spaceBetween = value ? 30 : 10

    this.setData({
      sAngle,
      eAngle,
      spaceBetween,
    })
  },
  gotoPlanDetails: function() {
    wx.navigateTo({
      url: 'ShowPlanDetails?PlanId=' + this.data.job.planId,
    })
  },
  onReachBottom: function() {
    console.log('111111111111')
    this.setData({
      isloadmore: true
    })
    var that = this;
    if (this.data.JobDetails.length < this.data.jobDetailsTotalCount) {
      console.log('in')
      db.collection('JobDetails')
        .where({
          JobId: this.data.job._id
        })
        .orderBy('date', 'desc')
        .orderBy('time', 'desc')
        .skip(this.data.JobDetails.length)
        .limit(10)
        .get().then(res => {
          console.log(res)
          if (res.data.length > 0) {
            var jobDetails = {};
            jobDetails = that.data.JobDetails.concat(res.data);
            that.setData({
              JobDetails: jobDetails,
            })
          }
          this.setData({
            isloadmore: false
          })
        }).catch(res => {
          console.log("======" + res);
        })
    } else {
      console.log('empty')
      this.setData({
        isloadmore: false
      })
    }
  }
})