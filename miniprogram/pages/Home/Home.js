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
    yourPlans: [],
    otherPlans: [],
    ColorList: app.globalData.ColorList,
    CustomBar: app.globalData.CustomBar,
    showSearchBar: false
  },

  onPullDownRefresh: function() {
    this.onInitData()
  },
  onLoad: function() {

    util.openLoading('数据加载中')
    if (app.globalData.openid && app.globalData.userInfo !== {}) {
      this.setData({
        openid: app.globalData.openid
      })
      this.onInitData()
    } else {
      util.loginFunction().then(res => {
        this.setData({
          openid: res.openid
        })
        this.onInitData()
      }).catch(err => {
        console.log(err)
      })
    }
  },
  /**
   * 数据初始化
   */
  onInitData: function() {
    this.onQueryOtherPlans()
      .then(this.onQueryJobs())
      .then(this.onQueryPlans())
      .then(res => {
        util.closeLoading()
      })
  },
  /**
   * 查询自己的计划
   */
  onQueryPlans: function() {
    return new Promise((resolve, reject) => {
      db.collection('Plans').where({
        ibs: this.data.openid,
        status: 0
      }).get({
        success: res => {
          if (!util.checkObject(res.data)) {
            let dataList = this.data.ColorList;
            let length = this.data.ColorList.length
            res.data.map(data =>{
              data.colorName = dataList[util.getRandInt(0, length)].name
              data.text = data.inviteName.substring(0,1)
            })
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
  onQueryJobs: function() {
    return new Promise((resolve, reject) => {
      db.collection('Jobs').where({
        jober: this.data.openid,
        status: _.in([0, 1])
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
  /**
   * 查询别人的计划轮播展示
   */
  onQueryOtherPlans: function() {
    return new Promise((resolve, reject) => {
      db.collection('Plans').where({
        show: 1,
        status: 0
      }).orderBy('updateTime', 'desc').limit(4).get({
        success: res => {
          this.setData({
            otherPlans: res.data
          })
          resolve(res.data)
        },
        fail: err => {
          console.error('[数据库] [查询记录] 失败：', err)
          reject('error')
        }
      })
    })
  },
  onShow: function() {
    this.onInitData()
  },
  // ListTouch触摸开始
  JobListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  JobListTouchMove(e) {
    console.log('JobListTouchMove')
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  JobListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },

  // ListTouch触摸开始
  PlanListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  PlanListTouchMove(e) {
    console.log('PlanListTouchMove')
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  PlanListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },
  toJobs: function(e) {
    let type = e.currentTarget.dataset.type
    if(type === 0){
      wx.navigateTo({
        url: '../Job/Job?JobId=' + e.currentTarget.dataset.jobid + '&uid=' + this.data.openid,
      })
    }
    if (type === 1 || type === 2) {
      wx.navigateTo({
        url: '../WeRun/runJob?JobId=' + e.currentTarget.dataset.jobid + '&uid=' + this.data.openid,
      })
    }

  },
  toPlans: function(e) {
    console.log(e)
    wx.navigateTo({
      url: '../Plan/Plan?PlanId=' + e.currentTarget.dataset.jobid + '&uid=' + this.data.openid,
    })
  },
  onPullDownRefresh: function(e){
    this.setData({
      showSearchBar: !this.data.showSearchBar
    })
    wx.stopPullDownRefresh()
  }
})