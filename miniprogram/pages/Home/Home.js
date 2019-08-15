// miniprogram/pages/Jobs/Jobs.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
import regeneratorRuntime from '../../Utils/runtime.js'
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
    showSearchBar: false,
    loading: true,
    shake: 'shake'
  },

  onPullDownRefresh: function() {
    this.onInitData()
  },
  onLoad: function() {
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
        this.dataInit()
      }).catch(err => {
        console.log(err)
      })
    }
  },
  /**
   * 数据初始化
   */
  async dataInit() {
    let that = this
    let otherPlans = await that.onQueryOtherPlans();
    let yourJobs = await that.onQueryJobs();
    let yourPlans = await that.onQueryPlans();
    /** 同步执行 */
    let results = await Promise.all([otherPlans, yourJobs, yourPlans])

    /**
     * 更新对象中某属性值
     */
    let data = results[2].map((data, index) => {
      if (data.type === 0) {
        db.collection('JobDetails').where({
          planId: data._id,
          authFlag: 0
        }).count().then(res => {
          var param = {};
          var str = "yourPlans[" + index + "].authNum";
          param[str] = res.total;
          that.setData(param);
        })
      }
    })
    this.setData({
      loading: false
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
      }).get().then(res => {
        if (!util.checkObject(res.data)) {
          let dataList = this.data.ColorList;
          let length = this.data.ColorList.length
          res.data.map(data => {
            data.authNum = 0
            data.colorName = dataList[util.getRandInt(0, length)].name
            data.contentShort = data.content.length > 15 ? data.content.substring(0, 15) + '...' : data.content
            data.text = data.inviteName.substring(0, 1)
          })
        }
        this.setData({
          yourPlans: res.data
        })
        resolve(res.data)
      }).catch(err => {
        console.error('[数据库] [查询记录] 失败：', err)
        reject('error')
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
      }).get().then(res => {
        if (!util.checkObject(res.data)) {
          this.setData({
            yourJobs: res.data
          })
        }
        resolve('success')
      }).catch(err => {
        console.error('[数据库] [查询记录] 失败：', err)
        reject('error')
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
      }).orderBy('updateTime', 'desc').limit(4).get().then(res => {
        this.setData({
          otherPlans: res.data
        })
        resolve('success')
      }).catch(err => {
        fail: err => {
          console.error('[数据库] [查询记录] 失败：', err)
          reject('error')
        }
      })
    })
  },

  onShow: function() {
    this.dataInit()
  },

  toJobs: function(e) {
    let type = e.currentTarget.dataset.type
    if (type === 0) {
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
    let type = e.currentTarget.dataset.type
    // if (type === 0) {
    wx.navigateTo({
      url: '../Plan/Plan?PlanId=' + e.currentTarget.dataset.jobid + '&uid=' + this.data.openid,
    })
    // }
    if (type === 1 || type === 2) {
      wx.navigateTo({
        url: '../WeRun/runPlan?PlanId=' + e.currentTarget.dataset.jobid + '&uid=' + this.data.openid,
      })
    }
  },
  onPullDownRefresh: function(e) {
    this.setData({
      showSearchBar: !this.data.showSearchBar
    })
    wx.stopPullDownRefresh()
  }
})