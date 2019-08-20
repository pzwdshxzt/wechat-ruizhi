// miniprogram/pages/Job/JobDetails.js
const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
const dbConsole = require('../../Utils/DbConsole.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jobDetails: {},
    authCode: ['待审核', '已拒绝', '审核通过'],
    isAuthFlag: false,
    applyTextarea: '',
    radioItems: [{
        name: '拒绝',
        value: 1
      },
      {
        name: '同意',
        value: 2,
        checked: true
      }
    ],
    inputNum: 0
  },
  onLoad: function(options) {
    util.openLoading('数据加载中')
    db.collection('JobDetails').doc(options.JobDetailsId).get().then(res => {
      this.setData({
        jobDetails: res.data
      })
      if (!util.checkObject(options.isAuthFlag) && res.data.authFlag === 0) {
        this.setData({
          isAuthFlag: true
        })
      }
      util.closeLoading()
    })
  },
  agreeApply: function(e) {
    util.openLoading('正在玩命申请中')
    let authFlag = 0
    var radioItems = this.data.radioItems;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      if (radioItems[i].checked) {
        authFlag = radioItems[i].value
      }
    }
    dbConsole.updateJobDetails(this.data.jobDetails._id, authFlag, this.data.applyTextarea).then(res => {
      debugger
      if (authFlag === 2) {
        db.collection('Jobs').doc(this.data.jobDetails.jobId).get().then(jobs => {
          let newCount = jobs.data.doneCount + this.data.jobDetails.applyCount
          dbConsole.updateJobs(jobs.data._id, newCount).then(res => {
            this.callPlanFuncation(this.data.jobDetails.formId, this.data.jobDetails._openid, '审核通过', jobs.data.inviteName, jobs.data._id)
            util.successPage('审核成功', '您已经审核成功了')
            util.closeLoading()
            if (newCount >= jobs.data.inviteCount) {
              dbConsole.updateJobStatus(jobs.data._id, 1)
            }
          }).catch(res => {
            util.failPage('审核失败', '但是数据已经提交,未更新总数！！')
            util.closeLoading()
          })
        })
      }
      if (authFlag === 1) {
        db.collection('Jobs').doc(this.data.jobDetails.jobId).get().then(jobs => {
          this.callPlanFuncation(this.data.jobDetails.formId, this.data.jobDetails._openid, '已拒绝', jobs.data.inviteName, jobs.data._id)
          util.successPage('审核成功', '您已经审核成功了')
          util.closeLoading()
        })
      }
    }).catch(res => {
      console.log(res)
      util.failPage('审核失败', '未提交数据，可以重新审核！！')
    });

  },
  applyTextarea: function(e) {
    this.setData({
      inputNum: e.detail.value.length,
      applyTextarea: e.detail.value
    })
  },
  radioChange: function(e) {
    var radioItems = this.data.radioItems;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      radioItems[i].checked = radioItems[i].value == e.detail.value;
    }

    this.setData({
      radioItems: radioItems
    });
  },
  callPlanFuncation(formId, touser, result, inviteName, JobId) {
    wx.cloud.callFunction({
      name: 'openapi',
      data: {
        action: 'auth',
        formId: formId,
        touser: touser,
        JobId: JobId,
        inviteName: inviteName,
        date: util.formatDateTime(new Date()),
        result: result,
        content: this.data.applyTextarea
      },
      success: res => {
        console.warn('[云函数] [openapi] templateMessage.send 调用成功：', res)
      },
      fail: err => {
        console.error('[云函数] [openapi] templateMessage.send 调用失败：', err)
      }
    })
  }
})