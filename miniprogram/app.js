//app.js
const defaultTime = {
  defaultWorkTime: 25,
  defaultRestTime: 5
}
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: "qaq-uau6p",
        traceUser: true,
      })
    }
    let workTime = wx.getStorageSync('workTime')
    let restTime = wx.getStorageSync('restTime')
    if (!workTime) {
      wx.setStorage({
        key: 'workTime',
        data: defaultTime.defaultWorkTime
      })
    }
    if (!restTime) {
      wx.setStorage({
        key: 'restTime',
        data: defaultTime.defaultRestTime
      })
    }
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })

    wx.checkIsSupportSoterAuthentication({
      success: res => {
        this.globalData.supportMode = res.supportMode
      }
    })
  },
  globalData: {
    rawSign: 'RZ95120512',
    /** 时间大于多少充裕呢 */
    ampleTime: 14,
    userInfo: {},
    imgSrc: '',
    shareImg: [
      'https://6379-cyq-dev-amyvi-1251696577.tcb.qcloud.la/share_0.png?sign=079c089bd1013e332afb35bb7f5950e6&t=1564998222',
      'https://6379-cyq-dev-amyvi-1251696577.tcb.qcloud.la/share_1.png?sign=cf5e07d8da6208489d2ec4947ad3c905&t=1564998392',
      'https://6379-cyq-dev-amyvi-1251696577.tcb.qcloud.la/share_2.png?sign=c9bef885e1112d7ab95921ecda92d5d4&t=1564998426',
      'https://6379-cyq-dev-amyvi-1251696577.tcb.qcloud.la/share_3.png?sign=8e35b6f7f040102c97e5a5cca2643be6&t=1564998435'
    ],
    weRunSignCode: ['开始', '已打卡', '补卡', '漏卡', '未完成', '未打卡', '结束日'],
    weRunSignColorCode: ['#aad4f5', '#00CD00', '#b49eeb', '#f5a8f0', '#FF7F24', '#FF7F24', '#aad4f5'],
    statusCode: ['进行中', '已完成', '放弃', '计划废弃', '失败'],
    authCode: ['待审核', '已拒绝', '审核通过'],
    typeCode: ['打卡', '运动(连续型)', '运动(累计型)'],
    showCode: ['否', '是'],
    supportModeMsg: {
      fingerPrint: '指纹',
      facial: '人脸',
      speech: '声纹'
    },
    supportMode: [],
    ColorList: [{
        title: '嫣红',
        name: 'red',
        color: '#e54d42'
      },
      {
        title: '桔橙',
        name: 'orange',
        color: '#f37b1d'
      },
      {
        title: '明黄',
        name: 'yellow',
        color: '#fbbd08'
      },
      {
        title: '橄榄',
        name: 'olive',
        color: '#8dc63f'
      },
      {
        title: '森绿',
        name: 'green',
        color: '#39b54a'
      },
      {
        title: '天青',
        name: 'cyan',
        color: '#1cbbb4'
      },
      {
        title: '海蓝',
        name: 'blue',
        color: '#0081ff'
      },
      {
        title: '姹紫',
        name: 'purple',
        color: '#6739b6'
      },
      {
        title: '木槿',
        name: 'mauve',
        color: '#9c26b0'
      },
      {
        title: '桃粉',
        name: 'pink',
        color: '#e03997'
      },
      {
        title: '棕褐',
        name: 'brown',
        color: '#a5673f'
      },
      {
        title: '玄灰',
        name: 'grey',
        color: '#8799a3'
      },
      {
        title: '草灰',
        name: 'gray',
        color: '#aaaaaa'
      },
      {
        title: '墨黑',
        name: 'black',
        color: '#333333'
      },
      {
        title: '雅白',
        name: 'white',
        color: '#ffffff'
      },
    ]
  }
})