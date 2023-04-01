const app = getApp()
const {SCENE, requestSubscribeMessage} = require('../../../subscribe')

Page({

  data: {
    list:[],
    hasMore: false,
    loading: true
  },

  onLoad: function (options) {
    this.fetchList(true)
  },

  fetchList: function(refresh=true) {
    app.request('collect-list', {
      total: refresh?0:this.data.list.length
    }).then(res=>{
      res.list.forEach(item=>[
        item.objectId = item.music
      ])
      if (refresh) {
        this.setData({
          list: res.list,
          hasMore: res.hasMore,
          loading: false
        })
      } else {
        this.setData({
          list: this.data.list.concat(res.list),
          hasMore: res.hasMore,
          loading: false
        })
      }
      wx.stopPullDownRefresh({
        success: (res) => {},
      })
    })
  },

  onPullDownRefresh: function () {
    this.fetchList()
  },

  onReachBottom: function () {
    if (this.data.hasMore) {
      this.fetchList(false)
    }
  },

  didTapMusicCell:function(e) {
    if (!app.globalData.setting.playEnable) {
      wx.showToast({
        title: '小程序上不支持播放',
        icon: 'none'
      })
      return
    }
    requestSubscribeMessage(SCENE.MUSIC)
    var musicId = e.currentTarget.dataset.musicId;
    wx.navigateTo({
      url: '/pages/music/play/play?musicId='+musicId
    })
  },
})