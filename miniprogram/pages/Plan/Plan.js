// miniprogram/pages/Plan/Plan.js
const db = wx.cloud.database()
const util = require('../../Utils/Util.js');
const dbConsole = require('../../Utils/DbConsole.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sAngle: 0,
    eAngle: 360,
    spaceBetween: 10,
    buttons: [{
        openType: 'contact',
        label: 'Contact',
        icon: '/images/contact.png',
      },
      {
        label: 'Delete Plan',
        icon: '/images/delete.png'
      },
      {
        openType: 'share',
        label: 'Share Plan',
        icon: '/images/share.png'
      },
      {
        label: 'Change Show',
        icon: '/images/change.png'
      }
    ],
    plan: {},
    Jobs: [],
    authCode: ['待审核', '已拒绝', '审核通过'],
    statusCode: ['进行中', '计划废弃'],
    typeCode: ['打卡'],
    showCode: ['否', '是']
  },
  onLoad: function(options) {
    util.openLoading('数据加载中')
    db.collection('Plans').doc(options.PlanId).get().then(res => {
      this.setData({
        plan: res.data
      })
    })
    db.collection('Jobs').where({
      planId: options.PlanId
    }).get().then(res => {
      this.setData({
        Jobs: res.data
      })
    })

    util.closeLoading()
  },
  onShareAppMessage: function() {
    return {
      path: '/pages/invited/invited?planId=' + this.data.plan._id,
      desc: '快来完成我发布的计划吧',
      imageUrl: '/images/share_' + util.getRandInt(0, 4) + '.png',
      success: function(res) {
        console.log('转发成功', res)
      }
    }
  },
  onClick(e) {
    if (e.detail.index === 1) {
      wx.showModal({
        title: '提示',
        content: '是否真的废弃这个计划',
        success: res => {
          if (res.confirm) {
            dbConsole.updatePlanStatus(this.data.plan._id, 1).then(res => {
              console.log(res)
              util.homePage()
            })
          }
        }
      })
    }
    if (e.detail.index === 3) {
      wx.showModal({
        title: '提示',
        content: ' 是否要改变计划展示状态，现在状态为：' + this.data.showCode[this.data.plan.show],
        success: res => {
          if (res.confirm) {
            let show_num = 1
            if (this.data.plan.show) {
              show_num = 0
            }
            dbConsole.updatePlanShow(this.data.plan._id, show_num).then(res => {
              console.log(res)
              util.homePage()
            })
          }
        }
      })
    }
  },
  onContact(e) {},
  onChange(e) {},
  onAngle(e) {
    console.log(e)
    const {
      value
    } = e.detail
    const sAngle = value ? -90 : 0
    const eAngle = value ? -210 : 360
    const spaceBetween = value ? 30 : 10

    this.setData({
      sAngle,
      eAngle,
      spaceBetween,
    })
  }
})