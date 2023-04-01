const playerManager = require('../../../player/playerManager')
const app = getApp()

Page({

  data: {
    musicList:[],
    loading: true,
    hasMore: false
  },


  onLoad: function (options) {
    var _this = this
    playerManager.fetchMusicList(true, function() {
      _this.setData({
        loading: false,
        musicList: playerManager.playList(),
        hasMore: playerManager.hasMore()
      })
    })
  },

  onPullDownRefresh: function () {
    var _this = this
    playerManager.fetchMusicList(true, function() {
      wx.stopPullDownRefresh({
        success: (res) => {},
      })
      _this.setData({
        musicList: playerManager.playList(),
        hasMore: playerManager.hasMore()
      })
    })
  },

  onReachBottom: function () {
    if (playerManager.hasMore()) {
      var _this = this
      playerManager.loadMorePlayList(function() {
        _this.setData({
          musicList: playerManager.playList(),
          hasMore: playerManager.hasMore()
        })
      })
    }
  },

  didTapMusic:function(e) {
    if (!app.globalData.setting.playEnable) {
      wx.showToast({
        title: '小程序上不支持播放',
        icon: 'none'
      })
      return
    }
    let music = e.currentTarget.dataset.music;
    wx.navigateTo({
      url: '/pages/music/play/play?musicId='+music.objectId
    })
  }
})