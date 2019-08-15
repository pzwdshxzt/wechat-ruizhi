const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [{
      cardNo: '6214123412341234',
      img: 'https://image.weilanwl.com/color2.0/plugin/sylb2244.jpg'
    },
    {
      cardNo: '6214123412341234',
      img: 'https://image.weilanwl.com/color2.0/plugin/wdh2236.jpg'
    },
    {
      cardNo: '6214123412341234',
      img: 'https://image.weilanwl.com/color2.0/plugin/qpct2148.jpg'
    },
    {
      cardNo: '6214123412341234',
      img: 'https://image.weilanwl.com/color2.0/plugin/qpczdh2307.jpg'
    }
    ]
  },
  addCard:function(e){
    console.log(e)
  }
})