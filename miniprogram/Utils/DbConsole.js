const db = wx.cloud.database()
const _ = db.command
const queryJobs = planId => {
  return new Promise((resolve, reject) => {
    db.collection('Jobs').where({
      planId: planId
    }).get().then(res => {
      resolve(res.data)
    })
  })
}
const queryUserInfos = openId => {
  return new Promise((resolve, reject) => {
    db.collection('UserInfos').where({
      _openid: openId
    }).get().then(res => {
      resolve(res.data)
    })
  })
}

const updateJobs = (_id, doneCount) => {
  return new Promise ((resolve,reject) => {
    wx.cloud.callFunction({
      name: 'dbConsole',
      data: {
        action: 'updateJobs',
        _id: _id,
        doneCount: doneCount
      },
      success: res => {
        console.log("updateJobs success")
        resolve()
      },
      fail: res => {
        console.log("updateJobs fail")
        reject()
      }
    })
  })
}

const updateJobDetails = (_id, authFlag, authApplyTextarea) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'dbConsole',
      data: {
        action: 'updateJobDetails',
        _id: _id,
        authFlag: authFlag,
        authApplyTextarea: authApplyTextarea
      },
      success: res => {
        console.log("updateJobDetails success")
        resolve()
      },
      fail: res => {
        console.log("updateJobDetails fail")
        reject()
      }
    })
  })
}
const planForEach = (res) => {
  return new Promise((resolve, reject) => {
    res.forEach(obj => {
      dbConsole.queryUserInfos(obj.jober).then(u => {
        let userInfo = u[0]
        if (!util.checkObject(userInfo)) {
          db.collection('JobDetails').where({
            _openid: userInfo._openid
          }).get().then(JobDetails => {
            obj.userInfo.JobDetails = JobDetails.data
          })
          obj.userInfo = userInfo
        }
      })
      resolve(res)
  })
  })
}
module.exports = {
  updateJobs: updateJobs,
  updateJobDetails: updateJobDetails,
  queryJobs: queryJobs,
  queryUserInfos: queryUserInfos
}