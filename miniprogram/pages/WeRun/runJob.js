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
    weRunSignCode: app.globalData.weRunSignCode,
    weRunSignColorCode: app.globalData.weRunSignColorCode,
    isClock: true,
    addonShow: true,
    addon: 'custom',
    progress: 0,
    toDayRunNum: 0,
    job: {},
    stepInfoList: [],
    startDate: '',
    daysAddonStyle: [],
    daysAddon: [],
    clockDatas: [],
    isClock: true
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
          /** 去掉今天 */
          let temp = [...res.result]
          temp.pop()
          that.checkStepData(temp)
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
        clockDatas: res.data.clockDatas,
        startDate: util.formatDate(new Date(res.data.createTime)),
        progress: util.getPercent(res.data.doneCount, res.data.inviteCount)
      }, function() {
        that.queryData()
        that.setData({
          isClock: !that.checkClock(util.formatDate(new Date()))
        })
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
    /** 当前时间 */
    let date = new Date()
    /** 距离项目到期时间 还差几天 可能为负数 */
    let day = Math.floor((Date.parse(this.data.job.endTime) - Date.parse(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())) / (24 * 3600 * 1000));
    /** 项目开始 时间的时间戳 */
    let startTimestamp = util.timeStampToTimeV7(false, this.data.job.createTime, 1)
    let endTimestamp = util.timeStampToTimeV7(true, Date.parse(this.data.job.endTime), 1)
    console.log(startTimestamp)
    console.log(endTimestamp)
    let isfail = false;
    /**
     * 过滤重接受任务开始的那天算起
     */
    let needStepData = stepData.filter(info => {
      /**  完成  */
      if (this.data.job.weRunNum <= info.step) {
        info.type = 1
        info.sign = true
      }
      /** 未完成 */
      if (this.data.job.weRunNum > info.step) {
        info.type = 2
        info.sign = false
        isfail = true
      }
      info.clockDateId = util.formatDate(new Date(info.timestamp * 1000))
      return startTimestamp <= info.timestamp * 1000 && endTimestamp >= info.timestamp * 1000
    })
    console.log(needStepData)
    this.setData({
      needStepData
    })
    /** 连续性任务如果有未完成的直接失败 */
    if (this.data.job.type === 1) {
      /**
       * 如果存在没有成功的天数  
       * 微信最多只能取30数据 所以只能判断30天内的数据
       */
      if (isfail) {
        console.log('执行失败更新')
      }
    }
    /** 累积性判断项目有没有到期  */
    if (this.data.job.type === 2) {
      /**
       * 执行修改job失败 并且提示项目已更新为失败 且不能打卡了
       */
      if (day < 0) {
        console.log('已过期')
      }
      /**
       * 所剩任务时间不足以完成任务咯 但任然可以打卡
       */
      if (day < this.data.job.inviteCount - this.data.job.doneCount) {
        /**
         * 提示所剩时间不多
         */
      }
      /**
       * 所剩时间正好等于任务剩下得时间，所以你得保证接下来每天都完成哦
       */
      if (day === this.data.job.inviteCount - this.data.job.doneCount) {
        /**
         * 提示每天都要完成
         */
      }
      /** 时间充裕 */
      if (day > this.data.job.inviteCount - this.data.job.doneCount - app.globalData.ampleTime) {}
    }

    /** 
     * 如果都没有问题就自动打卡更新时间 
     * signDate 是运动签到数据
     **/
    if (util.checkObject(this.data.job.clockDatas)) {

    } else {
      /**
       *  TODO 如果已经存在打卡数据  
       *  数据拼接 
       *  之前没有打卡得也可以直接自动补签 
       *  数据合在一起
       **/
      console.log(this.data.job.clockDatas)
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

  prevMonth(val) {
    /** 刷新签到数据 */
    this.queryData()
  },
  nextMonth(val) {
    /** 刷新签到数据 */
    console.log(val)
    this.queryData()
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
  },

  switchAddon: function() {
    if (this.data.addonShow) {
      this.setData({
        addonShow: !this.data.addonShow,
        addon: 'lunar',
        daysAddon: this.data.daysAddon
      });
    } else {
      this.setData({
        addonShow: !this.data.addonShow,
        addon: 'custom'
      });
    }
  },

  /**
   * 查询签到数据
   */
  queryData: function() {
    let clockDatas = this.data.clockDatas
    let daysAddonStyle = new Array;
    let daysAddon = new Array
    let weRunSignCode = this.data.weRunSignCode
    let weRunSignColorCode = this.data.weRunSignColorCode
    if (!util.checkObject(clockDatas)) {
      clockDatas.map(clockData => {
        daysAddonStyle.push({
          month: clockData.month,
          day: clockData.day,
          color: 'white',
          background: weRunSignColorCode[clockData.content]
        });
        daysAddon.push({
          day: clockData.day,
          year: clockData.year,
          month: clockData.month,
          content: weRunSignCode[clockData.content]
        })
      })
      this.setData({
        daysAddonStyle,
        daysAddon
      });
    }

  },
  /**
   * 今日打卡
   */
  openApplyPage: function() {
    let now = new Date()
    let clockDateId = util.formatDate(now)
    if (this.checkClock(clockDateId)) {
      if (this.data.toDayRunNum >= this.data.job.weRunNum) {
        let clockData = {
          clockDateId,
          day: now.getDate(),
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          content: 1,
          step: this.data.toDayRunNum
        }
        this.clock(clockData, clockDateId)
      }
    }
  },
  /**
   * 日历上打卡等
   */
  dayClick(val) {
    let clockDateId = util.formatDate(new Date(val.detail.year, val.detail.month - 1, val.detail.day))
    console.log(clockDateId)

    if (this.checkClock(clockDateId)) {
      wx.showModal({
        title: '是否打卡',
        content: clockDateId + '请求打卡？',
        success: function(e) {
          if (e.confirm) {
            let clockDateRunNum = 0
            this.data.needStepData.map(data => {
              if (data.clockDateId === clockDateId) {
                clockDateRunNum = data.step
              }
            })
            console.log(clockDateRunNum)
            if (clockDateRunNum >= this.data.job.weRunNum) {
              let clockData = {
                clockDateId,
                day: val.detail.day,
                year: val.detail.year,
                month: val.detail.month,
                content: 1,
                step: this.data.toDayRunNum
              }
              this.clock(clockData, clockDateId)
              console.log(clockData)
            } else {
              wx.showToast({
                title: '补签步数未达到目标步数',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  },
  /**
   * 打卡入口
   */
  clock(clockData, clockDateId) {
    util.openLoading('打卡申请中...')
    let clockDatas = this.data.clockDatas
    let that = this
    if (util.checkObject(clockDatas)) {
      clockDatas = new Array
    }
    dbConsole.updateJobsByWeRun(that.data.job._id, clockData).then(res => {
      clockDatas.push(clockData)
      this.setData({
        clockDatas: clockDatas
      }, function() {
        this.queryData()
        wx.showToast({
          title: '打卡成功',
          icon: 'none'
        })
      });

    }).catch(res => {
      console.log(res)
    })
    util.closeLoading()

  },

  /**
   * 判断是否打卡
   * clockDateId 日期
   * return boolean
   */
  checkClock(clockDateId) {
    let click = true
    if (!util.checkObject(this.data.clockDatas)) {
      this.data.clockDatas.map(info => {
        if (info.clockDateId === clockDateId) {
          click = false
        }
      })
    }
    if (!click) {
      wx.showToast({
        title: clockDateId + '已打卡',
        icon: 'none',
      })
    }
    return click
  }
})