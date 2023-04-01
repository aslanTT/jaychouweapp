const { Cloud } = require('../../../utils/av-core-min');
const AV = require('../../../utils/av-core-min');
const notification = require("../../../utils/notificationCenter.js");
const app = getApp()
const request = require('../../../network/request.js');

Page({
  data: {
    url:'',
    essay:{},
    tryCount: 0,
    adaptQQ:false
  },

  onLoad:function() {
    this.setData({
      adaptQQ:app.globalData.platform=='qq'
    })
  },

  onReady: function () {
    wx.hideShareMenu({});
  },

  searchWordChange:function(e) {
    this.setData({
      url:e.detail.value
    });
  },

  onConfirmSubmit:function(e) {
    if (this.data.url.length == 0) {
      wx.showModal({
        title: '温馨提示',
        content: '请粘贴文章链接后再提交',
        showCancel:false,
        confirmColor:'#B64A48'
      })
      return;
    }

    if (this.data.url.indexOf('mp.weixin.qq.com') == -1) {
      wx.showModal({
        title: '温馨提示',
        content: '平台目前只支持微信公众号文章',
        showCancel: false,
        confirmColor: '#B64A48'
      })
      return;
    }

    var _this = this;
    wx.showLoading({
      title: '分析中...'
    })
    request('parseUrl', {
      url: this.data.url
    }).then(function (result) {
      wx.hideLoading();
      _this.data.tryCount = 0;
      var essay = result.essay;
      if (result.code == 1000) {
        wx.showModal({
          title: '平台已收录该文章啦',
          content: '查看该文章?',
          confirmColor:'#B64A48',
          success:function(res) {
            if (res.confirm) {
               wx.navigateTo({
                url: '/pages/essay/web/web?essayId='+essay.objectId
              })
            }
          }
        })
      } else {
        wx.showToast({
          title: '推荐成功！感谢！',
          icon:'none'
        })
        wx.navigateTo({
          url: '/pages/essay/web/web?essayId='+essay.objectId
        })
      }
      notification.postNotificationName('refreshMineList', {});
    }).catch(e => {
      wx.hideLoading();
      // 失败后重试一次
      if (_this.data.tryCount == 0) {
        _this.data.tryCount ++;
        _this.onConfirmSubmit(e);
      } else {
        _this.data.tryCount = 0;
        wx.showModal({
          title: '',
          content: e.message,
          showCancel: false,
          confirmColor: '#B64A48'
        })
      }
    });
  }
})