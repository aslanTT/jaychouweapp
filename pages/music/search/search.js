
const request = require('../../../network/request.js')

Page({
  data: {
    postcard:0,
    selectMode: false,
    searchword: '',
    hotList:[],
    wordList:[]
  },

  onLoad:function(options) {
    var _this = this;
    request('hot-listen', {}).then(res=>{
      _this.setData({
        hotList:res.list,
        wordList: res.hotword,
        postcard:options.postcard??0,
        selectMode: options.selectMode ?? false
      })
    });
  },

  didClickHotItem:function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.hotList[index];
    wx.navigateTo({
      url: '../play/play?musicId='+item.objectId
    })
  },

  didClickWordItem:function(e) {
    var word = e.currentTarget.dataset.word;
    wx.navigateTo({
      url: `/pages/music/result/result?searchWord=${word}&postcard=${this.data.postcard}&selectMode=${this.data.selectMode}`
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
      url: `/pages/music/result/result?searchWord=${this.data.searchword}&postcard=${this.data.postcard}&selectMode=${this.data.selectMode}`
    })
  }
})