// miniprogram/pages/Job/Job.js
const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    job:{},
    openId:'',
    jobId: '',
    JobDetails: [],
    progress: 0,
    authCode:['待审核','已拒绝','审核通过'],
    planUid: ''
  },
  onLoad: function (options) {
    console.log(options)
    db.collection('Jobs').doc(options.JobId).get().then(res => {
      this.setData({
        job: res.data,
        openId: options.uid,
        planUid: options.planUid
      })
      let progress = this.getPercent(res.data.doneCount, res.data.inviteCount)
      this.setData({
        progress: progress
      })
      db.collection('JobDetails').where({
        JobId:res.data._id
        }).get().then(res => {
          this.setData({
            JobDetails: res.data
          })
        })
    })  
  },
  openApplyPage(){
    wx.navigateTo({
      url: 'Apply?JobId=' + this.data.job._id + '&uid=' + this.data.openId + '&pid=' + this.data.job.planId + '&planUid='+ this.data.planUid
    })
  },
  getPercent: function (num, total) {
    console.log(num)
    console.log(total)
    num = parseFloat(num);
    total = parseFloat(total);
    if (isNaN(num) || isNaN(total)) {
      return "-";
    }
    return total <= 0 ? 0 : (Math.round(num / total * 10000) / 100.00);
  }
})