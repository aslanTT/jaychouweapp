const app = getApp()

Page({
  data: {
    albumId: '',
    album:{},
    songList:[],
    loading: true,
    popDesc: false,
    isIpx: app.globalData.isIpx
  },

  onLoad: function (options) {
    if (options.albumId) {
      this.data.albumId = options.albumId
      this.fetchDetail()
    }
  },

  fetchDetail:function() {
    var _this = this
    app.request('album-detail', {
      'albumId': this.data.albumId
    }).then(res=>{
      _this.setData({
        loading: false,
        album: res.album,
        songList: res.list
      })
    })
  },

  didClickBackButton:function() {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({
        complete: (res) => {},
      })
    } else {
      wx.switchTab({
        url: '../list/list'
      })
    }
  },

  didClickAlbumDesc:function() {
    this.setData({
      popDesc: true
    })
  },

  didClickBack:function() {
    this.setData({
      popDesc: false
    })
  },

  didClickMusic:function(e) {
    if (!app.globalData.setting.playEnable) {
      wx.showToast({
        title: '小程序上不支持播放',
        icon: 'none'
      })
      return
    }
    var musicId = e.currentTarget.dataset.musicId;
    wx.navigateTo({
      url: '/pages/music/play/play?musicId='+musicId
    })
  },

  onShareAppMessage: function () {
    return this.shareContent()
  },

  onShareTimeline: function() {
    return this.shareContent()
  },

  shareContent: function() {
    return {
      title: this.data.album.name,
      path:'pages/music/album/album?albumId='+this.data.album.objectId,
      imageUrl:this.data.album.covers[0]
    }
  }
})