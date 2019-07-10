// miniprogram/pages/invite/invite.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    step: 1,
    inviteCount: '',
    inviteName: '',
    count: null,
    Plans: [],
    isShowPlans: false,
    openid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    } else {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          app.globalData.openid = res.result.openid
          this.setData({
            step: 1,
            openid: res.result.openid
          })
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
    const db = wx.cloud.database()
    db.collection('Plans').where({
      ibs: this.data.openid
    }).get({
      success: res => {
        if(!this.checkObject(res.data)){
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
    const db = wx.cloud.database()
    db.collection('Plans').add({
      data: {
        inviteName: this.data.inviteName,
        inviteCount: Number(this.data.inviteCount),
        ibs: this.data.openid
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
    const pages = getCurrentPages()
    if (pages.length === 2) {
      wx.navigateBack()
    } else if (pages.length === 1) {
      wx.redirectTo({
        url: '../index/index',
      })
    } else {
      wx.reLaunch({
        url: '../index/index',
      })
    }
  },
  /**
   * 分享计划
   */
  onShareAppMessage: function () {
    return {
      title: '邀请您完成计划',
      path: '/pages/Home/Home?jsonStr=' + this.data.openid,
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
        showCancel: false,
        success: function (res) {
        }
      });
    } else{
      this.setData({
        inviteCount: e.detail.value
      })
    }
    
  },
  checkObject: function (obj) {
    return obj === null || obj === undefined || obj === '' || Array.isArray(obj)? obj.length === 0: false || Object.keys(obj).length === 0;
  }
})