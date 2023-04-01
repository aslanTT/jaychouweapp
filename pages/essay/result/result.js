const { Cloud } = require('../../../utils/av-core-min');
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
    request('search', {
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

  didClickUserRecommend: function (e) {
    var userId = e.currentTarget.dataset.userId;
    if (!userId || userId.length == 0) return;
    wx.navigateTo({
      url: '../recommend/recommend?userId=' + userId
    })
  },

  didTapCell: function (e) {
    if (e.target.id == 'share') {
      return;
    }
    var essay = e.currentTarget.dataset.essay;
    wx.navigateTo({
      url: '../web/web?essayId='+essay.objectId
    })
  },

  onReachBottom: function () {
    if (this.data.hasMore) {
      this.fetchSearchList(false);
    }
  },

  onShareAppMessage: function () {
    return {
      'title': '杰伦粉丝圈搜到的资讯',
      'path': 'pages/essay/result/result?searchWord=' + this.data.keyword,
      'imageUrl':app.globalData.setting.sharePic
    }
  }
})