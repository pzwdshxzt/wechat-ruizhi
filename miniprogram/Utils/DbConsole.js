const db = wx.cloud.database()
const _ = db.command
/**
 * 获取时间戳
 */
const getTimeStamp = () => {
  return Date.parse(new Date())
}

/**
 * 根据 planId 查询计划下所以Job
 */
const queryJobs = planId => {
  return new Promise((resolve, reject) => {
    db.collection('Jobs').where({
      planId: planId
    }).get().then(res => {
      resolve(res.data)
    })
  })
}

/**
 * 更新Jobs doneCount
 */
const updateJobs = (_id, doneCount) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'dbConsole',
      data: {
        action: 'updateJobs',
        _id: _id,
        doneCount: doneCount,
        updateTime: getTimeStamp()
      },
      success: res => {
        if (res.result.stats.updated === 0) {
          reject()
        } else {
          resolve(res)
        }
      },
      fail: res => {
        console.log("updateJobs fail")
        reject()
      }
    })
  })
}

/**
 * 任务审核 --->更新JobDetails
 * authFlag: 审核状态
 * authApplyTextarea： 审核内容
 * return 
 */
const updateJobDetails = (_id, authFlag, authApplyTextarea) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'dbConsole',
      data: {
        action: 'updateJobDetails',
        _id: _id,
        authFlag: authFlag,
        authApplyTextarea: authApplyTextarea,
        updateTime: getTimeStamp()
      },
      success: res => {
        if (res.result.stats.updated === 0) {
          reject()
        } else {
          resolve(res)
        }
      },
      fail: res => {
        console.log("updateJobDetails fail")
        reject()
      }
    })
  })
}

/**
 * 更新任务状态
 */
const updateJobStatus = (_id, status) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'dbConsole',
      data: {
        action: 'updateJobStatus',
        _id: _id,
        status: status,
        updateTime: getTimeStamp()
      },
      success: res => {
        if (res.result.stats.updated === 0) {
          reject()
        } else {
          resolve(res)
        }
      },
      fail: res => {
        reject()
      }
    })
  })
}

/**
 * 更新所有任务状态
 */
const updateJobsAllStatus = (_id, status) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'dbConsole',
      data: {
        action: 'updateJobsAllStatus',
        _id: _id,
        status: status,
        updateTime: getTimeStamp()
      }
    }).then(res => {
      if (res.result.stats.updated === 0) {
        reject()
      } else {
        resolve(res)
      }
    }).catch(res => {
      reject(res)
    })
  })
}
/**
 * 更新计划状态
 */
const updatePlanStatus = (_id, status) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'dbConsole',
      data: {
        action: 'updatePlanStatus',
        _id: _id,
        status: status,
        updateTime: getTimeStamp()
      }
    }).then(res => {
      if (status === 3) {
        if (res.result.stats.updated === 0) {
          reject()
        } else {
          updateJobsAllStatus(_id, 3).then(res => {
            resolve(res)
          })
        }
      }
      resolve(res)
    }).catch(res => {
      reject(res)
    })
  })
}
/**
 * 更新计划状态
 */
const updatePlanShow = (_id, show) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'dbConsole',
      data: {
        action: 'updatePlanShow',
        _id: _id,
        show: show,
        updateTime: getTimeStamp()
      }
    }).then(res => {
      if (res.result.stats.updated === 0) {
        reject()
      } else {
        resolve(res)
      }
    }).catch(res => {
      reject(res)
    })
  })
}

/**
 * 运动计划打卡申请
 */
const updateJobsByWeRun = (_id, clockData) => {
  return new Promise((resolve, reject) => {
    console.log('123')
    wx.cloud.callFunction({
      name: 'dbConsole',
      data: {
        action: 'updateJobsByWeRun',
        _id,
        clockData,
        updateTime: getTimeStamp()
      }
    }).then(res => {
      console.log(res)
      if (res.result.stats.updated === 0) {
        reject()
      } else {
        resolve(res)
      }
    }).catch(res => {
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
  updatePlanShow: updatePlanShow,
  updateJobsByWeRun: updateJobsByWeRun
}