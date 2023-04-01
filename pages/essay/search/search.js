
const AV = require('../../../utils/av-core-min');
const request = require('../../../network/request.js')
const app = getApp()

Page({
  data: {
    searchword: '',
    hotList:[],
    wordList:[]
  },

  onLoad:function() {
    var _this = this;
    request('hot-read', {}).then(res=>{
      _this.setData({
        hotList:res.list,
        wordList: res.hotword
      })
    });
  },

  didClickHotItem:function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.hotList[index];
    wx.navigateTo({
      url: '../web/web?essayId='+item.objectId
    })
  },

  didClickWordItem:function(e) {
    var word = e.currentTarget.dataset.word;
    wx.navigateTo({
      url: '../result/result?searchWord='+word
    })
  },

  searchWordChange: function (e) {
    this.setData({
      searchword: e.detail.value
    });
  },

  didClickSearchButton: function () {
    if (this.data.searchword.length == 0) {
      wx.showModal({
        title: '温馨提示',
        content: '请输入有效关键词',
        confirmColor: 'red',
        showCancel: false,
      });
      return;
    }

    wx.navigateTo({
      url: '../result/result?searchWord=' + this.data.searchword,
    })
  }
})