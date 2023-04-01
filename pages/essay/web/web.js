const app = getApp();

Page({

  onLoad(options) {
    if (options.essayId) {
      this.setData({
        url: 'https://pub.baowenlaile.cn/detail/'+options.essayId,
        essayId: options.essayId
      })
      this.fetchDetail();
    } else if (options.url) {
      this.setData({
        url: decodeURIComponent(options.url)
      })
    }
  },

  fetchDetail:function () {
    var _this = this;
    app.request('essay-detail-simplify', {
      'essayId':this.data.essayId
    }).then(result => {
      _this.setData({
        essay: result.essay
      })
    });
  },

  jsbHandler:function(e) {
    console.log(e.detail)
  },

  onShareAppMessage: function () {
    return this.shareContent()
  },

  onShareTimeline:function() {
    return this.shareContent()
  },

  shareContent: function() {
    if (this.data.essayId) {
      return {
        'title': this.data.essay.title,
        'path': 'pages/essay/web/web?essayId=' + (this.data.essayId),
        'imageUrl': this.data.essay.cover
      }
    } else {
      return {
        'title': '点击打开精彩内容',
        'path': 'pages/essay/web/web?url=' + encodeURIComponent(this.data.url),
        'imageUrl': app.globalData.setting.sharePic
      }
    }
  }
})