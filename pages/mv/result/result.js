const AV = require('../../../utils/av-core-min');
const app = getApp()
const request = require('../../../network/request.js')

Page({
  data: {
    keyword:'',
    loading:true,
    hasMore:false,
    resultList:[]
  },

  onLoad: function (options) {
    var keyword = options.searchWord;
    if (keyword && keyword.length > 0) {
      this.setData({
        keyword:keyword
      });
      wx.setNavigationBarTitle({
        title: keyword,
      })
      this.fetchSearchList(true);
    }
  },

  fetchSearchList:function(refresh) {
    var _this = this;
    request('search-mv', {
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

  toVideoDetail:function(e) {
    wx.navigateTo({
      url: '../detail/detail?mvId='+e.detail,
    })
  },

  onReachBottom: function () {
    if (this.data.hasMore) {
      this.fetchSearchList(false);
    }
  },

  onShareAppMessage: function () {
    return this.shareContent()
  },

  onShareTimeline:function() {
    return this.shareContent()
  },


  shareContent: function() {
    var image = app.globalData.setting.sharePic
    if (this.data.resultList.length > 0) {
      image = this.data.resultList[0].cover
    }
    return {
      'title': this.data.keyword,
      'path': 'pages/mv/result/result?searchWord=' + this.data.keyword,
      'imageUrl': image
    }
  }
})