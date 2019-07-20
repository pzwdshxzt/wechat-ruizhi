// miniprogram/pages/invited/invited.js

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
    plan: {},
    isSharePageIn: false,
    errorMsg: '你已经接受了该计划!',
    statusCode: ['进行中', '计划废弃'],
    typeCode: ['打卡'],
    showCode: ['否', '是'],
    errorMsg: '系统异常QAQ'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    util.getUserInfo()
    util.openLoading('数据加载中')
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
      this.initData(options)
    } else {
      util.loginFunction().then(res => {
        this.setData({
          openid: res.openid
        })
        this.initData(options)
      }).catch(err => {
        console.log(err)
      })

    }
  },

  initData: function(options) {
    if (!util.checkObject(options) && !util.checkObject(options.planId)) {
      db.collection('Plans')
        .doc(options.planId)
        .get().then(res => {
          this.setData({
            plan: res.data,
          })
          this.checkInfo(options)
        })
    }
  },

  checkInfo: function(options) {
    db.collection('Jobs').where({
      planId: options.planId,
      jober: this.data.openid,
      status: 0
    }).get().then(res => {
      if (util.checkObject(res.data)) {
        if (this.data.plan._openid === this.data.openid) {
          this.showTopTips('您不能参与自己的计划!')
        } else {
          this.setData({
            isSharePageIn: true
          })
        }
      } else {
        this.showTopTips('你已经加入该计划!')
      }
      util.closeLoading()
    }).catch(res => {
      console.log(res)
      util.closeLoading()
      this.showTopTips('系统异常QAQ')
    })
    if (this.data.plan.inviteLimitCount !== 0) {
      db.collection('Jobs').where({
        planId: options.planId
      }).get().then(res => {
        let newCount = res.data.length + 1
        if (this.data.plan.inviteLimitCount < newCount) {
          this.setData({
            isSharePageIn: false
          })
          this.showTopTips('该项目接受人数已经达到最大限制了！!')
        }
      })
    }

  },
  /**
   * 选择要执行的计划
   */
  acceptPlan: function(e) {
    util.openLoading('正在玩命的加载数据')
    db.collection('Jobs').add({
      data: {
        planId: this.data.plan._id,
        planUid: this.data.plan._openid,
        jober: this.data.openid,
        inviteName: this.data.plan.inviteName,
        inviteCount: this.data.plan.inviteCount,
        doneCount: 0,
        userInfo: app.globalData.userInfo,
        status: 0,
        createTime: util.getTimeStamp(),
        updateTime: util.getTimeStamp()
      },
      success: res => {
        this.setData({
          isSharePageIn: false
        })
        util.closeLoading()
        wx.showToast({
          icon: 'none',
          title: '接受任务成功！'
        })
        util.homePage()
      },
      fail: err => {
        this.showTopTips('接受任务失败!')
      }
    })
  },
  onShow: function() {
    util.getUserInfo()
  },
  cancelStep: function() {
    util.homePage()
  },
  showTopTips: function(msg) {
    var that = this;
    this.setData({
      showTopTips: true,
      errorMsg: msg
    });
    setTimeout(function() {
      that.setData({
        showTopTips: false,
        errorMsg: '系统异常QAQ'
      });
    }, 3000);
  }
})