//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: '点击Home键验证指纹',
    userInfo: {},
    hasUserInfo: false,
    supportMode: app.globalData.supportMode,
    supportModeCode: app.globalData.supportModeCode,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  fingerTouch: function(e){
    let that = this
    wx.checkIsSoterEnrolledInDevice({
      checkAuthMode: 'fingerPrint',
      success(res) {
        if (res.isEnrolled){
          wx.startSoterAuthentication({
            requestAuthModes: ['fingerPrint'],
            challenge: app.globalData.rawSign,
            authContent: '请用指纹解锁',
            success: res => {
              /** 校验成功 */
              if(res.errCode === 0){
                wx.navigateTo({
                  url: 'cardPacket'
                })
              }

              
            },
            fail: res => {
              /** 校验失败 */
              if (res.errCode !== 0) {
                wx.showToast({
                  icon: 'none',
                  title: '指纹认证失败...'
                })
              }
              console.log(res)
            }
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '暂不支持没有指纹的设备,抱歉！'
          })
        }
      }
    })
  }
})