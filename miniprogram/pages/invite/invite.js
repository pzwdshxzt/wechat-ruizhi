// miniprogram/pages/invite/invite.js
const app = getApp()
const util = require('../../Utils/Util.js');
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: '',
    inviteCount: '',
    inviteName: '',
    openid: '',
    show: 1,
    content: '',
    contentCount: 0,
    award: '',
    awardCount: 0,
    weRunNum: '',
    showWeRunNum: false,
    type: 0,
    types: ["打卡","运动"],
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
  getWeRunNum:function(e) {
    if (this.checkNum(e.detail.value)) {
      this.setData({
        weRunNum: e.detail.value
      })
    } else {
      console.log(e)
      this.setData({
        weRunNum: ''
      })
    }
  },
  getInviteCount: function(e) {
    if (this.checkNum(e.detail.value)) {
      this.setData({
        inviteCount: e.detail.value
      })
    } else {
      console.log(e)
      this.setData({
        inviteCount: ''
      })
    }
  },
  getInviteLimitCount: function(e) {
    if (this.checkNum(e.detail.value)) {
      this.setData({
        inviteLimitCount: e.detail.value
      })
    } else {
      console.log(e)
      this.setData({
        inviteLimitCount: ''
      })
    }
  },
  checkNum: function(num){
    var reg = /^[0-9]+.?[0-9]*$/; //判断字符串是否为数字 ，判断正整数用/^[1-9]+[0-9]*]*$/
    if (!reg.test(num)) {
      this.showTopTips('请填写数字')
      return false
    }
    return true
  },
  bindTypeCodeChange: function(e) {
    this.setData({
      type: e.detail.value
    })
    if (e.detail.value === '1' && !this.data.showWeRunNum) {
      this.setData({
        showWeRunNum: true
      })
    }
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
    if (this.data.type === '1') {
      if (this.data.weRunNum === 0 || this.data.weRunNum === '0' || this.data.weRunNum === '') {
        this.showTopTips('请输入微信运动步数')
        return true
      }
    }
    if (this.data.inviteCount === 0 || this.data.inviteCount === '0' || this.data.weRunNum === '') {
      this.showTopTips('请输入计划期数/运动天数')
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
    if (!this.data.files) {
      this.showTopTips('请上传首页轮播图片')
      return true
    }
    return false
  },
  sumbitPlan: function() {
    if (!this.checkInfo()) {
      util.openLoading('正在玩命申请中...')
      let path = 'banner-' + util.getTimeStamp() + '.png'
      wx.cloud.uploadFile({
        cloudPath: path,
        filePath: this.data.files,
      }).then(res => {
        this.setData({
          files: res.fileID
        })
        console.log(res.fileID)
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
            updateTime: util.getTimeStamp(),
            banner_url: res.fileID,
            weRunNum: Number(this.data.weRunNum)
          }
        }).then(res => {
          util.closeLoading()
          wx.reLaunch({
            url: 'success?planId=' + res._id
          })
        }).catch(res => {
          wx.showToast({
            icon: 'none',
            title: '添加计划失败'
          })
          console.error('[数据库] [新增记录] 失败：', err)
        })
      }).catch(res => {
        console.log(res)
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
  },
  chooseImage: function(e) {
    var that = this;
    wx.navigateTo({
      url: 'cropper',
    })
  },
  previewImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: [this.data.files] // 需要预览的图片http链接列表
    })
  },
  onShow: function() {
    if (app.globalData.imgSrc) {
      this.setData({
        files: app.globalData.imgSrc
      })
      app.globalData.imgSrc = ''
    }
  }
})