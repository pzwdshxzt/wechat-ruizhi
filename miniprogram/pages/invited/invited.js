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
    errorMsg: '你已经接受了该计划!'
  },

  /**
   * 生命周期函数--监听页面加载
   */ 
  onLoad: function(options){
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

  initData: function(options){
    if (!util.checkObject(options) && !util.checkObject(options.planId)) {
      db.collection('Jobs').where({
        planId: options.planId,
        jober: this.data.openid,
        status: 0
      }).get({
        success: res =>{
          if(util.checkObject(res.data)){
            db.collection('Plans').doc(options.planId).get().then(res => {
              if(res.data._openid === this.data.openid){
                this.setData({
                  errorMsg: '您不能参与自己的计划!'
                })
              }else {
                this.setData({
                  plan: res.data,
                  isSharePageIn: true
                })
              }
              util.closeLoading()
            })
          } else {
            util.closeLoading()
          }
        },
        fail: res => {
          util.closeLoading()
          this.setData({
            errorMsg: '查询计划失败!'
          })
        }
      })
    }
  },
  /**
   * 选择要执行的计划
   */
  acceptPlan: function(e){
    util.openLoading('正在玩命的加载数据')
    db.collection('Jobs').add({
      data: {
        planId: this.data.plan._id,
        planUid: this.data.plan._openid,
        jober: this.data.openid,
        inviteName: this.data.plan.inviteName,
        inviteCount: this.data.plan.inviteCount,
        doneCount: 0,
        userInfo: app.globalData.userInfo
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
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '接受计划失败'
        })
      }
    })
  },
  goHome(){
    util.homePage()
  },
  onShow:function(){
    util.getUserInfo()
  }
})