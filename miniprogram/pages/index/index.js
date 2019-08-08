const app = getApp()
const util = require('../../Utils/Util.js');
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: app.globalData.userInfo,
    logged: false,
    takeSession: false,
    nickName: '',
    workTime: '',
    restTime: ''
  },

  onLoad: function() {
    this.setData({
      workTime: wx.getStorageSync('workTime'),
      restTime: wx.getStorageSync('restTime')
    })

    if (util.checkObject(this.data.userInfo)) {
      util.getUserInfo().then(res => {
        this.setData({
          avatarUrl: res.avatarUrl,
          userInfo: res,
          nickName: res.nickName
        })
      }).catch(err => {
        console.log('auth err')
      })
    }
  },

  registerUserInfo: function(e) {
    if (util.checkObject(this.data.userInfo)) {
      util.checkAuthUserInfo().then(res => {
        console.log(res)
        this.setData({
          avatarUrl: res.avatarUrl,
          userInfo: res,
          nickName: res.nickName
        })
      }).catch(err => {
        console.log('auth err')
      })
    }
  },
  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  // 上传图片
  doUpload: function() {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  changeWorkTime: function(e) {
    wx.setStorage({
      key: 'workTime',
      data: e.detail.value
    })
  },
  changeRestTime: function(e) {
    wx.setStorage({
      key: 'restTime',
      data: e.detail.value
    })
  },
  onShow:function(){
    if (util.checkObject(this.data.userInfo)) {
      util.getUserInfo().then(res => {
        this.setData({
          avatarUrl: res.avatarUrl,
          userInfo: res,
          nickName: res.nickName
        })
      }).catch(err => {
        console.log('auth err')
      })
    }
  },
  onBuild(){
    wx.showToast({
      icon: 'none',
      title: '正在建设中...'
    })
  }
})