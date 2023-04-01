const request = require('../../../network/request.js')
const app = getApp();

Page({
  data: {
    apps:[]
  },

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    var _this = this;
    request('apps', {}).then(res=>{
      wx.hideLoading()
      _this.setData({
        apps:res.apps
      })
    });
  },

  didClickMiniprograme:function(e) {
    var appid = e.currentTarget.dataset.appid;
    wx.navigateToMiniProgram({
      appId: appid,
    })
  }
})