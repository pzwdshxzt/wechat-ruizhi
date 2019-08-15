const util = require('../../Utils/Util.js');
import F2 from '@antv/wx-f2';
let selectChart = null;

function selectInitChart(canvas, width, height, F2) {
  const data = [];
  selectChart = new F2.Chart({
    el: canvas,
    width,
    height
  });

  selectChart.source(data, {
    date: {
      tickCount: 5
    },
    step: {
      tickCount: 5
    }
  });
  selectChart.axis('date', {
    label(text, index, total) {
      const textcfg = {};
      if (index === 0) {
        textcfg.textAlign = 'left'
      }
      if (index === total - 1) {
        textcfg.textAlign = 'right'
      }
      return textcfg
    }
  })
  selectChart.axis('step', {
    label(text) {
      return {
        text: text + '步'
      }
    }
  })
  selectChart.tooltip({
    snap: true,
    showXTip: true,
    showYTip: true,
    showCrosshairs: true,
    crosshairsType: 'xy',
    crosshairsStyle: {
      lineDash: [2]
    },
    onShow(ev) {
      const items = ev.items;
      items[0].name = items[0].title + '号';
      items[0].value = items[0].value + '步';
    }
  });
  selectChart.area().position('date*step');
  selectChart.point().position('date*step').style({
    stroke: '#fff',
    lineWidth: 1
  });
  selectChart.line().position('date*step').color('#3197ed');
  selectChart.render();
  return selectChart;
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectOpts: {
      onInit: selectInitChart
    },
    stepInfoList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.initData()

  },
  initData: function() {
    let that = this
    wx.getWeRunData({
      success(res) {
        const cloudID = res.cloudID
        wx.cloud.callFunction({
          name: 'openapi',
          data: {
            action: 'getWeRunAllData',
            weRunData: wx.cloud.CloudID(cloudID),
          }
        }).then(res => {
          res.result.map(data => {
            let date = util.timeStampToTimeV0(data.timestamp);
            data.date = (date.getMonth() + 1) + '.' + date.getDate()
          })
          that.setData({
            stepInfoList: res.result
          })
          selectChart.changeData(res.result)
        })
      },
      fail(res) {
        wx.showModal({
          title: '提示',
          content: '未获得授权，获取步数失败',
          showCancel: true,
          confirmText: '去授权',
          cancelText: '知道了',
          success(res) {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.initData()
    wx.stopPullDownRefresh()
  }
})