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

const updateJobStatus = (_id, status) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'dbConsole',
      data: {
        action: 'updateJobStatus',
        _id: _id,
        status: status
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
const updateJobsAllStatus = (_id, status) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'dbConsole',
      data: {
        action: 'updateJobsAllStatus',
        _id: _id,
        status: status
      }
    }).then(res => {
      console.log("updateJobsAllStatus success")
      
      resolve(res)

    }).catch(res => {
      console.log("updateJobsAllStatus fail")
      reject(res)
    })
  })
}
const updatePlanStatus = (_id, status) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'dbConsole',
      data: {
        action: 'updatePlanStatus',
        _id: _id,
        status: status
      }
    }).then(res => {
      console.log(_id)
      console.log("updatePlanStatus success")
      updateJobsAllStatus(_id, 3).then(res =>{
        resolve(res)
      })
      
    }).catch(res => {
      console.log("updatePlanStatus fail")
      reject(res)
    })
  })
}
const updatePlanShow = (_id, show) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'dbConsole',
      data: {
        action: 'updatePlanShow',
        _id: _id,
        show: show
      }
    }).then(res => {
      console.log("updatePlanShow success")
      resolve(res)
    }).catch(res => {
      console.log("updatePlanShow fail")
      reject(res)
    })
  })
}

module.exports = {
  updateJobs: updateJobs,
  updateJobDetails: updateJobDetails,
  queryJobs: queryJobs,
  updateJobStatus: updateJobStatus,
  updatePlanStatus: updatePlanStatus,
  updatePlanShow: updatePlanShow
}