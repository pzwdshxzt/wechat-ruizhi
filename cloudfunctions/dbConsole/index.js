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
            doneCount: event.doneCount
          }
        })
      }
      case 'updateJobDetails': {
        return await db.collection("JobDetails").doc(event._id).update({
          data: {
            authFlag: event.authFlag,
            authApplyTextarea: event.authApplyTextarea
          }
        })
      }
    }
  } catch (e) {
    console.error(e)
  }
}
