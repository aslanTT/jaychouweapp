
const app = getApp()

Page({
  data: {
    userId:'',
    user:{},
    loading: true,
    list: [],
    hasMore: false
  },

  onLoad: function (options) {
    var userId = options.userId;
    this.setData({
      userId:userId,
      isIpx: app.globalData.isIpx
    })
    this.fetchUserInfo(userId);
  },

  didClickBackButton:function() {
    wx.navigateBack({
      delte:1
    })
  },

  fetchUserInfo:function(userId) {
    var _this = this;
    app.request('user', {
      userId:userId
    }).then(user=>{
      _this.setData({
        user:user
      })
      _this.fetchSubjectList();
    });
  },

  fetchSubjectList: function (isRefresh = true) {
    var total = 0;
    if (!isRefresh) {
      total = this.data.list.length;
    }
    var _this = this
    app.request('subject-user-list', {
      total: total,
      userId:this.data.userId
    }).then(res => {
      var list = _this.data.list;
      if (isRefresh) {
        list = res.list;
      } else {
        list = list.concat(res.list);
      }
      wx.stopPullDownRefresh()
      _this.setData({
        list: list,
        hasMore: res.hasMore,
        loading: false
      })
    })
  },

  didTapSubjectCell: function (e) {
    var subjectId = e.currentTarget.dataset.subjectId;
    wx.navigateTo({
      url: '../detail/detail?subjectId=' + subjectId
    })
  },
  
  onPullDownRefresh:function() {
    this.fetchSubjectList(true)
  },

  onReachBottom: function () {
    if (this.data.hasMore) {
      this.fetchSubjectList(false)
    }
  }
})