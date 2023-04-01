const app = getApp()

Page({
  data: {
    loading: true,
    hasMore: false,
    restMode: false,
    list: [],
    height: app.globalData.windowHeight - app.globalData.titleBarHeight, 
  },

  onLoad(options) {
    this.fetchList()
  },

  fetchList(refresh=true) {
    var _this = this
    app.request('mv-list', {
      total: refresh?0:_this.data.list.length
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
    }).catch(e=>{
      if (e.code == 140) {
        _this.setData({
          restMode: true,
          loading: false
        })
      }
    });
  },

  toVideoDetail:function(e) {
    wx.navigateTo({
      url: '../detail/detail?mvId='+e.detail,
    })
  },

  refreshFeatured() {
    this.fetchList(false)
  },

  headerSearch:function() {
    wx.navigateTo({
      url: '/pages/mv/search/search',
    })
  },

  onShareAppMessage: function () {
    return this.shareContent()
  },

  onShareTimeline:function() {
    return this.shareContent()
  },


  shareContent: function() {
    var image = app.globalData.setting.sharePic
    if (this.data.list.length > 0) {
      image = this.data.list[0].cover
    }
    return {
      'title': "周杰伦最全 mv 在这",
      'path': 'pages/mv/list/list',
      'imageUrl': image
    }
  }
})