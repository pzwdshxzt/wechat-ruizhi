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
    Users: '',
    fromUid: '',
    isSharePageIn: false,
    fromUidJobs: [],
    yourJobs: [],
    yourPlans: [],
    showLoading: true
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.onLoad()
  },
  onLoad: function (options) {
    util.openLoading('数据加载中')
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
      this.onInitData(options)
    } else {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          app.globalData.openid = res.result.openid
          this.setData({
            openid: res.result.openid
          })
          this.onInitData(options)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '获取 openid 失败，请检查是否有部署 login 云函数',
          })
          console.log('[云函数] [login] 获取 openid 失败，请检查是否有部署云函数，错误信息：', err)
        }
      })
    }
  },
  /**
   * 数据初始化
   */
  onInitData: function (options) {
    this.onQueryJobs()
    this.onQueryPlans()
    if (!util.checkObject(options) && !util.checkObject(options.jsonStr)) {
      this.setData({
        fromUid: options.jsonStr
      })
    } 
    if (!util.checkObject(this.data.fromUid)) {
      if (this.data.fromUid === this.data.openid) {
        wx.showToast({
          icon: 'none',
          title: '您不能参与自己的计划',
        })
      } else {
        this.setData({
          isSharePageIn: true
        })
        this.onQueryFromUid()
      }
    }
    util.closeLoading()
  },
  /**
   * 查询别人邀请的计划
   */
  onQueryFromUid: function () {
    let jobs = []
    this.onQueryJobs().then(res => {
      jobs = res.map(job => { return job.planId })
      db.collection('Plans').where({
        _openid: this.data.fromUid,
        _id: _.nin(jobs)
      }).get({
        success: res => {
          if (!util.checkObject(res.data)) {
            this.setData({
              fromUidJobs: res.data
            })
          } else {
            this.setData({
              isSharePageIn: false
            })
          }
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
    })
  },
  /**
   * 查询自己的计划
   */
  onQueryPlans: function () {
    return new Promise((resolve,reject) =>{
      db.collection('Plans').where({
        ibs: this.data.openid
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
        jober: this.data.openid
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
   * 选择要执行的计划
   */
  selectStep(e) {
    db.collection('Jobs').where({
      planId: e.detail.value.pid,
      jober: this.data.openid
    }).get({
      success: res => {
        if(!util.checkObject(res.data)){
          wx.showToast({
            icon: 'none',
            title: '你已经接受了这个任务！'
          })
          this.setData({
            isSharePageIn: false
          })
        } else {
          const db = wx.cloud.database()
          db.collection('Plans').doc(e.detail.value.pid).get().then(res => {
            let plan = res.data
            /**
             * 添加新的记录
             */
            db.collection('Jobs').add({
              data: {
                planId: e.detail.value.pid,
                planUid: e.detail.value.ibs,
                jober: this.data.openid,
                inviteName: res.data.inviteName,
                inviteCount: res.data.inviteCount,
                doneCount: 0
              },
              success: res => {
                this.onQueryJobs()
                this.callPlanFuncation(e.detail.formId, plan.ibs)
                this.setData({
                  isSharePageIn: false
                })
                wx.showToast({
                  icon: 'none',
                  title: '接受任务成功！'
                })
              },
              fail: err => {
                wx.showToast({
                  icon: 'none',
                  title: '接受计划失败'
                })
                console.error('[数据库] [新增记录] 失败：', err)
              }
            })
          })
          
        }
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    }) 
  },
  callPlanFuncation(formId, touser){
    wx.cloud.callFunction({
      name: 'openapi',
      data: {
        action: 'Invited',
        formId: formId,
        touser: touser
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