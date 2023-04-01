
const app = getApp()

Page({
  data: {
    searchword: ''
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