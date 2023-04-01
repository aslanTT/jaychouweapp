const app = getApp()
const {SCENE, requestSubscribeMessage} = require('../../../subscribe')
const { notifyAllPage } = require('../../../utils/notify.js')

Page({
  data: {
    strategy : 0,
    postcard: 0,
    selectMode: false,
    cellSelectMode: 0,
    list:[],
    loading: true,
    hasMore: false
  },

  onLoad(options) {
    var postcard = options.postcard ? parseInt(options.postcard) : 0
    var strategy = options.strategy??0
    var selectMode = options.selectMode ? options.selectMode=="true" : false
    var title = this.getTitle(strategy, postcard)
    this.setData({
      strategy:strategy,
      postcard:postcard,
      selectMode:selectMode,
      cellSelectMode: (postcard == 1 || selectMode)?1:0,
      banner: app.globalData.setting.banner
    })
    wx.setNavigationBarTitle({
      title: title,
    })
    this.fetchList()
  },

  getTitle: function(strategy, postcard) {
    if (postcard == 1 || this.data.selectMode) {
      return "选择歌曲"
    }
    if (strategy == 0) {
      return "歌曲"
    } else if (strategy == 1) {
      return "收藏最多"
    } else if (strategy == 2) {
      return "听过最多"
    }
  },

  fetchList: function(refresh=true) {
    var _this = this
    app.request('music-list', {
      total: refresh?0: _this.data.list.length,
      strategy: _this.data.strategy
    }).then(res=>{
      wx.stopPullDownRefresh({
        success: (res) => {},
      })
      if (refresh) {
        _this.setData({
          list: res.list,
          hasMore: res.hasMore,
          loading: false
        })
      } else {
        _this.setData({
          list: _this.data.list.concat(res.list),
          hasMore: res.hasMore,
          loading: false
        })
      }
    })
  },

  didClickSearch:function() {
    wx.navigateTo({
      url: `/pages/music/search/search?postcard=${this.data.postcard}&selectMode=${this.data.selectMode}`,
    })
  },
 
  didTapMusicCell:function(e) {
    requestSubscribeMessage(SCENE.MUSIC)
    var musicId = e.currentTarget.dataset.musicId;
    if (this.data.selectMode) {
      notifyAllPage({'name':'didSelectMusic', 'value':musicId});
      wx.navigateBack({
        delta: 1
      })
      return
      return
    }
    if (this.data.postcard == 1) {
      wx.navigateTo({
        url: '/pages/music/postcard/postcard?musicId='+musicId
      })
      return
    }
    if (!app.globalData.setting.playEnable) {
      wx.showToast({
        title: '小程序上不支持播放',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/music/play/play?musicId='+musicId
    })
  },

  onPullDownRefresh() {
    this.fetchList()
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.fetchList(false)
    }
  },

  onShareAppMessage: function () {
    return this.shareContent()
  },

  onShareTimeline:function() {
    return this.shareContent()
  },

  shareContent: function() {
    let strategy = this.data.strategy
    if (strategy == 0) {
      return {
        title:'来杰伦粉丝圈听周杰伦的歌',
        path:'pages/music/list/list',
        imageUrl:app.globalData.setting.sharePic
      }
    } else if (strategy == 1) {
      return {
        title: '《'+this.data.list[0].name+'》被粉丝们收藏最多哦',
        path: 'pages/music/songs/songs?strategy=1',
        imageUrl: this.data.list[0].album_cover[0]
      }
    }  else if (strategy == 2) {
      return {
        title: '《'+this.data.list[0].name+'》被粉丝们听过最多次哦',
        path: 'pages/music/songs/songs?strategy=2',
        imageUrl: this.data.list[0].album_cover[0]
      }
    }
  }
})