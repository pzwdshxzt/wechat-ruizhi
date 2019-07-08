// miniprogram/pages/Jobs/Jobs.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    Users: '',
    fromUid: 'o3qrs0HsIJbThtm9aEHDL6DPWHNE',
    isSharePageIn: false,
    fromUidJobs: [],
    yourJobs: [],
    yourPlans: []
  },
  onLoad: function (options) {
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
    if (!this.checkObject(options) && !this.checkObject(options.jsonStr)) {
      this.setData({
        fromUid: options.jsonStr
      })
    } 
    if (!this.checkObject(this.data.fromUid)) {
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
      this.setData({
        isSharePageIn: true
      })
      this.onQueryFromUid()

    }
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
          if (!this.checkObject(res.data)) {
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
          console.log(res)
          if (!this.checkObject(res.data)) {
            this.setData({
              yourPlans: res.data
            })
          }
          console.log(this.data.yourJobs)
          console.log(this.data.yourPlans)
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
          if (!this.checkObject(res.data)) {
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
  selectStep: function (e) {
    let plan ;
    /**
     * 查询是否已经接受这个任务
     */
    db.collection('Jobs').where({
      planId: e.currentTarget.dataset.id,
      jober: this.data.openid
    }).get({
      success: res => {
        if(!this.checkObject(res.data)){
          wx.showToast({
            icon: 'none',
            title: '你已经接受了这个任务！'
          })
          this.setData({
            isSharePageIn: false
          })
        } else {
          /**
           * 添加新的记录
           */
          db.collection('Jobs').add({
            data: {
              planId: e.currentTarget.dataset.id,
              jober: this.data.openid
            },
            success: res => {
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
  checkObject: function (obj) {
    return obj === null || obj === undefined || obj === '' || Array.isArray(obj) ? obj.length === 0 : false || Object.keys(obj).length === 0;
  }
})