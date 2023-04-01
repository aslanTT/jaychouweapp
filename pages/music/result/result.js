const app = getApp()
const request = require('../../../network/request.js')
const { notifyAllPage } = require('../../../utils/notify.js')

Page({
  data: {
    keyword:'',
    postcard:0,
    selectMode: false,
    cellSelectMode: 0,
    loading:true,
    hasMore:false,
    resultList:[]
  },

  onLoad: function (options) {
    var keyword = options.searchWord;
    var postcard = options.postcard ? parseInt(options.postcard) : 0;
    var selectMode = options.selectMode ? options.selectMode=="true" : false;
    if (keyword && keyword.length > 0) {
      this.setData({
        keyword:keyword,
        postcard: postcard,
        selectMode: selectMode,
        cellSelectMode: (postcard == 1 || selectMode)?1:0
      });
      wx.setNavigationBarTitle({
        title: keyword,
      })
      this.fetchSearchList(true);
    }
  },

  fetchSearchList:function(refresh) {
    var _this = this;
    request('search-music', {
      keyword: this.data.keyword,
      total: refresh ? 0 : _this.data.resultList.length
    }).then(function (result) {
      wx.hideLoading();
      var list = _this.data.resultList;
      if (refresh) {
        list = result.list;
      } else {
        list = list.concat(result.list);
      }
      _this.setData({
        loading:false,
        resultList: list,
        hasMore:result.hasMore
      });
    }).catch(e => {
      wx.hideLoading();
      console.log(e);
    });
  },

  didTapMusicCell: function (e) {
    var musicId = e.currentTarget.dataset.musicId;
    if (this.data.selectMode) {
      notifyAllPage({'name':'didSelectMusic', 'value':musicId});
      wx.navigateBack({
        delta: 3
      })
      return
    }
    if (this.data.postcard == 1) {
      wx.navigateTo({
        url: '/pages/music/postcard/postcard?musicId=' + musicId
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
      url: '/pages/music/play/play?musicId=' + musicId
    })
  },

  onReachBottom: function () {
    if (this.data.hasMore) {
      this.fetchSearchList(false);
    }
  },

  onShareAppMessage: function () {
    return {
      'title': '杰伦粉丝圈搜到的歌曲',
      'path': 'pages/music/result/result?searchWord=' + this.data.keyword,
      'imageUrl':app.globalData.setting.sharePic
    }
  }
})