const app = getApp()

Page({
  data: {
    loading:true,
    list:[],
    hasMore:false
  },

  onLoad(options) {
    this.fetchList(true)
  },

  fetchList:function(isRefresh=true) {
    var total = 0;
    if (!isRefresh) {
      total = this.data.list.length;
    }
    var _this = this
    app.request('remember-index', {
      total:total
    }).then(res=>{
      wx.stopPullDownRefresh()
      var list = _this.data.list;
      if (isRefresh) {
        list = res.list;
      } else {
        list = list.concat(res.list)
      }
      _this.setData({
        list:list,
        hasMore:res.hasMore,
        loading:false
      })
    }).catch(e=>{
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.fetchList(false)
    }
  },

  didClickCell:function(e) {
    var musicId = e.currentTarget.dataset.musicId;
    wx.navigateTo({
      url: '/pages/music/play/play?musicId='+musicId
    })
  }
})