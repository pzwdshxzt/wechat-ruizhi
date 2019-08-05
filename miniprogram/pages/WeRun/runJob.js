
const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
const dbConsole = require('../../Utils/DbConsole.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sAngle: 0,
    eAngle: 360,
    spaceBetween: 10,
    weRunNum: 0,
    buttons: [{
      openType: 'contact',
      label: 'Contact',
      icon: '/images/icon/contact.png',
    },
    {
      label: 'Delete Job',
      icon: '/images/icon/delete.png'
    }
    ],
    job: {},
    jobId: '',
    JobDetails: [],
    progress: 0,
    statusCode: app.globalData.statusCode,
    authCode: app.globalData.authCode,
    planUid: '',
    jobDetailsTotalCount: 0,
    isloadmore: false,
    authWeRun: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    let that = this
    util.openLoading('数据加载中')
    wx.getWeRunData({
      success(res) {
        // 拿 encryptedData 到开发者后台解密开放数据
        const encryptedData = res.encryptedData
        // 或拿 cloudID 通过云调用直接获取开放数据
        const cloudID = res.cloudID
        wx.cloud.callFunction({
          name: 'openapi',
          data: {
            action: 'getWeRunData',
            weRunData: wx.cloud.CloudID(cloudID), // 这个 CloudID 值到云函数端会被替换
          }
        }).then(res => {
          that.setData({
            weRunNum: res.result.step
          })
        })
      },
      fail(res){
        wx.showModal({
          title: '提示',
          content: '未获得授权，获取步数失败',
          showCancel: true,
          confirmText: '去授权',
          cancelText: '知道了',
          success(res){
            console.log(res)
            if (res.confirm) {
              wx.openSetting()
              // wx.authorize({ scope: "scope.werun" })
            }
          }
        })
      }
    })
    
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
  gotoPlanDetails: function () {
    wx.navigateTo({
      url: '../Job/ShowPlanDetails?PlanId=' + this.data.job.planId,
    })
  },
  getPercent: function (num, total) {
    num = parseFloat(num);
    total = parseFloat(total);
    if (isNaN(num) || isNaN(total)) {
      return "-";
    }
    return total <= 0 ? 0 : (Math.round(num / total * 10000) / 100.00);
  },
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
          content: '是否真的放弃这个运动计划',
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
  onShow(){
    let that = this
    wx.getWeRunData({
      success(res) {
        // 拿 encryptedData 到开发者后台解密开放数据
        const encryptedData = res.encryptedData
        // 或拿 cloudID 通过云调用直接获取开放数据
        const cloudID = res.cloudID
        wx.cloud.callFunction({
          name: 'openapi',
          data: {
            action: 'getWeRunData',
            weRunData: wx.cloud.CloudID(cloudID), // 这个 CloudID 值到云函数端会被替换
          }
        }).then(res => {
          that.setData({
            weRunNum: res.result.step
          })
        })
      }
    })
  },
  onContact(e) {
    console.log('onContact', e)
  },
  onChange(e) { }
})