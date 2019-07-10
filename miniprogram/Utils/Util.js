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
module.exports = {
  formatDateTime: formatDateTime,
  formatDate: formatDate,
  formatTime: formatTime,
  checkObject: checkObject,
  successPage: successPage,
  failPage: failPage,
  homePage: homePage,
  openLoading: openLoading,
  closeLoading: closeLoading
}