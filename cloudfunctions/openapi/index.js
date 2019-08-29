  // 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

/**
 * INVITE: 邀请
 * INVITED：邀请成功
 * APPLY:任务待审核
 * AUTH：任务审核完成
 */
const { INVITED, APPLY, AUTH } = {
  INVITED: 'CC9oanIQMB86kj5cE8gY6YBKwFJZe-LpZAgF-JEpXmQ',
  APPLY: '23ie9I3sjJrY-9MoDWehLWh6vTy-aJ8rTyDVFMTPsQA',
  AUTH: 'MxXKepCWK-yLzCXe5fWW177gE2GXWW-BmNDMw27fqME'
}
// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.action) {
    case 'getWeRunData': {
      return getWeRunData(event)
    }
    case 'getWeRunAllData': {
      return getWeRunAllData(event)
    }
    case 'Invited': {
      return sendInvited(event)
    }
    case 'apply': {
      return sendApply(event)
    }
    case 'auth': {
      return sendAuth(event)
    }
    case 'getWXACode': {
      return getWXACode(event)
    }
    
    default: {
      return
    }
  }
}

async function getWeRunAllData(event) {
  let stepInfoList = event.weRunData.data.stepInfoList
  return stepInfoList
}
async function getWeRunData(event) {
  let stepInfoList = event.weRunData.data.stepInfoList
  
  return stepInfoList[stepInfoList.length -1]
}

async function sendAuth(event) {

  const sendResult = await cloud.openapi.templateMessage.send({
    touser: event.touser,
    templateId: AUTH,
    formId: event.formId,
    page: 'pages/Job/Job?JobId='+ event.JobId + '&uid=' + event.touser,
    data: {
      keyword1: {
        value: event.inviteName,
      },
      keyword2: {
        value: event.date,
      },
      keyword3: {
        value: event.result,
      },
      keyword4: {
        value: event.content,
      },
    }
  })

  return sendResult
}
async function sendApply(event) {

  const sendResult = await cloud.openapi.templateMessage.send({
    touser: event.touser,
    templateId: APPLY,
    formId: event.formId,
    page: 'pages/Plan/Plan?PlanId=' + event.planId + '&uid'+event.touser,
    data: {
      keyword1: {
        value: event.inviteName,
      },
      keyword2: {
        value: event.username,
      },
      keyword3: {
        value: event.date,
      },
      keyword4: {
        value: event.inviteCount,
      },
    }
  })

  return sendResult
}
async function sendInvited(event) {

  const sendResult = await cloud.openapi.templateMessage.send({
    touser: event.touser,
    templateId: INVITED,
    formId: event.formId,
    page: 'pages/Home/Home',
    data: {
      keyword1: {
        value: '活动名称',
      },
      keyword2: {
        value: '2019-07-08 12:12',
      },
      keyword3: {
        value: '我是猪',
      }
    }
  })

  return sendResult
}

async function getWXACode(event) {

  // 此处将获取永久有效的小程序码，并将其保存在云文件存储中，最后返回云文件 ID 给前端使用

  const wxacodeResult = await cloud.openapi.wxacode.get({
    path: 'pages/openapi/openapi',
  })

  const fileExtensionMatches = wxacodeResult.contentType.match(/\/([^\/]+)/)
  const fileExtension = (fileExtensionMatches && fileExtensionMatches[1]) || 'jpg'

  const uploadResult = await cloud.uploadFile({
    // 云文件路径，此处为演示采用一个固定名称
    cloudPath: `wxacode_default_openapi_page.${fileExtension}`,
    // 要上传的文件内容可直接传入图片 Buffer
    fileContent: wxacodeResult.buffer,
  })

  if (!uploadResult.fileID) {
    throw new Error(`upload failed with empty fileID and storage server status code ${uploadResult.statusCode}`)
  }

  return uploadResult.fileID
}
