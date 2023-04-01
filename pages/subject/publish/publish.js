const app = getApp()
const AV = require('../../../utils/av-core-min');
const util = require('../../../utils/util')
const {SCENE, requestSubscribeMessage} = require('../../../subscribe')
const { notifyAllPage } = require('../../../utils/notify.js')

var recorderManager = null
var audioMG = null 

Page({

  data: {
    title:"",
    content:"",
    medias: [],
    videoId: '',
    submitIng: false,
    adaptQQ:false,

    recordMode: false,
    animationData1: "",
    animationData2: "",
    animationStatus: false,
    recording: false,
    voiceUrl:'',
    voiceId:'',
    playing: false
  },

  onLoad:function(options) {
    this.setData({
      adaptQQ: app.globalData.platform=='qq'
    })
  },

  onUnload:function() {
    if (audioMG != null) {
      audioMG.stop()
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
      new AV.File('voice', {
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
      _this.audioStop()
    })

    audioMG.onStop(() => {
      // _this.stopAudio()
    })

    audioMG.onError((err) => {
      _this.audioStop()
      console.error(err.errMsg)
      return
    })

    audioMG.onPlay(() => {
      _this.setData({
        playing: true
      })
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

  onTitleInput:function(e) {
    this.setData({
      title: e.detail.value
    })
  },

  onContentInput:function(e) {
    this.setData({
      content:e.detail.value
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

  didClickSelectVideo:function() {
    this.chooseMedia(['video'], 1)
    this.setData({
      recordMode: false
    })
  },

  didClickSelectImage:function(e) {
    if (9 - this.data.medias.length <= 0) {
      wx.showToast({
        title: '最多只能上传9张',
        icon:"none"
      })
      return;
    }
    this.chooseImage()
    this.setData({
      recordMode: false
    })
  },
  
  chooseImage: function() {
    var that = this;
    if (!wx.canIUse('chooseMessageFile')) {
      that.chooseMedia(['image'], 9 - that.data.medias.length)
    } else {
      wx.showActionSheet({
        itemList: ['相册/拍照', '会话中选择'],
        success (res) {
          if (res.tapIndex == 0) {
            that.chooseMedia(['image'], 9 - that.data.medias.length)
          } else {
            that.chooseMessageFile()
          }
        },
      })
    }
  },
  
  chooseMedia: function(mediaType, limit) {
    var that = this;
    wx.chooseMedia({
      count: limit,
      mediaType: mediaType,
      maxDuration: 30,
      success: function(res) {
        wx.showToast({
          title: '上传中，请稍候',
          icon: 'loading'
        })
        var tempFiles = res.tempFiles
        var type = res.type
        if (that.data.adaptQQ) {
          var firstItem = tempFiles[0]
          type = firstItem.type
        }
        if (type == 'image') {
          var tempFilePaths = tempFiles.map(item=>{
            return item.tempFilePath
          })
          that.uploadImage(tempFilePaths, 0);
        } else {
          that.uploadVideo(tempFiles[0])
        }
      },
      fail:function(e) {
        console.error(e)
      }
    })
  },

  chooseMessageFile: function() {
    var that = this;
    wx.chooseMessageFile({
      count:9 - this.data.medias.length,
      type: 'image',
      success: function(res) {
        wx.showLoading({
          title: '上传中，请稍候'
        })
        var tempFiles = res.tempFiles
        var tempFilePaths = tempFiles.map(item=>{
          return item.path
        })
        that.uploadImage(tempFilePaths, 0);
      },
    })
  },

  uploadImage: function (tempFilePaths, index) {
    var that = this;
    new AV.File('image', {
      blob: {
        uri: tempFilePaths[index]
      },
    }).save().then(
      file => {
        that.data.medias = that.data.medias.concat({
          'url': file.url(),
          'type': 'image'
        });
        if (index + 1 < tempFilePaths.length) {
          that.uploadImage(tempFilePaths, index + 1);
        } else {
          wx.hideLoading()
          that.setData({
            medias: that.data.medias
          })
        }
      }
    )
  },

  uploadVideo:function (tempVideo) {
    // 先上传视频
    var that = this;
    new AV.File('video', {
      blob: {
        uri: tempVideo.tempFilePath
      },
    }).save().then(
      video => {
        // 再上传封面
        new AV.File('cover', {
          blob: {
            uri: tempVideo.thumbTempFilePath
          },
        }).save().then(
          cover => {
            // 生成video对象
            app.request(
              'publish-video', {
                'cover': cover.url(),
                'url': video.url(),
                'size': tempVideo.size,
                'width': tempVideo.width,
                'height': tempVideo.height,
                'duration': tempVideo.duration
              }
            ).then(res=>{
              wx.hideLoading()
              that.setData({
                videoId: res.video.objectId,
                medias: [{
                  'url': video.url(),
                  'type': 'video',
                  'poster': cover.url()
                }]
              })
            }).catch(e=>{
              wx.hideLoading({
                success: (res) => {},
              })
            })
          }
        )
      }
    )
  },

  didClickDeleteImage:function(e) {
    if (this.data.videoId.length > 0) {
      this.setData({
        medias: [],
        videoId: ''
      })
    } else {
      var index = e.currentTarget.dataset.index;
      var medias = this.data.medias;
      medias.splice(index, 1);
      this.setData({
        medias: medias
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
          _this.setData({
            voice: {},
            voiceId: '',
            voiceUrl:''
          })
          _this.audioStop()
        } else if (res.cancel) {
        }
      }
    })
  },

  didClickPreviewImage:function(e) {
    var index = e.currentTarget.dataset.index;
    wx.previewMedia({
      current: index,
      sources: this.data.medias
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
          if (recorderManager == null) {
            _this.createRecordContext()
          }
          _this.audioStop()
          const options = {
            duration: 360000,
            sampleRate: 44100,
            encodeBitRate: 192000,
            format: 'mp3',
            frameSize: 50
          }
          recorderManager.start(options)
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
    audioMG.src = this.data.voiceUrl;
    audioMG.play();
  },

  // 音频停止
  audioStop() {
    if(audioMG != null) {    
      audioMG.stop();
      this.setData({
        playing: false
      })
    }
  }, 

  onConfirmSubmit:function() {
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
    
    if (this.data.content.length < 1) {
      wx.showToast({
        title: '请填写你的状态',
        icon:'none'
      })
      return;
    }

    this.setData({
      submitIng: true
    })
    wx.showLoading({
      title: '提交中...'
    })
    var images = []
    if (this.data.videoId.length == 0) {
      this.data.medias.forEach(item=>{
        images = images.concat(item.url)
      })
    }
    var params = {
      title: this.data.title,
      content: this.data.content,
      images: images,
      videoId: this.data.videoId,
      voiceId: this.data.voiceId
    };
    var _this = this;
    requestSubscribeMessage(SCENE.SUBJECT, false, function() {
      _this.submitSubject(params)
    })
  },

  submitSubject(params) {
    var _this = this
    app.request('publish-subject', params).then(res=>{
      wx.showToast({
        title: '提交成功！',
        icon:"success"
      })
      notifyAllPage({'name':'updateSubjectList', 'value':res});
      wx.navigateBack({
        delta:1
      })
    }).catch(e=>{
      wx.hideLoading()
      wx.showToast({
        title: e.rawMessage,
        icon:'none'
      })
      _this.setData({
        submitIng: false
      })
    });
  }
})