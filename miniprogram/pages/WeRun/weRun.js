const util = require('../../Utils/Util.js');
import F2 from '@antv/wx-f2';
let chart = null;

function initChart(canvas, width, height, F2) { // 使用 F2 绘制图表
  const data = [
    // { year: '1951 年', sales: 38 },
    // { year: '1952 年', sales: 52 },
    // { year: '1956 年', sales: 61 },
    // { year: '1957 年', sales: 145 },
    // { year: '1958 年', sales: 48 },
    // { year: '1959 年', sales: 38 },
    // { year: '1960 年', sales: 38 },
    // { year: '1962 年', sales: 38 },
  ];
  chart = new F2.Chart({
    el: canvas,
    width,
    height
  });

  chart.source(data, {
    step: {
      tickCount: 5
    },
    date: {
      tickCount: 10
    }
  });
  chart.tooltip({
    showItemMarker: false,
    onShow(ev) {
      const {
        items
      } = ev;
      items[0].name = null;
      items[0].name = items[0].title + '号';
      items[0].value = items[0].value + '步';
    }
  });
  chart.interval().position('date*step');
  chart.render();
  return chart;
}

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
      tickCount: 10
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
    crosshairsType: 'xy',
    crosshairsStyle: {
      lineDash: [2]
    },
    onShow(ev) {
      const {
        items
      } = ev;
      items[0].name = null;
      items[0].name = items[0].title + '号';
      items[0].value = items[0].value + '步';
    }
  });

  selectChart.area().position('date*step').color('#ccc');
  selectChart.line().position('date*step').color('blue');
  selectChart.render();
  return selectChart;
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // opts: {
    //   onInit: initChart
    // },
    selectOpts: {
      onInit: selectInitChart
    },
    stepInfoList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    wx.getWeRunData({
      success(res) {
        // 拿 encryptedData 到开发者后台解密开放数据
        const encryptedData = res.encryptedData
        // 或拿 cloudID 通过云调用直接获取开放数据
        const cloudID = res.cloudID
        console.log(res)
        wx.cloud.callFunction({
          name: 'openapi',
          data: {
            action: 'getWeRunData',
            weRunData: wx.cloud.CloudID(cloudID), // 这个 CloudID 值到云函数端会被替换
          }
        }).then(res => {
          console.log(res.result)
          console.log(util.timeStampToTimeV3(res.result.timestamp))
        })
        wx.cloud.callFunction({
          name: 'openapi',
          data: {
            action: 'getWeRunAllData',
            weRunData: wx.cloud.CloudID(cloudID), // 这个 CloudID 值到云函数端会被替换
          }
        }).then(res => {
          res.result.map(data => {
            let date = util.timeStampToTimeV4(data.timestamp);
            data.date = (date.getMonth()+1) + '.' + date.getDate()
          })
          that.setData({
            stepInfoList: res.result
          })
          // chart.changeData(res.result)
          selectChart.changeData(res.result)
        })
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})