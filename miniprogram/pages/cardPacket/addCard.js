// miniprogram/pages/cardPacket/addCard.js
const app = getApp()
const util = require('../../Utils/Util.js');
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    cardType: ['身份证', '银行卡', '驾驶证', '其他'],
    cardTypeCode: 0,
    sexCodeMsg: ['男', '女'],
    sexCode: 0,
    birthday: '2000-12-25',
    idNo: '',
    name: '',
    address: '',
    number: '',
    bankName: '',
    validDate: '2099-12-12',
    owner: '',
    plateNum: '',
    vehicleType: '',
    otherName: '',
    otherNo: '',
    otherNote: '',
    errorMsg: '输入有误',
    showTopTips: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  showTopTips: function(msg) {
    var that = this;
    this.setData({
      showTopTips: true,
      errorMsg: msg
    });
    setTimeout(function() {
      that.setData({
        showTopTips: false,
        errorMsg: '输入错误'
      });
    }, 3000);
  },
  pickerCardTypeChange(e) {
    console.log(e);
    this.setData({
      cardTypeCode: Number(e.detail.value)
    })
  },
  pickerSexChange(e) {
    console.log(e);
    this.setData({
      sexCode: Number(e.detail.value)
    })
  },
  idSuccess(e) {
    console.log(e)
    this.setData({
      idNo: e.detail.id,
      name: e.detail.name,
      birthday: e.detail.birthday === '' ? this.data.birthday : e.detail.birthday,
      sexCode: e.detail.sex,
      address: e.detail.homePlace
    })
  },
  bankSuccess(e) {
    console.log(e)
    this.setData({
      number: e.detail.number === '' ? this.data.number : e.detail.number,
      bankName: e.detail.bankName === '' ? this.data.bankName : e.detail.bankName,
      validDate: e.detail.validDate === '' ? this.data.validDate : e.detail.validDate
    })
  },
  driverSuccess(e) {
    console.log(e)
    this.setData({
      owner: e.detail.owner === '' ? this.data.owner : e.detail.owner,
      plateNum: e.detail.plateNum === '' ? this.data.plateNum : e.detail.plateNum,
      vehicleType: e.detail.vehicleType === '' ? this.data.vehicleType : e.detail.vehicleType
    })
  },
  addCard(e) {

    let type = this.data.cardTypeCode
    if (!this.checkInfo()) {
      return
    }
    if (type === 0) {
      util.openLoading('正在玩命添加中...')
      db.collection('CardInfos').add({
        data: {
          type: 0,
          idNo: this.data.idNo,
          name: this.data.name,
          birthday: this.data.birthday,
          sexCode: this.data.sexCode,
          address: this.data.address,
        }
      }).then(res => {
        util.closeLoading()
        wx.showToast({
          icon: 'none',
          title: '添加成功',
          duration: 3000
        })
        wx.navigateBack()
      }).catch(res => {
        wx.showToast({
          icon: 'none',
          title: '添加卡包失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      })
    }
    if (type === 1) {
      util.openLoading('正在玩命添加中...')
      db.collection('CardInfos').add({
        data: {
          type: 1,
          number: this.data.number,
          bankName: this.data.bankName,
          validDate: this.data.validDate,
        }
      }).then(res => {
        util.closeLoading()
        wx.showToast({
          icon: 'none',
          title: '添加成功',
          duration: 3000
        })
        wx.navigateBack()
      }).catch(res => {
        wx.showToast({
          icon: 'none',
          title: '添加卡包失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      })
    }
    if (type === 2) {
      util.openLoading('正在玩命添加中...')
      db.collection('CardInfos').add({
        data: {
          type: 2,
          owner: this.data.owner,
          plateNum: this.data.plateNum,
          vehicleType: this.data.vehicleType,
        }
      }).then(res => {
        util.closeLoading()
        wx.showToast({
          icon: 'none',
          title: '添加成功',
          duration: 3000
        })
        wx.navigateBack()
      }).catch(res => {
        wx.showToast({
          icon: 'none',
          title: '添加卡包失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      })
    }
    if (type === 3) {
      util.openLoading('正在玩命添加中...')
      db.collection('CardInfos').add({
        data: {
          type: 3,
          otherName: this.data.otherName,
          otherNo: this.data.otherNo,
          otherNote: this.data.otherNote,
        }
      }).then(res => {
        util.closeLoading()
        wx.showToast({
          icon: 'none',
          title: '添加成功',
          duration: 3000
        })
        wx.navigateBack()
      }).catch(res => {
        wx.showToast({
          icon: 'none',
          title: '添加卡包失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      })
    }
  },
  checkInfo() {
    let type = this.data.cardTypeCode
    if (type === 0) {
      if (this.data.idNo === '') {
        this.showTopTips('请输入身份证号')
        return false
      }
      if (this.data.birthday === '') {
        this.showTopTips('请输入出生日期')
        return false
      }
      if (this.data.address === '') {
        this.showTopTips('请输入地址')
        return false
      }
      if (this.data.name === '') {
        this.showTopTips('请输入姓名')
        return false
      }
    }
    if (type === 1) {
      if (this.data.number === '') {
        this.showTopTips('请输入银行卡号')
        return false
      }
      if (this.data.bankName === '') {
        this.showTopTips('请输入银行名称')
        return false
      }
    }

    if (type === 2) {
      if (this.data.owner === '') {
        this.showTopTips('请输入所有者')
        return false
      }
      if (this.data.plateNum === '') {
        this.showTopTips('请输入号牌号码')
        return false
      }
      if (this.data.vehicleType === '') {
        this.showTopTips('请输入车辆类型')
        return false
      }
    }

    if (type === 3) {
      if (this.data.otherName === '') {
        this.showTopTips('请输入名称')
        return false
      }
      if (this.data.otherNo === '') {
        this.showTopTips('请输入号码')
        return false
      }
    }
    return true
  },
  addIdNo(e) {
    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!reg.test(e.detail.value)) {
      this.showTopTips("身份证输入不合法");
      this.setData({
        idNo: ''
      })
    } else {
      let sexCode = this.getSexByIdCard(e.detail.value)
      let birthday = this.getBirthdayByIdCard(e.detail.value)
      this.setData({
        birthday: birthday,
        sexCode: sexCode,
        idNo: e.detail.value
      })
    }
  },
  addAddress(e) {
    this.setData({
      address: e.detail.value
    })
  },
  addName(e) {
    var regName = /^[\u4e00-\u9fa5]{2,4}$/;
    if (!regName.test(e.detail.value)) {
      this.showTopTips('姓名填写有误');
      this.setData({
        name: ''
      })
    } else {
      this.setData({
        name: e.detail.value
      })
    }
  },
  birthdayChange(e) {
    this.setData({
      birthday: e.detail.value
    })
  },

  addBankName(e) {
    this.setData({
      bankName: e.detail.value
    })
  },
  addBankNumber(e) {
    this.setData({
      number: e.detail.value
    })
  },
  validDateChange(e) {
    this.setData({
      validDate: e.detail.value
    })
  },
  addPlateNum(e) {
    this.setData({
      plateNum: e.detail.value
    })
  },
  addVehicleType(e) {
    this.setData({
      vehicleType: e.detail.value
    })
  },
  addOwner(e) {
    this.setData({
      owner: e.detail.value
    })
  },
  addOtherName(e) {
    this.setData({
      otherName: e.detail.value
    })
  },
  addOtherNo(e) {
    this.setData({
      otherNo: e.detail.value
    })
  },
  addOtherNote(e) {
    this.setData({
      otherNote: e.detail.value
    })
  },

  /**
   * 获取生日
   */
  getBirthdayByIdCard(idCard) {
    var birthStr;
    if (15 == idCard.length) {
      birthStr = idCard.charAt(6) + idCard.charAt(7);
      if (parseInt(birthStr) < 10) {
        birthStr = '20' + birthStr;
      } else {
        birthStr = '19' + birthStr;
      }
      birthStr = birthStr + '-' + idCard.charAt(8) + idCard.charAt(9) + '-' + idCard.charAt(10) + idCard.charAt(11);
    } else if (18 == idCard.length) {
      birthStr = idCard.charAt(6) + idCard.charAt(7) + idCard.charAt(8) + idCard.charAt(9) + '-' + idCard.charAt(10) + idCard.charAt(11) + '-' + idCard.charAt(12) + idCard.charAt(13);
    }
    return birthStr;
  },
  /**
   * 获取性别
   */
  getSexByIdCard(idCard) {
    if (idCard.length == 15) {
      return idCard.substring(14, 15) % 2 === 0 ? 1 : 0;
    } else if (idCard.length == 18) {
      return idCard.substring(16, 17) % 2 === 0 ? 1 : 0;
    } else {
      //不是15或者18,null
      return 0;
    }
  }
})