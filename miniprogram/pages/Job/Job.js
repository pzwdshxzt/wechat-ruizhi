// miniprogram/pages/Job/Job.js
const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    job:{},
    openId:'',
    jobId: '',
    JobDetails: [],
    authCode:['待审核','已拒绝','审核通过']
  },
  onLoad: function (options) {
    console.log(options)
    db.collection('Jobs').doc(options.JobId).get().then(res => {
      this.setData({
        job: res.data,
        openId: options.uid
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
      url: 'Apply?JobId=' + this.data.job._id + '&uid=' + this.data.openId + '&pid=' +this.data.job.planId
    })
  },
  trunDetails(e){
    wx.navigateTo({
      url: '../JobDetails/JobDetails?JobDetails=' + JSON.stringify(object)
    })
  }
})