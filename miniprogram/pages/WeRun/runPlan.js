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
    weRunSignColorCode: app.globalData.weRunSignColorCode,
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
    let date = new Date()
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
        that.setData({
          activityDates: util.getDates(new Date(this.data.job.createTime), date.setDate(date.getDate()))
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
  prevMonth(val) {
    /** 刷新签到数据 */
    this.queryData()
  },
  nextMonth(val) {
    /** 刷新签到数据 */
    console.log(val)
    this.queryData()
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
    let activityDates = this.data.activityDates
    let targetWeRunNum = this.data.job.weRunNum
    console.log(activityDates)
    if (!util.checkObject(activityDates)) {
      activityDates.map(info => {
        let data = info
        let clockData = clockDatas.find(c => {
          if (data.date === c.clockDateId) {
            return true
          }
        })
        let currentDate = new Date(data.dateTime)
        /** 等于空 就说明还没有打卡 */
        if (util.checkObject(clockData)) {
          /** 未打卡 */
          if (this.data.job.status === 0) {
            daysAddonStyle.push({
              month: currentDate.getMonth() + 1,
              day: currentDate.getDate(),
              background: weRunSignColorCode[5],
              color: 'white'
            })
            daysAddon.push({
              day: currentDate.getDate(),
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              content: weRunSignCode[5]
            })
          }
        } else {
          /** 已打卡系列 */
          daysAddonStyle.push({
            month: clockData.month,
            day: clockData.day,
            background: weRunSignColorCode[clockData.content],
            color: 'white'
          })
          daysAddon.push({
            day: clockData.day,
            year: clockData.year,
            month: clockData.month,
            content: weRunSignCode[clockData.content]
          })
        }
      })
    }
    this.setData({
      daysAddonStyle,
      daysAddon
    });
  }
})