// miniprogram/pages/Job/Apply.js
const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    date: util.formatDate(new Date()),
    time: util.formatTime(new Date()),
    applyCount: 0,
    applyCountList: [0,1,2,3,4,5],
    applyTextarea: '',
    JobId: '',
    uid: '',
    pid: '',
    planUid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      uid: options.uid,
      JobId: options.JobId,
      pid: options.pid,
      planUid: options.planUid
    })
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  }, 
  bindApplyCount: function (e) {
    this.setData({
      applyCount: Number(e.detail.value)
    })
  }, 
  applyTextarea: function (e) {
    this.setData({
      applyTextarea: e.detail.value
    })
  },
  checkInfo:function(){
    if (0 === this.data.applyCount || util.checkObject(this.data.applyCount) ) {
      wx.showModal({
        content: '请选择打卡期数',
        showCancel: false,
        success: function (res) {
        }
      });
      return false
    }
    if (util.checkObject(this.data.applyTextarea)){
      wx.showModal({
        content: '请填写备注',
        showCancel: false,
        success: function (res) {
        }
      });
      return false
    }
    return true
  },
  applyStep: function(e){
    console.log(e)
    util.openLoading('正在玩命申请中')
    if(this.checkInfo()){
      db.collection('JobDetails').add({
        data: {
          JobId: this.data.JobId,
          applyId:this.data.uid,
          planId: this.data.pid,
          date: this.data.date,
          time: this.data.time,
          applyTextarea: this.data.applyTextarea,
          applyCount: this.data.applyCount,
          authFlag: 0,
          formId: e.detail.formId
        },
        success: res => {
          util.closeLoading()
          util.successPage('申请成功', '你得申请已提交，将有任务发布者进行审核，请等待!!')
          // db.collection('Jobs').doc(this.data.JobId).get({
          //   success: res => {
          //     this.callPlanFuncation(e.detail.formId, this.data.planUid, res.data.inviteName ,res.data.planId)
          //   },
          //   fail: res => {
          //     util.failPage('通知失败', '申请成功，但是通知任务发布者失败!!')
          //   }
          // })
        },
        fail: err => {
          util.closeLoading()
          util.failPage('申请失败','你得申请由于不可抗力因素失败，请稍后再试!!')
        }
      })
    }
  },
  callPlanFuncation(formId, touser, inviteName, planId) {
    wx.cloud.callFunction({
      name: 'openapi',
      data: {
        action: 'apply',
        formId: formId,
        touser: touser,
        username: '待改进',
        date: util.formatDateTime(new Date()),
        inviteName: inviteName,
        inviteCount: this.data.applyCount,
        planId: planId
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