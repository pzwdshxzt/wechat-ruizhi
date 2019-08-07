// components/calendar/calendar.js
Component({
  properties:{
    signArr: {
      type: Array,
      default: []
    }, 
  },
  data: {
    year: 0,
    month: 0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [],
    isToday: 0,
    isTodayWeek: false,
    todayIndex: 0
  },
  lifetimes: {
    ready: function() {
      let now = new Date();
      let year = new Date().getFullYear();
      let month = new Date().getMonth() + 1;
      this.dateInit()
      this.setData({
        year: year,
        month: month,
        isToday: '' + year + month + now.getDate()
      })
    },
    show: function(e) {
      console.log(e)
    }
  },
  methods: {
    dateInit: function(setYear, setMonth) {
      //全部时间的月份都是按0~11基准，显示月份才+1
      let now = setYear ? new Date(setYear, setMonth) : new Date();
      let year = setYear || now.getFullYear();
      //没有+1方便后面计算当月总天数
      let month = setMonth || now.getMonth();
      //目标月1号对应的星期
      let startWeek = new Date(year, month, 1).getDay(); 
      //获取目标月有多少天
      let dayNums = new Date(year, month + 1, 0).getDate();
      let obj = {};
      let num = 0;
      let dateArr = []; //需要遍历的日历数组数据
      let arrLen = 0; //dateArr的数组长度
      arrLen = startWeek + dayNums;
      for (let i = 0; i < arrLen; i++) {
        if (i >= startWeek) {
          num = i - startWeek + 1;
          obj = {
            isToday: '' + year + (month + 1) + num,
            dateNum: num,
            weight: 5
          }
        } else {
          obj = {};
        }
        dateArr[i] = obj;
      }
      this.setData({
        dateArr: dateArr
      })
      let nowDate = new Date();
      let nowYear = nowDate.getFullYear();
      let nowMonth = nowDate.getMonth() + 1;
      let nowWeek = nowDate.getDay();
      let getYear = setYear || nowYear;
      let getMonth = setMonth >= 0 ? (setMonth + 1) : nowMonth;
      if (nowYear === getYear && nowMonth === getMonth) {
        this.setData({
          isTodayWeek: true,
          todayIndex: nowWeek
        })
      } else {
        this.setData({
          isTodayWeek: false,
          todayIndex: -1
        })
      }
    },
    /**
     * 上月切换
     */
    lastMonth: function() {
      //全部时间的月份都是按0~11基准，显示月份才+1
      let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
      let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
      this.setData({
        year: year,
        month: (month + 1)
      })
      this.dateInit(year, month);
    },
    /**
     * 下月切换
     */
    nextMonth: function() {
      //全部时间的月份都是按0~11基准，显示月份才+1
      let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
      let month = this.data.month > 11 ? 0 : this.data.month;
      this.setData({
        year: year,
        month: (month + 1)
      })
      this.dateInit(year, month);
    },
    lookHuoDong: function(e) {
      console.log(e)
    },
    prefixInteger: function(num, length) {
      return (Array(length).join('0') + num).slice(-length);
    }
  }

})