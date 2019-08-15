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
   * isClock: 今日是否打卡
   * addonShow：显示农历或者附加组件
   * addon：附加组件
   * progress： 进度条参数
   * toDayRunNum： 今日步数
   * job： 任务数据
   * stepInfoList： 微信运动30天数步数
   * startDate： 开始时间
   * daysAddonStyle：附件组件样式
   * daysAddon：附件日期
   * clockDatas：签到数据
   * activityDates： 活动到今日的时间数组
   * needStepData：获取跑步开始日期 到 现在的数据(30天内 30天没有数据))
   */
  data: {
    statusCode: app.globalData.statusCode,
    authCode: app.globalData.authCode,
    weRunSignCode: app.globalData.weRunSignCode,
    isClock: false,
    addonShow: true,
    loading: true,
    addon: 'custom',
    progress: 0,
    toDayRunNum: 0,
    job: {},
    stepInfoList: [],
    startDate: '',
    endDate: '',
    daysAddonStyle: [],
    daysAddon: [],
    clockDatas: [],
    activityDates: [],
    needStepData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    /** 当前时间 */
    let date = new Date()
    let that = this
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
          // temp.pop()
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
    this.queryJob(options.JobId)
  },

  queryJob(jobId) {
    let that = this
    db.collection('Jobs').doc(jobId).get().then(res => {
      that.setData({
        job: res.data,
        clockDatas: util.checkObject(res.data.clockDatas) ? [] : res.data.clockDatas,
        startDate: util.formatDate(new Date(res.data.createTime)),
        endDate: util.formatDate(new Date(res.data.endTime)),
        progress: util.getPercent(res.data.doneCount, res.data.inviteCount)
      }, function() {
        let startDay = new Date(that.data.job.createTime)
        startDay.setHours(8, 0, 0)
        let date = new Date(that.data.job.endTime)
        date.setHours(8, 0, 0)
        that.setData({
          isClock: !that.checkClock(util.formatDate(date), true),
          activityDates: util.getDates(startDay, date),
          loading: false
        })
      })
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
    let that = this
    /** 当前时间 */
    let date = new Date()
    /** 距离项目到期时间 还差几天 可能为负数 */
    let day = Math.floor((that.data.job.endTime - Date.parse(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())) / (24 * 3600 * 1000));
    /** 项目开始 时间的时间戳 */
    let startTimestamp = util.timeStampToTimeV7(false, that.data.job.createTime, 1)
    let endTimestamp = util.timeStampToTimeV7(true, that.data.job.endTime, 0)
    /**
     * 过滤重接受任务开始的那天算起
     */
    let needStepData = stepData.filter((info, index) => {
      /**  完成  */
      if (that.data.job.weRunNum <= info.step) {
        info.done = true
      }
      /** 未完成 */
      if (that.data.job.weRunNum > info.step) {
        info.done = false
      }
      info.clockDateId = util.formatDate(new Date(info.timestamp * 1000))
      return startTimestamp <= info.timestamp * 1000 && endTimestamp >= info.timestamp * 1000
    })
    that.setData({
      needStepData
    }, function() {
      that.queryData()
    })

    /** 连续性任务如果有未完成的直接失败 */
    if (that.data.job.type === 1) {
      /**
       * 如果存在没有成功的天数  
       * 微信最多只能取30数据 所以只能判断30天内的数据
       */
      let isfail = false;
      needStepData.forEach((data, index) => {
        if (that.data.job.weRunNum > data.step && index !== needStepData.length - 1) {
          console.log(index)
          isfail = true
        }
      })
      if (isfail) {
        /** 执行失败更新 */
        if (that.data.job.status === 0) {
          that.updateJobStatus('该任务已失败，自动删除！', that.data.job._id, 4)
        }
      }
    }

    /**
     * 判断是否完成
     * 失败: 执行修改job失败 
     * 成功: 执行修改job失败
     */
    if (day < 0) {
      let job = this.data.job
      if (job.doneCount >= job.inviteCount && job.status === 0) {
        /** 任务完成 */
        console.log('任务完成')
        if (that.data.job.status === 0) {
          that.updateJobStatus('任务已完成！', job._id, 1)
        }
      }
      if (job.doneCount < job.inviteCount && job.status === 0) {
        /** 执行失败更新 */
        that.updateJobStatus('该任务已失败，自动删除！', job._id, 4)
      }
    }

    if (day === 0) {
      let job = this.data.job
      if (job.doneCount >= job.inviteCount && job.status === 0) {
        /** 任务完成 */
        console.log('任务完成')
        if (that.data.job.status === 0) {
          that.updateJobStatus('任务已完成！', job._id, 1)
        }
      } else {
        if (job.status === 0) {
          wx.showToast({
            title: '今日是最后一天，请尽快将打满，否则明日任务将以失败结束',
            icon: 'none',
            duration: 5000,
          })
        }
      }
    }
  },
  updateJobStatus(title, id, status) {
    let that = this
    dbConsole.updateJobStatus(id, status).then(res => {
      wx.showToast({
        title: title,
        icon: 'none',
        duration: 5000,
        success() {
          that.queryJob(id)
        }
      })
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
   * 展示数据在日历上
   */
  queryData: function() {
    let nowDay = new Date()
    let nowTimestamp = Date.parse(nowDay)
    let todayClockDataId = util.formatDate(nowDay)
    let clockDatas = this.data.clockDatas
    let daysAddonStyle = new Array;
    let daysAddon = new Array
    let weRunSignCode = this.data.weRunSignCode
    let activityDates = this.data.activityDates
    let needStepData = this.data.needStepData
    let targetWeRunNum = this.data.job.weRunNum
    if (!util.checkObject(activityDates)) {
      activityDates.forEach((info, index) => {
        let data = info
        let isFirstDay = false
        let isEndDay = false
        if (index === 0) {
          let currentDate = new Date(data.dateTime)
          /** 开始日 */
          daysAddonStyle.push(this.daysAddonStyleObj(currentDate, 0, 'heartBeat'))
          daysAddon.push(this.daysAddonObj(currentDate, 0 ))
          isFirstDay = true
        }
        if (index === activityDates.length - 1) {
          let currentDate = new Date(data.dateTime)
          /** 结束日 */
          daysAddonStyle.push(this.daysAddonStyleObj(currentDate, 8, 'heartBeat'))
          daysAddon.push(this.daysAddonObj(currentDate, 8))
          isEndDay = true
        }
        let clockData = clockDatas.find(c => {
          if (data.date === c.clockDateId) {
            return true
          }
        })
        /** 等于空 就说明还没有打卡 */
        if (util.checkObject(clockData)) {
          let weRunNumToDay = needStepData.find(c => {
            if (data.date === c.clockDateId) {
              return true
            }
          })
          let currentDate = new Date(data.dateTime)
          if (util.checkObject(weRunNumToDay)) {
            /** 漏卡 */
            if (data.dateTime > nowTimestamp) {
              /** 未开始 */
              daysAddonStyle.push(this.daysAddonStyleObj(currentDate, 7, 'shake'))
              if (!isFirstDay && !isEndDay) {
                daysAddon.push(this.daysAddonObj(currentDate, 7))
              }
            } else {
              /** 漏卡 */
              daysAddonStyle.push(this.daysAddonStyleObj(currentDate, 4, 'shake'))
              if (!isFirstDay && !isEndDay) {
                daysAddon.push(this.daysAddonObj(currentDate, 4))
              }
            }
          } else {
            /** 判断是否到达步数 */
            if (weRunNumToDay.step >= targetWeRunNum) {
              /** 可以补卡 */
              if (todayClockDataId === weRunNumToDay.clockDateId) {
                daysAddonStyle.push(this.daysAddonStyleObj(currentDate, 1, 'tada'))
                if (!isFirstDay && !isEndDay) {
                  daysAddon.push(this.daysAddonObj(currentDate, 1))
                }
              } else {
                daysAddonStyle.push(this.daysAddonStyleObj(currentDate, 3, 'tada'))
                if (!isFirstDay && !isEndDay) {
                  daysAddon.push(this.daysAddonObj(currentDate, 3))
                }
              }
            } else {
              /** 未完成 */
              console.log(todayClockDataId)
              console.log(weRunNumToDay)
              daysAddonStyle.push(this.daysAddonStyleObj(currentDate, 6, 'shake'))
              if (!isFirstDay && !isEndDay) {
                daysAddon.push(this.daysAddonObj(currentDate, 6))
              }
            }
          }
        } else {
          /** 已打卡系列 */
          daysAddonStyle.push({
            month: clockData.month,
            day: clockData.day,
            year: clockData.year,
            background: weRunSignCode[clockData.content].colorCode,
            color: 'white',
            animation: 'heartBeat'
          })
          if (!isFirstDay && !isEndDay) {
            daysAddon.push({
              day: clockData.day,
              year: clockData.year,
              month: clockData.month,
              content: weRunSignCode[clockData.content].text
            })
          }
        }
      })
    }
    this.setData({
      daysAddonStyle,
      daysAddon
    });
  },
  daysAddonObj(date, num) {
    return {
      day: date.getDate(),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      content: this.data.weRunSignCode[num].text
    }
  },
  daysAddonStyleObj(date, num, animation) {
    return {
      month: date.getMonth() + 1,
      day: date.getDate(),
      year: date.getFullYear(),
      background: this.data.weRunSignCode[num].colorCode,
      color: 'white',
      animation: animation
    }
  },
  /**
   * 今日打卡
   */
  openApplyPage: function() {
    /** 当前时间 */
    let date = new Date()
    let clockDateId = util.formatDate(date)
    if (this.checkClock(clockDateId, false)) {
      if (this.data.toDayRunNum >= this.data.job.weRunNum) {
        let clockData = {
          clockDateId,
          day: date.getDate(),
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          content: 2,
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
    let that = this
    let nowDateTime = Date.parse(new Date())
    let clockDateId = util.formatDate(new Date(val.detail.year, val.detail.month - 1, val.detail.day))
    let clockData = this.data.needStepData.find(info => {
      if (info.clockDateId === clockDateId) {
        return true
      }
    })
    if (util.checkObject(clockData)) {
      let checkInActivity = this.data.activityDates.find(data => {
        if (data.date === clockDateId) {
          return true
        }
      })
      if (checkInActivity) {
        if (checkInActivity.dateTime > nowDateTime) {
          wx.showToast({
            title: '未到打卡时间，请耐心等待',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '由于未获得' + clockDateId + '运动,打卡失败',
            icon: 'none'
          })
        }

      } else {
        wx.showToast({
          title: clockDateId + '不在任务开始到今日范围内,打卡失败',
          icon: 'none'
        })
      }

    } else {
      if (clockData.done) {
        if (that.checkClock(clockDateId, false)) {
          wx.showModal({
            title: '是否打卡',
            content: clockDateId + '请求打卡？',
            success: function(e) {
              if (e.confirm) {
                let clockDateRunNum = 0
                that.data.needStepData.map(data => {
                  if (data.clockDateId === clockDateId) {
                    clockDateRunNum = data.step
                  }
                })
                console.log(clockDateRunNum)
                if (clockDateRunNum >= that.data.job.weRunNum) {
                  let clockData = {
                    clockDateId,
                    day: val.detail.day,
                    year: val.detail.year,
                    month: val.detail.month,
                    content: 2,
                    step: that.data.toDayRunNum
                  }
                  that.clock(clockData, clockDateId)
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
      } else {
        wx.showToast({
          title: '由于步数未达到要求，不能打卡',
          icon: 'none'
        })
      }
    }

  },
  /**
   * 打卡入口
   */
  clock(clockData, clockDateId) {
    util.openLoading('打卡申请中...')
    let that = this
    let clockDatas = this.data.clockDatas
    let today = util.formatDate(new Date())
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
      if (clockDateId === today) {
        this.setData({
          isClock: true
        })
      }
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
  checkClock(clockDateId, first) {
    let click = true
    if (!util.checkObject(this.data.clockDatas)) {
      this.data.clockDatas.map(info => {
        if (info.clockDateId === clockDateId) {
          click = false
        }
      })
    }
    if (!click && !first) {
      wx.showToast({
        title: clockDateId + '已打卡',
        icon: 'none',
      })
    }
    return click
  }
})