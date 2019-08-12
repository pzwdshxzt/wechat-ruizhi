const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
const app = getApp()

Page({

  /**
   * isClock: 今日是否打卡
   * addonShow：显示农历或者附加组件
   * addon：附加组件
   * progress： 进度条参数
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
    addonShow: true,
    addon: 'custom',
    progress: 0,
    job: {},
    stepInfoList: [],
    startDate: '',
    endDate: '',
    daysAddonStyle: [],
    daysAddon: [],
    clockDatas: [],
    activityDates: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    /** 当前时间 */
    let that = this
    util.openLoading('数据加载中')
    db.collection('Jobs').doc(options.JobId).get().then(res => {
      that.setData({
        job: res.data,
        clockDatas: util.checkObject(res.data.clockDatas) ? [] : res.data.clockDatas,
        startDate: util.formatDate(new Date(res.data.createTime)),
        endDate: util.formatDate(new Date(res.data.endTime)),
        progress: util.getPercent(res.data.doneCount, res.data.inviteCount)
      }, function() {
        let startDay = new Date(that.data.job.createTime)
        startDay.setHours(8, 0, 0)
        let nowDay = new Date()
        nowDay.setHours(8, 0, 0)
        that.setData({
          activityDates: util.getDates(startDay, nowDay)
        }, function() {
          that.queryData()
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
    let activityDates = this.data.activityDates
    let targetWeRunNum = this.data.job.weRunNum
    console.log(activityDates)
    if (!util.checkObject(activityDates)) {
      activityDates.forEach((info, index) => {
        let data = info
        let isFirstDay = false
        if (index === 0) {
          let currentDate = new Date(data.dateTime)
          /** 开始日 */
          daysAddonStyle.push(this.daysAddonStyleObj(currentDate, 0))
          daysAddon.push(this.daysAddonObj(currentDate, 0))
          isFirstDay = true
        }
        let clockData = clockDatas.find(c => {
          if (data.date === c.clockDateId) {
            return true
          }
        })
       
        console.log(clockData)
        let currentDate = new Date(data.dateTime)
        /** 等于空 就说明还没有打卡 */
        if (util.checkObject(clockData)) {
          /** 未打卡 */
          if (this.data.job.status === 0) {
            if (!isFirstDay) {
              daysAddon.push(this.daysAddonObj(currentDate, 5))
            }
            daysAddonStyle.push(this.daysAddonStyleObj(currentDate, 5))
          }
        } else {
          /** 已打卡系列 */
          daysAddonStyle.push({
            month: clockData.month,
            day: clockData.day,
            year: clockData.year,
            background: weRunSignCode[clockData.content].colorCode,
            color: 'white'
          })
          if (!isFirstDay) {
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
  daysAddonStyleObj(date, num) {
    return {
      month: date.getMonth() + 1,
      day: date.getDate(),
      year: date.getFullYear(),
      background: this.data.weRunSignCode[num].colorCode,
      color: 'white'
    }
  },
})