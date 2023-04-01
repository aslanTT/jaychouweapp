const app = getApp()
const AV = require('../../utils/av-core-min');
const util = require('../../utils/util.js')
const {SCENE, requestSubscribeMessage} = require('../../subscribe')

Page({
  data: {
    userId:'',
    content: '',
    image: '',
    list: [],
    loading: true,
    submitIng: false,
    videoAd:{},
    supportVideo:false,
    adaptQQ: false
  },

  onLoad: function (options) {
    this.setData({
      userId: options.userId,
      isIpx: app.globalData.isIpx
    })
    var _this = this
    this.fetchMessageList(function () {
      _this.pageScrollToBottom()
    })
    if (options.noticeId && options.noticeId.length > 0) {
      this.readNotice(options.noticeId)
    }
    this.loadVideoAd()
  },

  loadVideoAd:function() {
    if (this.chatEnable()) {
      return
    }
    var that = this;
    var adUnitId = app.globalData.setting.banner["chat-video"];
    let videoAd = wx.createRewardedVideoAd({
      adUnitId: adUnitId
    })
    if (videoAd && videoAd.load) {
      videoAd.onClose(function(status){
        if ((status && status.isEnded) || status === undefined) {
          // can chat
          var map = {}
          var date = util.formatDate(new Date())
          map[date] = '1'
          wx.setStorage({
            key:"chat_banner",
            data:map
          })
          that.didClickComment()
        }
      })
      
      videoAd.load()
        .then(() => {
          that.setData({
            supportVideo: true,
            videoAd: videoAd
          })
        })
        .catch(err => {
          console.log('激励视频加载失败');
        })

      videoAd.onError(function(error) {
        console.error(error);
      });
    }
  },

  readNotice:function(noticeId) {
    app.request('read-notice', {
      'noticeId': noticeId
    })
  },

  fetchMessageList: function(callback) {
    var that = this
    app.request('message-list', {
      'partnerId': this.data.userId
    }).then(res=>{
      wx.hideLoading()
      wx.stopPullDownRefresh()
      that.setData({
        list: res.list,
        loading: false
      })
      wx.setNavigationBarTitle({
        title: res.partner
      })
      if (callback && typeof(callback) == 'function') {
        callback()
      }
    })
  },

  pageScrollToBottom: function() {
    wx.createSelectorQuery().select('.message-list-view').boundingClientRect(function(rect){
      // 使页面滚动到底部
      if (rect != null) {
        wx.pageScrollTo({
          scrollTop: rect.bottom+60
        })
      }
    }).exec()
  },

  chatEnable: function() {
    var date = util.formatDate(new Date())
    var hasClickBanner = wx.getStorageSync('chat_banner')[date]
    if (hasClickBanner) {
      return true
    }
    return false
  },

  watchVideoBanner:function() {
    var that = this;
    wx.showModal({
      title:'一天一次',
      content:'视频播放结束获取聊天功能',
      confirmColor:'#e9c705',
      cancelText:'放弃',
      success (res) {
        if (res.confirm) {
          if (that.data.videoAd) {
            that.data.videoAd.show().catch(error => {
              // 失败重试
              that.data.videoAd.load()
              .then(() => that.data.videoAd.show())
              .catch(err => {
                wx.showToast({
                  title: '加载失败，请重试',
                  icon: 'error'
                })
              })
            });
          } else {
            wx.showToast({
              title: '加载失败，请重试',
              icon: 'error'
            })
          }
        } 
      }
    })
  },

  didClickImage:function(e) {
    var image = e.currentTarget.dataset.image;
    wx.previewImage({
      urls: [image],
      current: 0
    })
  },

  didClickComment:function() {
    if (!this.chatEnable() && this.data.supportVideo) {
      this.watchVideoBanner()
      return
    }
    this.setData({
      commentShow:true
    })
  },

  didClickRefresh:function() {
    wx.showLoading({
      title: '刷新中...',
    })
    this.fetchMessageList(true)
  },

  preventTap:function(e) {
    this.setData({
      content: "",
      image: "",
      commentShow: false
    })
  },

  preventInputAreaTap:function() {
    console.log('preventInputAreaTap');
  },

  onContentInput:function(e) {
    this.setData({
      content: e.detail.value
    })
  },

  didClickSelectImage:function() {
    var that = this;
    wx.chooseImage({
      count: 1,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        wx.showToast({
          title: '上传中，请稍候',
          icon: 'loading'
        })
        var tempFilePaths = res.tempFilePaths
        that.uploadImage(tempFilePaths[0]);
      },
      fail:function(e) {
        console.error(e)
      }
    })
  },

  uploadImage: function (tempFilePath) {
    var that = this;
    var file = new AV.File('file-name', {
      blob: {
        uri: tempFilePath
      },
    }).save().then(
      file => {
        wx.hideToast()
        that.setData({
          image: file.url()
        })
      }
    )
  },

  didClickPreviewUploadImage:function(e) {
    wx.previewImage({
      current: 0,
      urls: [this.data.image]
    })
  },

  didClickDeleteImage: function (e) {
    this.setData({
      image: ""
    });
  },

  onConfirmSubmit: function () {
    if (this.data.submitIng) {
      return
    }

    var _this = this;
    if (this.data.content.length == 0 && this.data.image.length == 0) {
      wx.showToast({
        title: '文字和图片不能都为空',
        icon: 'none'
      })
      return;
    }
    this.setData({
      submitIng: true
    })
    wx.showLoading({
      title: '提交中...'
    })
    requestSubscribeMessage(SCENE.CHAT, false, function() {
      _this.submitMessage()
    })
  },

  submitMessage() {
    var _this = this;
    app.request('leave-message', {
      content: this.data.content,
      image: this.data.image,
      touserId: this.data.userId
    }).then(res => {
      wx.hideLoading({
        success: (res) => {},
      })
      _this.data.list.push(res);
      _this.setData({
        content:"",
        image:"",
        commentShow:false,
        list:_this.data.list,
        submitIng: false
      })
      wx.showToast({
        title: '留言成功！',
        icon: "success"
      })
    }).catch(e => {
      wx.hideLoading()
      wx.showToast({
        title: e.rawMessage,
        icon: 'none'
      })
      _this.setData({
        submitIng: false
      })
    });
  }
})