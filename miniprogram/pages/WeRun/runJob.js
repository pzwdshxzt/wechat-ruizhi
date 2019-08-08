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
    addonShow: true,
    cs: 45,
    addon: 'custom',
    buttons: buttons,
    statusCode: app.globalData.statusCode,
    authCode: app.globalData.authCode,
    job: {},
    progress: 0,
    isloadmore: false,
    authWeRun: false,
    stepInfoList: [],
    toDayRunNum: 0,
    startDate: '',
    demo5_days_style: [],
    daysAddon: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const days_count = new Date(2019, 7, 0).getDate();
    let demo5_days_style = new Array;
    let daysAddon = new Array
    for (let i = 1; i <= days_count; i++) {
      const date = new Date(2019, 7, i);
      if (date.getDay() == 0 || date.getDay() == 6) {
        demo5_days_style.push({
          month: 'current',
          day: i,
          color: '#f488cd'
        });
        daysAddon.push({
          8: '已打卡'
        })
      } else {
        demo5_days_style.push({
          month: 'current',
          day: i,
          color: '#a18ada'
        });
        daysAddon.push({
          8: '补卡'
        })
      }
    }

    demo5_days_style.push({
      month: 'current',
      day: 12,
      color: 'white',
      background: '#b49eeb'
    });
    demo5_days_style.push({
      month: 'current',
      day: 17,
      color: 'white',
      background: '#f5a8f0'
    });
    demo5_days_style.push({
      month: 'current',
      day: 20,
      color: 'white',
      background: '#aad4f5'
    });
    demo5_days_style.push({
      month: 'current',
      day: 25,
      color: 'white',
      background: '#84e7d0'
    });

    this.setData({
      demo5_days_style,
      daysAddon
    });

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
    /** 当前时间 */
    let date = new Date()
    /** 距离项目到期时间 还差几天 可能为负数 */
    let day = Math.floor((Date.parse(this.data.job.endTime) - Date.parse(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())) / (24 * 3600 * 1000));
    /** 项目开始 时间的时间戳 */
    let startTimestamp = util.timeStampToTimeV7(false, this.data.job.createTime, 1)
    let endTimestamp = util.timeStampToTimeV7(true, this.data.job.endTime, 1)
    /**
     * 过滤重接受任务开始的那天算起
     */
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
      return startTimestamp <= info.timestamp * 1000 && endTimestamp >= info.timestamp * 1000
    })


    /** 连续性任务如果有未完成的直接失败 */
    if (this.data.job.type === 1) {
      let isfail = false;
      newArray.map(res => {
        if (res.type === 2) {
          isfail = true
        }
      })
      /**
       * 如果存在没有成功的天数
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
    if (util.checkObject(this.data.job.signData)) {
      // newArray直接更新上去
    } else {
      /**
       *  TODO 如果已经存在打卡数据  
       *  数据拼接 
       *  之前没有打卡得也可以直接自动补签 
       *  数据合在一起
       **/
      console.log(this.data.job.signData)
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
  dayClick(val) {
    /** 判断是否需要打卡 */
    console.log(val)
  },
  prevMonth(val) {
    /** 刷新签到数据 */
    console.log(val)
  },
  nextMonth(val) {
    /** 刷新签到数据 */
    console.log(val)
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
  openApplyPage: function() {
    console.log('手动打卡')
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
})