// miniprogram/pages/invite/invite.js
const app = getApp()
const util = require('../../Utils/Util.js');
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inviteCount: '',
    inviteName: '',
    openid: '',
    show: 1,
    content: '',
    contentCount: 0,
    award: '',
    awardCount: 0,
    type: 0,
    types: ["打卡"],
    isAgree: false,
    showTopTips: false,
    errorMsg: '输入有误',
    inviteLimitCount: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    } else {
      util.loginFunction().then(res => {
        this.setData({
          openid: res.openid
        })
      }).catch(err => {
        console.log(err)
      })
    }
  },
  goHome: function() {
    util.homePage()
  },

  getContent: function(e) {
    this.setData({
      content: e.detail.value,
      contentCount: e.detail.value.length
    })
  },
  getAward: function(e) {
    this.setData({
      award: e.detail.value,
      awardCount: e.detail.value.length
    })
  },
  getInviteName: function(e) {
    this.setData({
      inviteName: e.detail.value
    })
  },
  getInviteCount: function(e) {
    var reg = /^[0-9]+.?[0-9]*$/; //判断字符串是否为数字 ，判断正整数用/^[1-9]+[0-9]*]*$/
    var num = e.detail.value;
    if (!reg.test(num)) {
      this.showTopTips('请填写数字')
      this.setData({
        inviteCount: ''
      })  
    } else {
      this.setData({
        inviteCount: e.detail.value
      })
    }
  },
  getInviteLimitCount: function(e) {
    var reg = /^[0-9]+.?[0-9]*$/; //判断字符串是否为数字 ，判断正整数用/^[1-9]+[0-9]*]*$/
    var num = e.detail.value;
    if (!reg.test(num)) {
      this.showTopTips('请填写数字')
      this.setData({
        inviteLimitCount: ''
      })
    } else {
      this.setData({
        inviteLimitCount: e.detail.value
      })
    }
  },
  bindTypeCodeChange: function(e) {
    this.setData({
      type: e.detail.value
    })
  },
  bindAgreeChange: function(e) {
    this.setData({
      isAgree: !!e.detail.value.length
    });
  },
  checkInfo: function() {
    if (this.data.inviteName === '') {
      this.showTopTips('请输入计划名称')
      return true
    }
    if (this.data.inviteCount === 0 || this.data.inviteCount === '') {
      this.showTopTips('请输入计划期数')
      return true
    }
    if (!this.data.isAgree) {
      this.showTopTips('请同意相关条款')
      return true
    }
    if (!this.data.award) {
      this.showTopTips('请填写完成后的奖励')
      return true
    }
    if (!this.data.content) {
      this.showTopTips('请填写任务说明')
      return true
    }
    return false
  },
  sumbitPlan: function() {
    if (!this.checkInfo()) {
      db.collection('Plans').add({
        data: {
          inviteName: this.data.inviteName,
          inviteCount: Number(this.data.inviteCount),
          ibs: this.data.openid,
          status: 0,
          show: this.data.show,
          content: this.data.content,
          award: this.data.award,
          type: Number(this.data.type),
          inviteLimitCount: util.checkObject(this.data.inviteLimitCount) ? 0 : Number(this.data.inviteLimitCount),
          createTime: util.getTimeStamp(),
          updateTime: util.getTimeStamp()
        },
        success: res => {
          wx.reLaunch({
            url: 'success?planId=' + res._id
          })
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '添加计划失败'
          })
          console.error('[数据库] [新增记录] 失败：', err)
        }
      })
    }
  },
  /**
   * 1.展示
   * 0.不展示
   */
  showPlan: function(e) {
    if (e.detail.value) {
      this.setData({
        show: 1
      })
    } else {
      this.setData({
        show: 0
      })
    }
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
        errorMsg: '输入错误'
      });
    }, 3000);
  }
})