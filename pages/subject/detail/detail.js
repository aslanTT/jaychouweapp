const app = getApp()
const AV = require('../../../utils/av-core-min');
const { User } = require('../../../utils/av-core-min');
const util = require('../../../utils/util')
const env = require('../../../network/env')
const {SCENE, requestSubscribeMessage} = require('../../../subscribe')

var recorderManager = null
var audioMG = null

Page({
  data: {
    myselfId: '',
    subjectId:'',
    subject:{},
    loading:true,
    // 评论回复相关
    replyList:[],
    replyHasMore:false,
    content:'',
    replyId:'',
    reply:{},
    replyUser:'',
    images:[],
    commentShow:false,
    adaptQQ:false,
    submitIng: false,
    sort: 1,
    fixedView:false,
    topContentViewHeight:0,
    topBarHeight:0,
    banner:{},
    // 录音相关
    currentPlay: {
      subjectPlaying: false,
      playing: false,
      replyPlayingIndex: -1
    },
    recordMode: false,
    recording: false,
    animationData1: "",
    animationData2: "",
    animationStatus: false,
    voiceUrl:'',
    voiceId:'',
  },

  onLoad: function (options) {
    var isAdmin = false
    if (app.globalData && app.globalData.userInfo) {
      isAdmin = app.globalData.userInfo.objectId == '61ece5c9328d186424af7e88'
    }
    this.setData({
      subjectId:options.subjectId,
      isAdmin: isAdmin,
      adaptQQ: app.globalData.platform=='qq',
      banner: app.globalData.setting.banner,
      isIpx: app.globalData.isIpx,
      myselfId: env.simplifyMode() ? "" : User.current().id
    })
    this.fetchSubjectDetail()
    if (options.noticeId && options.noticeId.length > 0) {
      this.readNotice(options.noticeId)
    }
  },

  onUnload: function() {
    this.audioStop()
    if (audioMG != null) {
      // audioMG.destroy()
    }
    if (recorderManager != null) {
      recorderManager.stop()
    }
  },

  createRecordContext() {
    // 录音相关
    var _this = this
    recorderManager = wx.getRecorderManager()

    recorderManager.onStart(() => {
      console.log('start record 2')
      _this.startRecordAnimation()
      _this.setData({
        recording: true
      })
    }),

    recorderManager.onStop((res) => {
      const { tempFilePath } = res

      if (tempFilePath.length == 0) {
        return
      }

      if (res.duration/1000 < 2) {
        wx.hideLoading({
          success: (res) => {},
        })
        wx.showToast({
            title: '录制时间太短',
            duration: 1000,
            icon: 'none'
        });
        _this.setData({
          animationStatus: false
        })
        _this.stopRecordAnimation()
        return;
      }

      wx.showLoading({
        title: '录音处理中...',
        icon:'none'
      })

      new AV.File('reply', {
        blob: {
          uri: tempFilePath
        },
      }).save().then(
        voice => {
          _this.setData({
            voiceUrl: voice.url(),
            recordMode: false
          })
          res.voiceUrl = voice.url()
          _this.createVoice(res)
        }
      )
    })

    recorderManager.onInterruptionBegin(()=>{
      recorderManager.pause()
      _this.setData({
        animationStatus: false
      })
      _this.stopRecordAnimation()
    })

    recorderManager.onInterruptionEnd(()=>{
      recorderManager.resume()
      _this.startRecordAnimation()
    })

    recorderManager.onError((res) => {
      console.error(res)
      wx.hideLoading({
        success: (res) => {},
      })
      _this.setData({
        animationStatus: false
      })
      _this.stopRecordAnimation()
    })
  },

  createAudioContext() {
    var _this = this
    audioMG = wx.createInnerAudioContext({
      useWebAudioImplement: true
    })
    audioMG.obeyMuteSwitch = false
    audioMG.onEnded(() => {
      _this.stopAudio()
    })

    audioMG.onStop(() => {
      // _this.stopAudio()
    })

    audioMG.onError((err) => {
      _this.stopAudio()
      console.error(err.errMsg)
      return
    })
  },

  stopAudio() {
    if (this.data.currentPlay.replyPlayingIndex != -1) {
      var index = this.data.currentPlay.replyPlayingIndex
      var reply = this.data.replyList[index]
      reply.voice.playing = false
    }
    this.setData({
      currentPlay: {
        subjectPlaying: false,
        playing: false,
        replyPlayingIndex: -1
      },
      replyList: this.data.replyList
    })
  },

  startRecordAnimation() {
    var _this = this
    this.setData({
      animationStatus: true
    })
    this.animationFun('animationData1')
    setTimeout(()=>{
      _this.animationFun('animationData2')
    },500)
    setTimeout(() => {
      _this.animationRest()
    }, 1000)
  },

  stopRecordAnimation() {
    var _this = this
    this.animationEnd('animationData1')
    setTimeout(()=>{
      _this.animationEnd('animationData2')
    },500)
  },

  createVoice(voice) {
    var _this = this
    app.request(
      'publish-voice', {
        'url': voice.voiceUrl,
        'size': voice.fileSize,
        'duration': voice.duration
      }
    ).then(res=>{
      wx.hideLoading()
      _this.setData({
        voiceId: res.voice.objectId,
        voice: res.voice,
        voiceDuration: util.formatSecondTime(res.voice.duration/1000)
      })
    }).catch(e=>{
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },

  onReady:function() {
    this.data.myselfId = env.simplifyMode() ? "" : User.current().id
  },

  readNotice:function(noticeId) {
    app.request('read-notice', {
      'noticeId': noticeId
    })
  },

  fetchSubjectDetail:function() {
    var _this = this;
    app.request('subject-detail', {
      subjectId: this.data.subjectId
    }).then(res=>{
      _this.setData({
        subject: res,
        loading:false
      })
      _this.fetchReplyList(true)
      _this.calculateTop()
    }).catch(e=>{
      console.error(e);
      wx.showToast({
        title: '请求出错了哦',
        icon:'none'
      })
      _this.setData({
        loading:false
      })
    })
  },

  fetchReplyList:function(isRefresh) {
    var _this = this;
    var total = isRefresh?0:this.data.replyList.length
    app.request('reply-list', {
      subjectId: this.data.subjectId,
      total:total,
      sortType: this.data.sort
    }).then(res=>{
      wx.stopPullDownRefresh()
      wx.hideLoading()
      var list = _this.data.replyList;
      if (isRefresh) {
        list = res.list
        if (_this.data.fixedView) {
          wx.pageScrollTo({
            duration: 0,
            scrollTop: _this.data.topContentViewHeight
          })
        }
      } else {
        list = list.concat(res.list);
      }
      _this.setData({
        replyList:list,
        replyHasMore:res.hasMore
      })
    });
  },

  didClickReportButton:function() {
    wx.showActionSheet({
      itemList: ['色情/违法等不良行为', '欺诈骗钱', '骚扰', '其他'],
      success:function(res) {
        wx.showToast({
          title: '已收到您的举报',
          icon:'none'
        })
      }
    })
  },

  didClickSort:function(e) {
    var sort = this.data.sort
    if (sort == 1) {
      sort = 2
    } else {
      sort = 1
    }
    this.setData({
      sort: sort
    })
    wx.showLoading({
      title: '重新加载中...',
      icon:'none'
    })
    this.fetchReplyList(true)
  },

  didClickUser:function(e) {
    if (!app.globalData.setting.chatEnable) {
      return
    }
    var userId = e.currentTarget.dataset.userId;
    if (userId == this.data.myselfId) {
      return
    }

    var userInfo = app.globalData.userInfo
    var nickName = userInfo.get('nickName')
    if (userInfo == null || nickName == null || nickName.length == 0) {
      wx.showModal({
        title: '',
        content: '请先设置昵称',
        confirmText: '去设置',
        success (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/mine/setting/setting',
            })
          } else if (res.cancel) {
          }
        }
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/message/message?userId='+userId
    })
  },

  didClickPreviewReplyImage:function(e) {
    var index = e.currentTarget.dataset.index;
    var replyIndex = e.currentTarget.dataset.replyIndex;
    wx.previewImage({
      current: this.data.replyList[replyIndex].imgs[index],
      urls: this.data.replyList[replyIndex].imgs
    })
  },

  didClickPreviewQuoteImage: function (e) {
    var index = e.currentTarget.dataset.index;
    var replyIndex = e.currentTarget.dataset.replyIndex;
    wx.previewImage({
      current: this.data.replyList[replyIndex].quote.imgs[index],
      urls: this.data.replyList[replyIndex].quote.imgs
    })
  },

  didClickPreviewImage:function(e) {
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.subject.imgs[index],
      urls: this.data.subject.imgs
    })
  },

  didClickComment:function() {
    if (env.simplifyMode()) {
      wx.showToast({
        title: '请前往小程序评论',
        icon: "none"
      })
      return
    }
    this.setData({
      commentShow:true
    })
  },

  didClickReply:function(e) {
    var replyIndex = e.currentTarget.dataset.replyIndex;
    var reply = this.data.replyList[replyIndex];
    this.setData({
      commentShow:true,
      replyId: reply.objectId,
      reply:reply,
      replyUser:reply.user.nickName
    })
  },

  preventTap:function(e) {
    this.setData({
      content: "",
      images: [],
      quoteId: "",
      replyUser:"",
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

  didClickSelectVoice:function() {
    this.setData({
      recordMode: true
    })
    wx.hideKeyboard({
      complete: res => {
        console.log('hideKeyboard res', res)
      }
    })
  },

  didClickSelectImage:function() {
    if (9 - this.data.images.length <= 0) {
      wx.showToast({
        title: '最多只能上传9张',
        icon: "none"
      })
      return;
    }
    var that = this;
    wx.chooseImage({
      count: 9 - this.data.images.length,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        wx.showToast({
          title: '上传中，请稍候',
          icon: 'loading'
        })
        var tempFilePaths = res.tempFilePaths
        that.uploadImage(tempFilePaths, 0);
      },
      fail:function(e) {
        console.error(e)
      }
    })
    this.setData({
      recordMode: false
    })
  },

  uploadImage: function (tempFilePaths, index) {
    var that = this;
    var file = new AV.File('reply', {
      blob: {
        uri: tempFilePaths[index]
      },
    }).save().then(
      file => {
        that.data.images = that.data.images.concat(file.url());
        if (index + 1 < tempFilePaths.length) {
          that.uploadImage(tempFilePaths, index + 1);
        } else {
          wx.hideToast()
          that.setData({
            images: that.data.images
          })
        }
      }
    )
  },

  didClickPreviewUploadImage:function(e) {
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.images[index],
      urls: this.data.images
    })
  },

  didClickDeleteImage: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var images = that.data.images;
    images.splice(index, 1);
    that.setData({
      images: images
    });
  },

  onConfirmSubmit: function () {
    if (this.data.submitIng) {
      return
    }

    var userInfo = app.globalData.userInfo
    var nickName = userInfo.get('nickName')
    if (userInfo == null || nickName == null || nickName.length == 0) {
      wx.showModal({
        title: '',
        content: '请先设置昵称',
        confirmText: '去设置',
        success (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/mine/setting/setting',
            })
          } else if (res.cancel) {
          }
        }
      })
      return
    }

    var _this = this;
    if (this.data.content.length < 2) {
      wx.showToast({
        title: '至少回复2个字',
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
    requestSubscribeMessage(SCENE.SUBJECT, false, function() {
      _this.submitReply()
    })
  },

  submitReply() {
    var _this = this;
    app.request('publish-reply', {
      content: this.data.content,
      imgs: this.data.images,
      subjectId: this.data.subjectId,
      quoteId: this.data.replyId,
      voiceId: this.data.voiceId
    }).then(res => {
      wx.hideLoading({
        success: (res) => {},
      })
      res.user = {
        nickName: app.globalData.userInfo.get('nickName'),
        avatarUrl: app.globalData.userInfo.get('avatarUrl'),
        objectId: _this.data.myselfId
      };
      if (_this.data.voiceId) {
        res.voice = {
          url: _this.data.voiceUrl,
          duration: _this.data.voiceDuration
        }
      }
      if (_this.data.reply) {
        res.quote = _this.data.reply
      }
      if (_this.data.sort == 1) {
        _this.data.replyList.push(res);
      } else {
        _this.data.replyList.unshift(res);
      }
      _this.setData({
        content:"",
        images:[],
        replyId:"",
        reply:{},
        commentShow:false,
        replyList:_this.data.replyList,
        submitIng: false,
        voiceId:'',
        voiceUrl:'',
        voice: {},
        recordMode: false
      })
      wx.showToast({
        title: '提交成功！',
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
  },

  onPullDownRefresh: function () {
    this.fetchSubjectDetail()
  },

  onReachBottom: function () {
    if (this.data.replyHasMore) {
      this.fetchReplyList(false)
    }
  },

  switchLimitChange:function(e) {
    var subject = this.data.subject
    app.request('admin-subject-setting', {
      'key': 'limit',
      'value': e.detail.value,
      'subjectId': subject.objectId
    })
  },

  switchHiddenChange:function(e) {
    var subject = this.data.subject
    app.request('admin-subject-setting', {
      'key': 'hidden',
      'value': e.detail.value,
      'subjectId': subject.objectId
    })
  },

  calculateTop:function() {
    // var topBarHeight = app.globalData.statusBarHeight + app.globalData.titleBarHeight;
    // this.setData({
    //   topBarHeight: 0
    // });

    var _this = this
    this.timeoutId = setTimeout(function () {
      var query = wx.createSelectorQuery().in(_this)
      query.select('.top-content-view').boundingClientRect(function (res) {
        if (res) {
          _this.setData({
            topContentViewHeight: res.height
          });
        } else {
          _this.setData({
            fixedView: false,
            topContentViewHeight: 0
          });
        }
        delete _this.timeoutId;
      }).exec();
    }, 1000)
  },

  onPageScroll: function (event) {
    if (this.data.replyList.length == 0) return;

    var scrollTop = event.scrollTop;
    if (scrollTop == 0) return;

    if (scrollTop > this.data.topContentViewHeight - this.data.topBarHeight + 10) {
      if (this.data.fixedView) return;
      this.setData({
        fixedView: true
      });
    } else {
      if (!this.data.fixedView) return;
      this.setData({
        fixedView: false
      });
    }
  },


  didClickDeleteVoice:function() {
    var _this = this
    wx.showModal({
      title: '',
      content: '删除后不会保存草稿，确定要删除吗？',
      confirmText: '删除',
      success (res) {
        if (res.confirm) {
          _this.audioStop()
          _this.setData({
            voice: {},
            voiceId: '',
            voiceUrl:''
          })
        } else if (res.cancel) {
        }
      }
    })
  },

  animationFun:function(animationData){
    if(!this.data.animationStatus){
      return 
    }
    var animation = wx.createAnimation({
      duration: 1000
    })
    animation.opacity(0).scale(2, 2).step(); 
    this.setData({
      [`${animationData}`]: animation.export()
    })
  },

  animationEnd: function (animationData) {
    var animation = wx.createAnimation({
      duration: 0
    })
    animation.opacity(1).scale(1, 1).step(); 
    this.setData({
      [`${animationData}`]: animation.export()
    })
  },

  recordEnd: function() {
    this.stopRecordAnimation()
    //动画1结束
    var animation1 = wx.createAnimation({
      duration: 0
    })
    animation1.opacity(1).scale(1, 1).step(); 
    //动画2结束
    var animation2 = wx.createAnimation({
      duration: 0
    })
    animation2.opacity(1).scale(1, 1).step(); 
    this.setData({
      animationData1: animation1.export(),
      animationData2: animation2.export(),
      animationStatus: false,
      recording: false
    })
    recorderManager.stop()
  },

  recordClick: function() {
    if (!this.data.recording) {
      var _this = this
      wx.getSetting({
        success (res) {
          let recordSetting = res.authSetting["scope.record"]
          if (recordSetting != undefined && recordSetting==false) {
            wx.showModal({
              title: '',
              content: '请先打开麦克风权限',
              confirmText: '好的',
              success (res) {
                if (res.confirm) {
                  wx.openSetting({
                    withSubscriptions: true,
                  })
                } else if (res.cancel) {
                }
              }
            })
            return
          }
          _this.audioStop()
          if (recorderManager == null) {
            _this.createRecordContext()
          }
          const options = {
            duration: 360000,
            sampleRate: 44100,
            encodeBitRate: 192000,
            format: 'mp3',
            frameSize: 50
          }
          recorderManager.start(options)
          console.log("start record 1")
        }
      })
    } else {
      this.recordEnd()
    }
  },

  animationRest: function() {
    var _this = this
    this.stopRecordAnimation()
    setTimeout(() => {
      if (!_this.data.animationStatus) {
        return
      }
      _this.startRecordAnimation()
    }, 100)
  },

  //音频播放  
  audioPlay(e) {
    if (audioMG == null) {
      this.createAudioContext()
    }
    this.audioStop()
    let voiceUrl = e.currentTarget.dataset.url
    let type = e.currentTarget.dataset.type
    audioMG.src = voiceUrl
    audioMG.play();
    var subjectPlaying = false;
    var recordPlaying = false;
    var replyPlayingIndex = -1;
    if (type == 'subject') {
      subjectPlaying = true
    } else if (type == 'record') {
      recordPlaying = true
    } else if (type == 'reply') {
      let index = e.currentTarget.dataset.index
      var reply = this.data.replyList[index]
      reply.voice.playing = true
      replyPlayingIndex = index
    }
    this.setData({
      currentPlay: {
        subjectPlaying: subjectPlaying,
        playing: recordPlaying,
        replyPlayingIndex: replyPlayingIndex
      },
      replyList: this.data.replyList
    })
  },

  // 音频停止
  audioStop(e) {
    if (audioMG != null) {
      audioMG.stop()
    }
    this.stopAudio()
  }, 

  onShareAppMessage: function () {
    return this.shareContent()
  },

  onShareTimeline:function() {
    return this.shareContent()
  },

  shareContent() {
    var image = ""
    if (this.data.subject.imgs && this.data.subject.imgs.length > 0) {
      image = this.data.subject.imgs[0]
    }
    return {
      title: this.data.subject.content,
      imageUrl: image,
      path: 'pages/subject/detail/detail?subjectId='+this.data.subject.objectId
    }
  }
})