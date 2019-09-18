const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const dbConsole = require('DbConsole.js');


Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

function getDates(startDate, stopDate) {
  var dateArray = new Array();
  var currentDate = startDate;
  while (currentDate <= stopDate) {
    let obj = {
      date: formatDate(new Date(currentDate)),
      dateTime: Date.parse(currentDate)
    }
    dateArray.push(obj);
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

const formatDateTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumer).join('-') + ' ' + [hour, minute, second].map(formatNumer).join(':')
}
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumer).join('-')
}
const formatTime = date => {
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [hour, minute, second].map(formatNumer).join(':')
}
const checkObject = obj => {
  if (obj instanceof Array) {
    return obj.length === 0
  }
  if (obj instanceof Object) {
    return Object.keys(obj).length === 0
  }
  return obj === undefined || obj === null || obj === '';
}
const formatNumer = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const successPage = (title, content) => {
  wx.navigateTo({
    url: '../success/success?title=' + title + '&content=' + content
  })
}
const failPage = (title, content) => {
  wx.navigateTo({
    url: '../fail/fail?title=' + title + '&content=' + content
  })
}
const homePage = () => {
  wx.switchTab({
    url: '../Home/Home',
    fail: function() {
      console.info("跳转失败")
    }
  })
}
const backPage = (num) => {
  wx.navigateBack({
    delta: num
  });
}
const openLoading = (title) => {
  wx.showLoading({
    title: title,
    mask: true
  })
}
const closeLoading = () => {
  wx.hideLoading();
  wx.stopPullDownRefresh();
}
const getPercent = (num, total) => {
  num = parseFloat(num);
  total = parseFloat(total);
  if (isNaN(num) || isNaN(total)) {
    return "-";
  }
  return total <= 0 ? 0 : (Math.round(num / total * 10000) / 100.00);
}
const loginFunction = (userInfoID) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'login',
      data: {
        userInfoData: wx.cloud.CloudID(userInfoID)
      },
      success: res => {
        resolve(res.result)
      },
      fail: err => {
        resolve()
      }
    })
  })
}
const checkAuthUserInfo = () => {
  return new Promise((resolve, reject) => {
    if (checkObject(app.globalData.userInfo)) {
      // 获取用户信息
      wx.getSetting({
        success: res => {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: res => {
                app.globalData.userInfo = res.userInfo
                resolve(res.userInfo)
              }
            })
          } else {
            reject()
            gotoAuth()
          }
        }
      })
    } else {
      resolve(app.globalData.userInfo)
    }
  })
}
const getUserInfo = () => {
  return new Promise((resolve, reject) => {
    if (checkObject(app.globalData.userInfo)) {
      // 获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                app.globalData.userInfo = res.userInfo
                resolve(res.userInfo)
              }
            })
          } else {
            reject()
          }
        }
      })
    } else {
      resolve(app.globalData.userInfo)
    }
  })
}
const gotoAuth = () => {
  wx.navigateTo({
    url: '../Auth/Auth'
  })
}
const addUserInfo = (openid, userInfo) => {
  db.collection('UserInfos').where({
    _openid: openid
  }).get().then(res => {
    if (checkObject(res.data)) {
      db.collection('UserInfos').add({
        data: userInfo,
        success: res => {
          console.log(res)
        },
        fail: err => {
          console.log(err)
        }
      })
    }
  })

}
const compareVersion = (v1, v2) => {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

const planForEach = (res) => {
  return new Promise((resolve, reject) => {
    if (!checkObject(res)) {
      res.forEach(obj => {
        dbConsole.queryUserInfos(obj.jober).then(u => {
          let userInfo = u[0]
          if (!checkObject(userInfo)) {
            db.collection('JobDetails').where({
              _openid: userInfo._openid
            }).get().then(JobDetails => {
              console.log(JobDetails)
              obj.userInfo.JobDetails = JobDetails.data
            })
            obj.userInfo = userInfo
          }
        })
        resolve(res)
      })
    }
  })
}
/**
 * 获取范围随机数
 */
const getRandInt = (min, max) => {
  return min + Math.floor(Math.random() * (max - min));
}
const formatTimeV2 = (time, format) => {
  let temp = '0000000000' + time
  let len = format.length
  return temp.substr(-len)
}

const getTimeStamp = () => {
  return Date.parse(new Date())
}
/**
 * 2010年12月23日 10:53
 */
const timeStampToTimeV1 = (timeStamp) => {
  return new Date(parseInt(timeStamp) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
}
const timeStampToTimeV2 = (timeStamp) => {
  return new Date(parseInt(timeStamp) * 1000).toLocaleString().substr(0, 17)
}
/**
 * 2010-10-20 10:00:00
 */
const timeStampToTimeV3 = (timeStamp) => {
  return new Date(parseInt(timeStamp) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
}

const timeStampToTimeV0 = (timeStamp) => {
  return new Date(parseInt(timeStamp) * 1000);
}
const timeStampToTimeV4 = (timeStamp, seperator) => {
  let date = new Date(parseInt(timeStamp) * 1000);
  return date.getFullYear() + seperator + (date.getMonth() + 1) + seperator + date.getDate();
}
const timeStampToTimeV5 = (timeStamp, seperator) => {
  let date = new Date(parseInt(timeStamp))
  return date.getFullYear() + seperator + (date.getMonth() + 1) + seperator + date.getDate();
}
/**
 * 计算时间相差几天的日期
 * 
 * future: 表示未来还是当前 boolean
 * timeStamp: 表示时间戳
 * num: 与timeStamp 相差几天
 * seperator: 返回的分隔符
 */
const timeStampToTimeV6 = (future, timeStamp, num, seperator) => {
  let date = {}
  if (checkObject(timeStamp)) {
    date = new Date()
  } else {
    date = new Date(parseInt(timeStamp))
  }
  date.setDate(future ? date.getDate() + num : date.getDate() - num)
  return date.getFullYear() + seperator + (date.getMonth() + 1) + seperator + date.getDate();
}
/**
 * 计算时间相差几天的日期
 * 
 * future: 表示未来还是当前 boolean
 * timeStamp: 表示时间戳
 * num: 与timeStamp 相差几天
 * return 时间戳 
 */
const timeStampToTimeV7 = (future, timeStamp, num) => {
  let date = {}
  if (checkObject(timeStamp)) {
    date = new Date()
  } else {
    date = new Date(parseInt(timeStamp))
  }
  date.setDate(future ? date.getDate() + num : date.getDate() - num)
  return Date.parse(date);
}
/**
 * 数值 替换零
 */
const replaceZero = (num, n) => {
  let num_s = (''+ num).substr(-n)
  let newNum = Number(num_s)
  return num - newNum
}

module.exports = {
  getTimeStamp: getTimeStamp,
  formatDateTime: formatDateTime,
  formatDate: formatDate,
  formatTime: formatTime,
  formatTimeV2: formatTimeV2,
  checkObject: checkObject,
  successPage: successPage,
  failPage: failPage,
  homePage: homePage,
  backPage: backPage,
  openLoading: openLoading,
  closeLoading: closeLoading,
  loginFunction: loginFunction,
  getUserInfo: getUserInfo,
  checkAuthUserInfo: checkAuthUserInfo,
  compareVersion: compareVersion,
  addUserInfo: addUserInfo,
  planForEach: planForEach,
  getRandInt: getRandInt,
  getPercent: getPercent,
  replaceZero: replaceZero,
  timeStampToTimeV0: timeStampToTimeV0,
  timeStampToTimeV1: timeStampToTimeV1,
  timeStampToTimeV2: timeStampToTimeV2,
  timeStampToTimeV3: timeStampToTimeV3,
  timeStampToTimeV4: timeStampToTimeV4,
  timeStampToTimeV5: timeStampToTimeV5,
  timeStampToTimeV6: timeStampToTimeV6,
  timeStampToTimeV7: timeStampToTimeV7,
  getDates: getDates
}