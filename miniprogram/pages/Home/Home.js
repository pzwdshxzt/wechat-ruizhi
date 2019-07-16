// miniprogram/pages/Jobs/Jobs.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
Page({

  /**
   * 页面的初始数据
   */
  
  data: {
    openid: '',
    yourJobs: [],
    yourPlans: []
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.onLoad()
  },
  onLoad: function (options) {
    util.getUserInfo()
    util.openLoading('数据加载中')
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
      this.onInitData(options)
    } else {
      util.loginFunction().then(res => {
        this.setData({
          openid: res.openid
        })
        this.onInitData(options)
      }).catch(err => {
        console.log(err)
      })
    }
  },
  /**
   * 数据初始化
   */
  onInitData: function (options) {
    this.onQueryJobs()
    .then(this.onQueryPlans())
    .then(res =>{
      util.closeLoading()
    })
  },
  /**
   * 查询自己的计划
   */
  onQueryPlans: function () {
    return new Promise((resolve,reject) =>{
      db.collection('Plans').where({
        ibs: this.data.openid,
        status: 0
      }).get({
        success: res => {
          if (!util.checkObject(res.data)) {
            this.setData({
              yourPlans: res.data
            })
          }
          resolve(res.data)
        },
        fail: err => {
          console.error('[数据库] [查询记录] 失败：', err)
          reject('error')
        }
      })
    })
  },
  /**
   * 查询自己的任务
   */
  onQueryJobs: function () {
    return new Promise((resolve, reject) => {
      db.collection('Jobs').where({
        jober: this.data.openid,
        status: 0
      }).get({
        success: res => {
          if (!util.checkObject(res.data)) {
            this.setData({
              yourJobs: res.data
            })
          }
          resolve(res.data)
        },
        fail: err => {
          console.error('[数据库] [查询记录] 失败：', err)
          reject('error')
        }
      })
    })
  },
  onShow:function(){
    util.getUserInfo()
  }
})