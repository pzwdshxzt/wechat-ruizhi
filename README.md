# 任务发布及其审核机制 - 小程序
## 功能展示
![功能展示](https://github.com/pzwdshxzt/wechat-ruizhi/blob/master/images/ruizhi.png?raw=true "功能展示")

## 概述
### 本小程序意愿是在实现任务发布及其审核机制主题下，完成了这个小程序的开发，还有许多未开发得功能，正在逐步完善，意愿成为一款‘睿智’小程序。本代码仅供学习。
## 开发须知
### 本小程序采用的是微信云开发，需要设置数据库集合  Jobs，Plans，JobDetails，UserInfos，且设置为共享 CardInfos 不能设置共享，在范式与数据冗余之间抉择，云函数写得少，数据处理大多都是在page里面(不太好)。所以这只是一个小程序实例项目。仅供参考。
### 云函数自行npm install
## 功能点

* 计划发布
   * 打卡任务
   * 运动连续性
   * 运动累积性
* 打卡任务审核
   * 审核通知
* 运动型打卡
   * 根据每日微信运动打卡
* 计划管理
* 任务管理
* 卡包功能
    * 初衷是为了记住银行卡账号
* 计划搜索 (实现中...)

## 参考框架及其组件
- [ColorUI](https://github.com/weilanwl/ColorUI "ColorUI")
- [WEUI-WXSS](https://github.com/Tencent/weui-wxss/ "WEUI-WXSS")
- [WuxUI](https://github.com/wux-weapp/wux-weapp "WuxUI")
- [极点日历](https://github.com/czcaiwj/calendar/ "极点日历")
- [wx-f2](https://github.com/antvis/wx-f2 "蚂蚁金服的charts")
###  几种CSS框架混合使用，只用了WXUIUI的悬浮button，极点日历由于组件功能不能完全满足我得需求，并且农历的日历好像有问题，作者好像也没有在开发了，所以我单独拿出来重新改造下。最后还用了蚂蚁金服得wx-f2图表框架来画运动折线图。
## 体验小程序
![睿智小程序](https://raw.githubusercontent.com/pzwdshxzt/wechat-ruizhi/master/images/scan_code.jpg)
![睿智小程序](https://6465-dev-p-1300251472.tcb.qcloud.la/main/gh_ca331a92f90f_258.jpg?sign=4471b2c9a8fa3afd1dd6d7a7ee1f614f&t=1577343381)

