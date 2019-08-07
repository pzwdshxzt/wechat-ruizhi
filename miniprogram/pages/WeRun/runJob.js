const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
const dbConsole = require('../../Utils/DbConsole.js');
const app = getApp()
const buttons = [{
    openType: 'contact',
    label: 'Contact',
    icon: '/images/icon/contact.png',
  },
  {
    label: 'Delete Job',
    icon: '/images/icon/delete.png'
  }
]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    buttons: buttons,
    statusCode: app.globalData.statusCode,
    authCode: app.globalData.authCode,
    job: {},
    progress: 0,
    isloadmore: false,
    authWeRun: false,
    stepInfoList: [],
    toDayRunNum: 0,
    startDate: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    util.openLoading('数据加载中')
    wx.getWeRunData({
      success(res) {
        const cloudID = res.cloudID
        wx.cloud.callFunction({
          name: 'openapi',
          data: {
            action: 'getWeRunAllData',
            weRunData: wx.cloud.CloudID(cloudID),
          }
        }).then(res => {
          that.setData({
            toDayRunNum: res.result[res.result.length - 1].step,
            stepInfoList: res.result
          })
          that.checkStepData(res.result)
        })
      },
      fail(res) {
        wx.showModal({
          title: '提示',
          content: '未获得授权，获取步数失败',
          showCancel: true,
          confirmText: '去授权',
          cancelText: '知道了',
          success(res) {
            console.log(res)
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })

    db.collection('Jobs').doc(options.JobId).get().then(res => {
      that.setData({
        job: res.data,
        startDate: util.timeStampToTimeV5(res.data.createTime, '-'),
        progress: util.getPercent(res.data.doneCount, res.data.inviteCount)
      })
      util.closeLoading()
    })
  },
  gotoPlanDetails: function() {
    wx.navigateTo({
      url: '../Job/ShowPlanDetails?PlanId=' + this.data.job.planId,
    })
  },
  /**
   * 校验过去三十天的步数 是否达标
   * 达标自动签到
   * 连续性未达标自动失败
   */
  checkStepData: function(stepData) {
    /** 过滤 */
    let timestamp = util.timeStampToTimeV7(false, this.data.job.createTime, 1)
    let newArray = stepData.filter(info => {
      /**
       * 完成
       */
      if (this.data.job.weRunNum <= info.step) {
        info.type = 1
        info.sign = true
      }
      /**
       * 未完成
       */
      if (this.data.job.weRunNum > info.step) {
        info.type = 2
        info.sign = false
      }
      return timestamp <= info.timestamp * 1000
    })

    
    /** 连续性任务如果有未完成的直接失败 */
    if (this.data.job.type === 1) {
      let isfail = false;
      newArray.map(res => {
        if (res.type === 2) {
          isfail = true
        }
      })
      if (isfail) {
        console.log('执行失败更新')
      }
    }
    /** 累积性判断项目有没有到期  */
    if (this.data.job.type === 2) {
      console.log(this.data.job.endTime)
    }

    /** 
     * 如果都没有问题就自动打卡更新时间 
     * signDate 是运动签到数据
     **/
    if (util.checkObject(this.data.job.signData)){
      // newArray直接更新上去
    } else {
      // TODO 如果已经存在打卡数据  数据拼接 之前没有打卡得也可以直接自动补签 数据合在一起
      // this.data.job.signData
    }


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
              }).catch(res => {
                wx.showToast({
                  title: '放弃计划失败',
                  icon: 'none'
                })
              })
            }
          }
        })
      }
    }
  },
  onShow() {
    this.getWeRunData()
  },
  onContact(e) {
    console.log('onContact', e)
  },
  onChange(e) {
    console.log('onChange', e)
  },
  /** 
   * 获取今日步数
   */
  getWeRunData() {
    let that = this
    wx.getWeRunData({
      success(res) {
        const cloudID = res.cloudID
        wx.cloud.callFunction({
          name: 'openapi',
          data: {
            action: 'getWeRunData',
            weRunData: wx.cloud.CloudID(cloudID),
          }
        }).then(res => {
          that.setData({
            toDayRunNum: res.result.step
          })
        })
      }
    })
  }
})