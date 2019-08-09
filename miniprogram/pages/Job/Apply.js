// miniprogram/pages/Job/Apply.js
const db = wx.cloud.database()
const _ = db.command
const util = require('../../Utils/Util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    date: util.formatDate(new Date()),
    time: util.formatTime(new Date()),
    applyCount: 0,
    applyCountList: [0, 1, 2, 3, 4, 5],
    applyTextarea: '',
    jobId: '',
    pid: '',
    inputNum: 0,
    isAgree: false,
    errorMsg: '输入有误',
    files: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      jobId: options.JobId,
      pid: options.pid
    })
  },
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function(e) {
    this.setData({
      time: e.detail.value
    })
  },
  bindApplyCount: function(e) {
    this.setData({
      applyCount: Number(e.detail.value)
    })
  },
  applyTextarea: function(e) {
    console.log(e)
    this.setData({
      inputNum: e.detail.value.length,
      applyTextarea: e.detail.value
    })
  },
  checkInfo: function() {
    if (0 === this.data.applyCount || util.checkObject(this.data.applyCount)) {
      this.showTopTips('请选择打卡期数')
      return true
    }
    if (util.checkObject(this.data.applyTextarea)) {
      this.showTopTips('请填写备注')
      return true
    }
    if (!this.data.isAgree) {
      this.showTopTips('请同意相关条款')
      return true
    }
    return false
  },
  applyStep: function(e) {
    console.log(e)
    util.openLoading('正在玩命申请中')
    if (!this.checkInfo()) {
      db.collection('JobDetails').add({
        data: {
          jobId: this.data.jobId,
          planId: this.data.pid,
          date: this.data.date,
          time: this.data.time,
          applyTextarea: this.data.applyTextarea,
          applyCount: this.data.applyCount,
          authFlag: 0,
          formId: e.detail.formId,
          createTime: util.getTimeStamp(),
          updateTime: util.getTimeStamp(),
          files: this.data.files
        },
        success: res => {
          util.closeLoading()
          util.successPage('申请成功', '你得申请已提交，将有任务发布者进行审核，请等待!!')
        },
        fail: err => {
          util.closeLoading()
          util.failPage('申请失败', '你得申请由于不可抗力因素失败，请稍后再试!!')
        }
      })
    } else {
      util.closeLoading()
    }
  },
  bindAgreeChange: function(e) {
    this.setData({
      isAgree: !!e.detail.value.length
    });
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
  chooseImage: function (e) {
    var that = this;
    
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        res.tempFilePaths.map(file =>{
          let path = 'apply-' + util.getTimeStamp() + util.getRandInt(10000000, 99999999) + '.png'
          wx.cloud.uploadFile({
            cloudPath: path,
            filePath: file,
          }).then(res => {
            that.setData({
              files: that.data.files.concat(res.fileID)
            });
          })
        })
      }
    })
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  }
})