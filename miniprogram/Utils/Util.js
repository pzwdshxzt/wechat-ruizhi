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

const checkObject= obj => {
    return obj === null || obj === undefined || obj === '' || Array.isArray(obj) ? obj.length === 0 : false || Object.keys(obj).length === 0;
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
    url: '../Jobs/Jobs',
    fail: function () {
      console.info("跳转失败")
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
  homePage: homePage
}