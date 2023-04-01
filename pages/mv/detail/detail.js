const app = getApp()
const notification = require("../../../utils/notificationCenter");

Page({
  data: {
    loading: true,
    videoHeight: app.globalData.windowWidth * 0.75 * 0.75,
    videoItem: {},
    recommend: [],
    reply: [],
    playEnable: true
  },

  // 视频详情跳转视频详情 看起来有点扯 有点绕
  toDetail: function(e) {
    // 暂停上一个播放的视频
    var videoCtx = wx.createVideoContext('myVideo', this)
    videoCtx.pause()
    var objId = e.currentTarget.dataset.item.objectId
    this.data.mvId = objId
    this.getRecommend(objId)
    this.getVideoDetail(objId)
  },

  // 获取播放链接
  getVideoDetail: function(mvId) {
    var that = this
    app.request('mv-detail', {
      mvId: mvId
    }).then(res=>{
      that.setData({
        videoItem: res,
        loading: false
      })
    })
  },
  // 推荐
  getRecommend: function (mvId) {
    var that = this
    app.request('mv-recommend', {
      mvId: mvId
    }).then(res=>{
      that.setData({
        recommend: res.list
      })
    })
  },
  
  reload:function() {
    if (app.globalData.setting.playEnable) {
      this.setData({
        playEnable: true,
        videoHeight: app.globalData.windowWidth * 0.75 * 0.75
      })
    } else {
      this.setData({
        playEnable: false,
        videoHeight: 10
      })
    }
  },

  onLoad: function(options) {
    var mvId = options.mvId
    this.data.mvId = mvId
    this.getRecommend(mvId)
    this.getVideoDetail(mvId)
    notification.addNotification('refreshSetting', this.reload, {})
    this.reload()
  },

  onShareAppMessage: function () {
    return this.shareContent()
  },

  onShareTimeline:function() {
    return this.shareContent()
  },

  shareContent: function() {
    return {
      title: this.data.videoItem.title,
      path:'pages/mv/detail/detail?mvId='+this.data.mvId,
      imageUrl: this.data.videoItem.cover
    }
  }
})
