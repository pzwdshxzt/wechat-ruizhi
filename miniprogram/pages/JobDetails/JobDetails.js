// miniprogram/pages/Job/JobDetails.js
const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    JobDetails: { },
    authCode: ['待审核', '已拒绝', '审核通过'],
    isAuthFlag: false,
    applyTextarea: '',
    radioItems: [
      { name: '拒绝', value: 1 },
      { name: '同意', value: 2, checked: true }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.openLoading('数据加载中')
    db.collection('JobDetails').doc(options.JobDetailsId).get().then(res => {
      this.setData({
        JobDetails: res.data
      })
      if (!util.checkObject(options.isAuthFlag) && res.data.authFlag === 0) {
        this.setData({
          isAuthFlag: true
        })
      }
      util.closeLoading()
    })
  },
  agreeApply:function(e){
    let authFlag = 0
    var radioItems = this.data.radioItems;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      if (radioItems[i].checked){
        authFlag = radioItems[i].value
      }
    }
    db.collection('JobDetails').doc(this.data.JobDetails._id).update({
      data: {
        // 表示将 done 字段置为 true
        authFlag: authFlag,
        authApplyTextarea: this.data.applyTextarea 
      },
      success: res => {  
          db.collection('Jobs').doc(this.data.JobDetails.JobId).get({
            success: res => {
              if (authFlag === 2) {
                let newCount = res.data.doneCount + this.data.JobDetails.applyCount
                db.collection('Jobs').doc(res.data._id).update({
                  data: {
                    doneCount: newCount
                  }
                }).then(
                  util.successPage('审核成功', '你已经审核成功了')
                )
                this.callPlanFuncation(e.detail.formId, this.data.JobDetails._openid, '审核通过', res.data.inviteName, res.data._id)
              }
              if (authFlag === 1) {
                util.successPage('审核成功', '你已经审核成功了')
                this.callPlanFuncation(e.detail.formId, this.data.JobDetails._openid, '已拒绝', res.data.inviteName, res.data._id)
              }          
            },
            fail: res => {
              util.failPage('审核失败', '未提交数据，可以重新审核！！')
            }
          }) 
      },
      fail: res => {
        util.failPage('审核失败', '但是数据已经提交,未更新总数！！')
      }
    })
  },
  applyTextarea: function (e) {
    this.setData({
      applyTextarea: e.detail.value
    })
  },
  radioChange: function (e) {
    var radioItems = this.data.radioItems;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      radioItems[i].checked = radioItems[i].value == e.detail.value;
    }

    this.setData({
      radioItems: radioItems
    });
  },
  callPlanFuncation(formId, touser, result, inviteName ,JobId) {
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