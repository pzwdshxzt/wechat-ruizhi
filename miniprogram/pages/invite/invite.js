// miniprogram/pages/invite/invite.js
const app = getApp()
const util = require('../../Utils/Util.js');
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    step: 1,
    inviteCount: 0,
    inviteName: '',
    count: null,
    isShowPlans: false,
    openid: '',
    planId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.openid) {
      this.setData({
        step: 1,
        openid: app.globalData.openid
      })
    } else {
      util.loginFunction().then(res => {
        this.setData({
          step: 1,
          openid: res.openid
        })
      }).catch(err => {
        console.log(err)
      })
    }
 
    db.collection('Plans').where({
      ibs: this.data.openid
    }).get({
      success: res => {
        if (!util.checkObject(res.data)){
          this.setData({
            Plans: res.data,
            isShowPlans: true
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
  prevStep: function (){
    this.setData({
      step: this.data.step - 1
    })
  },
  oneNextStep: function () {
    if(this.data.inviteName === ''){
      wx.showToast({
        title: '请输入打卡计划',  
        icon: 'none'
      })
      return  
    }
    if(this.data.inviteCount === ''){
      wx.showToast({
        title: '请输入打卡期数',
        icon: 'none'
      })
      return  
    }
    this.setData({
      step: this.data.step + 1
    })
  },
  twoNextStep: function () {  
    db.collection('Plans').add({
      data: {
        inviteName: this.data.inviteName,
        inviteCount: Number(this.data.inviteCount),
        ibs: this.data.openid
      },
      success: res =>{
        this.setData({
          planId: res._id
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
    this.setData({
      step: this.data.step + 1
    })
  },
  shareMenu: function () {
    wx.showToast({
      title: '点击右上角分享给好友',
      icon: 'none'
    })
  },
  goHome: function () {
    util.homePage()
  },
  /**
   * 分享计划
   */
  onShareAppMessage: function () {
    return {
      title: '邀请您完成计划',
      path: '/pages/invited/invited?planId=' + this.data.planId,
      success :function(res) {
        console.log('转发成功',res)
      }
    }
  },
  getInviteName: function (e) {
    this.setData({
      inviteName: e.detail.value
    })
  },
  getInviteCount: function (e) {
    var reg = /^[0-9]+.?[0-9]*$/; //判断字符串是否为数字 ，判断正整数用/^[1-9]+[0-9]*]*$/
    var num = e.detail.value;
    if (!reg.test(num)) {
      wx.showModal({
        content: '请填写数字',
        showCancel: false
      });
      this.setData({
        inviteCount: 0
      })
    } else{
      this.setData({
        inviteCount: e.detail.value
      })
    }
    
  }
})