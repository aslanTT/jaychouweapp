const app = getApp()
const { User } = require('../../../utils/av-core-min');

Page({
  data: {
    avatar:'',
    name:'',
    sign:''
  },

  onLoad: function (options) {
    this.userUpdate()
  },

  didClickEditSign:function(e) {
    wx.navigateTo({
      url: '../setting/setting',
    })
  },

  didClickMineCollectList:function(e) {
    wx.navigateTo({
      url: '/pages/mine/collect/collect'
    })
  },

  didClickMineListenList:function(e) {
    wx.navigateTo({
      url: '/pages/mine/listened/listened'
    })
  },
 
  didClickMineSubjectList:function(e) {
    wx.navigateTo({
      url: '/pages/subject/user/user?userId=' + User.current().id,
    })
  },

  didClickAppsList:function(e) {
    wx.navigateTo({
      url: '/pages/mine/apps/apps',
    })
  },

  didClickShop:function() {
    wx.navigateToMiniProgram({
      appId: 'wx2e059a595036e58a',
      envVersion: 'release'
    })
  },
 
  didClickFeedback: function () {
    wx.navigateToMiniProgram({
      appId: 'wx8abaf00ee8c3202e',
      extraData: {
        id: '379328'
      },
      envVersion: 'release'
    })
  },

  didClickPublic:function() {
    var url = encodeURIComponent("https://mp.weixin.qq.com/s?__biz=MzkzNjI2NzE5OA==&mid=2247483847&idx=1&sn=4c0dd3b452d2b198bd79d62db5d36ce9&chksm=c2a01d16f5d794009b61313111ece8e7ae35fb9411f1c91a448622dce93324aaaa91c97f3930#rd")
    wx.navigateTo({
      url: '/pages/essay/web/web?url='+url
    })
  },
 
  userUpdate:function(value) {
    var userInfo = app.globalData.userInfo;
    if (userInfo != null) {
      var userName = '用户'+userInfo.id.substring(userInfo.id.length-4, 4)
      this.setData({
        name: userInfo.get('nickName') || userName,
        avatar: userInfo.get('avatarUrl') || '/image/avatar.png'
      })
    } else {
      this.setData({
        name: "我",
        avatar: '/image/avatar.png'
      })
    }
  },

  onShareAppMessage: function () {
    return this.shareContent()
  },

  onShareTimeline:function() {
    return this.shareContent()
  },

  shareContent: function() {
    return {
      title:'来杰伦粉丝圈听周杰伦的歌',
      path:'pages/music/list/list',
      imageUrl:app.globalData.setting.sharePic
    }
  }
})
