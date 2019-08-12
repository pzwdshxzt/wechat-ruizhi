// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();
const _ = db.command


// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  const wxContext = cloud.getWXContext()
  try {
    switch (event.action) {
      case 'updateJobs': {
        return await db.collection("Jobs").doc(event._id).update({
          data: {
            doneCount: event.doneCount,
            updateTime: event.updateTime
          }
        })
      }
      case 'updateJobDetails': {
        return await db.collection("JobDetails").doc(event._id).update({
          data: {
            authFlag: event.authFlag,
            authApplyTextarea: event.authApplyTextarea,
            updateTime: event.updateTime
          }
        })
      }
      case 'updateJobStatus': {
        return await db.collection("Jobs").doc(event._id).update({
          data: {
            status: event.status,
            updateTime: event.updateTime
          }
        })
      }
      case 'updatePlanStatus': {
        return await db.collection("Plans").doc(event._id).update({
          data: {
            status: event.status,
            updateTime: event.updateTime
          }
        })
      }
      case 'updatePlanShow': {
        return await db.collection("Plans").doc(event._id).update({
          data: {
            show: event.show,
            updateTime: event.updateTime
          }
        })
      }
      case 'updateJobsAllStatus': {
        return await db.collection('Jobs').where({
          planId: _.eq(event._id)
        }).update({
            data: {
              updateTime: event.updateTime,
              status: event.status
            }
        })
      }
      case 'updateJobsByWeRun': {
        return await db.collection('Jobs').doc(event._id).update({
          data: {
            clockDatas: _.push(event.clockData),
            updateTime: event.updateTime,
            doneCount: _.inc(1)
          }
        })
      }
        
    }
  } catch (e) {
    console.error(e)
  }
}
