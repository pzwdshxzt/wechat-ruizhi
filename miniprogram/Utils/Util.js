const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const dbConsole = require('DbConsole.js');
const formatDateTime = date =>{
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year,month,day].map(formatNumer).join('-') + ' ' + [hour,minute,second].map(formatNumer).join(':')
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
    if(obj instanceof Array){
        return obj.length === 0
    }
    if(obj instanceof Object){
        return Object.keys(obj).length === 0
    }
    return obj === null || obj === undefined || obj === '';
  }
const formatNumer = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const successPage = (title,content) => {
  wx.navigateTo({
    url: '../success/success?title='+title+'&content='+content
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
    fail: function () {
      console.info("跳转失败")
    }
  })
}
const openLoading= (title) => {
  wx.showLoading({
    title: title,
    mask: true
  })
}
const closeLoading = () => {
  wx.hideLoading();
}

const loginFunction = () => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        resolve(res.result)
      },
      fail: err => {
        resolve()
      }
    })
  })
}
const getUserInfo = () => {
  return new Promise((resolve, reject) => {
    if (checkObject(app.globalData.userInfo)){
      // 获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                app.globalData.userInfo = res.userInfo
                resolve(res.userInfo)
                addUserInfo(res.userInfo)
              }
            })
          } else {
            wx.navigateTo({
              url: '../Auth/Auth'
            })
          }
        }
      })
    }
  })
}
const addUserInfo = (userInfo) => {
  db.collection('UserInfos').where({
    _openid: userInfo._openid
  }).get().then(res =>{
    if(checkObject(res.data)){
      db.collection('UserInfos').add({
          data: userInfo,
          success: res => {
          },
          fail: err => {
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
    if(!checkObject(res)){
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

module.exports = {
  formatDateTime: formatDateTime,
  formatDate: formatDate,
  formatTime: formatTime,
  checkObject: checkObject,
  successPage: successPage,
  failPage: failPage,
  homePage: homePage,
  openLoading: openLoading,
  closeLoading: closeLoading,
  loginFunction: loginFunction,
  getUserInfo: getUserInfo,
  compareVersion: compareVersion,
  addUserInfo: addUserInfo,
  planForEach: planForEach
}