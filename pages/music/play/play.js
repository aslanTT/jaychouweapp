const AV = require('../../../utils/av-core-min');
const { User, Cloud } = require('../../../utils/av-core-min');
const util = require('../../../utils/util.js')
const {SCENE, requestSubscribeMessage} = require('../../../subscribe')
const request = require('../../../network/request.js');
const player = require('../../../player/player');
const playerManager = require('../../../player/playerManager')
const notification = require("../../../utils/notificationCenter");
const app = getApp()
const env = require('../../../network/env')

Page({

  data: {
    myselfId:'',
    currentLyric: "",
    recommendList:[],
    commentList:[],
    commentShow: false,
    toComment: null,
    isPlay: false,
    currentMusic:{},
    musicList:[],
    currentIndex:-1,
    loading:true,
    playEnable: true,
    sliderValue:0,
    isCollect:false,
    collectCount: 0,
    showPlayList:false,
    adaptQQ:false,
    placeholder:'写下你的青春...',
    isIpx: app.globalData.isIpx,
    playMode: {},
    simplifyMode: env.simplifyMode()
  },

  onLoad: function (options) {
    notification.addNotification('refreshSetting', this.reload, {})
    if (!app.globalData.setting.playEnable) {
      this.setData({
        playEnable: false,
        loading: false,
        musicId: options.musicId 
      })
      return
    }
    player.addObserver(this);  
    playerManager.addObserver(this)
    if (options.musicId) {
      this.fetchMusicDetail(options.musicId, function(music) {
        if (!player.playing() || music.objectId !== player.music().objectId) {
          playerManager.updateList(music)
        }
        player.startPlay(music)
      });
    }
  },

  reload:function() {
    if (this.data.playEnable) {
      return
    }
    if (!app.globalData.setting.playEnable) {
      this.setData({
        playEnable: false,
        loading: false
      })
      return
    }
    if (this.data.musicId) {
      var _this = this
      this.fetchMusicDetail(this.data.musicId, function(music) {
        _this.setData({
          playEnable: true,
          loading: false
        })
        player.addObserver(_this);  
        playerManager.addObserver(_this)
        if (!player.playing() || music.objectId !== player.music().objectId) {
          playerManager.updateList(music)
        }
        player.startPlay(music)
      });
    }
  },
 
  onShow:function() {
    var user = User.current()
    var myselfId = ""
    if (user && user != null) {
      myselfId = user.id
    }
    this.setData({
      adaptQQ:app.globalData.platform=='qq',
      myselfId: myselfId,
      playMode: playerManager.mode()
    })
  },

  onUnload:function() {
    player.removeObserver(this)
    playerManager.removeObserver(this)
  },

  fetchMusicDetail:function(musicId, callback) {
    request('music-detail', {
      "musicId": musicId
    }).then(res=>{
      if (callback && typeof callback == 'function') {
        callback(res)
      }
    })
  },

  fetchUserListenPreview() {
    var _this = this
    request('user-listen-preview', {
      'musicId':this.data.currentMusic.objectId
    }).then(res=>{
      _this.setData({
        listenCount: res.count,
        listenAvatars: res.list
      })
    });
  },

  fetchCollect() {
    if (this.data.simplifyMode) {
      return
    }
    var _this = this
    request('isCollect', {
      'musicId':this.data.currentMusic.objectId
    }).then(res=>{
      _this.setData({
        isCollect:res.isCollect,
        collectCount: res.count
      })
    });
  },

  fetchRecommend() {
    var _this = this;

    request('recommend-music', {
      'musicId':this.data.currentMusic.objectId
    }).then(res=>{
      _this.setData({
        recommendList:res.list
      })
    });

    request('recommend-essay', {
      'musicId': this.data.currentMusic.objectId
    }).then(res=>{
      _this.setData({
        essayList: res
      })
    })
  },

  fetchRemember:function(isRefresh=true) {
    var _this = this;
    request('remember-list', {
      musicId: this.data.currentMusic.objectId,
      total: this.data.commentList.length
    }).then(res=>{
      var list = _this.data.commentList;
      if (isRefresh) {
        list = res.list
      } else {
        list = list.concat(res.list);
      }
      _this.setData({
        commentList: list,
        hasMore: res.hasMore
      })
    });
  },

  onReachBottom: function () {
    if (this.data.hasMore) {
      this.fetchRemember(false);
    }
  },

  didClickComment:function() {
    this.setData({
      commentShow:true
    })
  },

  preventTap:function(e) {
    this.setData({
      content: "",
      quoteId: "",
      replyUser:"",
      syncToChat:true,
      commentShow: false,
      toComment: null
    })
  },

  preventInputAreaTap:function() {
    console.log('preventInputAreaTap');
  },

  didClickReply: function (e) {
    requestSubscribeMessage(SCENE.MUSIC)
    var self = this;
    var index = e.currentTarget.dataset.index;
    var comment = this.data.commentList[index];
    
    if (this.data.myselfId == comment.userId) {
      // myself
      return;
    }

    if (this.data.toComment != null && this.data.toComment.userId == comment.userId) {
      return;
    }

    var currentString = this.data.content||'';
    self.setData({
      commentShow:true,
      content: "@" + comment.user + ": " + currentString,
      focus: true,
      toComment:comment
    });
  },

  bindKeyInput: function (e) {
    if (this.data.toComment != null && this.data.content.indexOf(this.data.toComment.user) == -1) {
      this.setData({
        content: e.detail.value,
        toComment: null
      })
    } else {
      this.setData({
        content: e.detail.value
      })
    }
  },

  onConfirmSubmit:function(e) {
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

    this.setData({
      submitIng: true
    })
    wx.showLoading({
      title: '提交中...'
    })
    this.submitReply();
  },

  submitReply:function() {
    var content = this.data.content;
    if (this.data.toComment) {
      var replyUser = '@'+this.data.toComment.user+': ';
      var subStringIndex = content.indexOf(replyUser);
      content = content.substring(subStringIndex+replyUser.length);
    }

    if (content.length <= 0) {
      wx.showToast({
        title: '请输入文字',
        icon:'none'
      })
      return;
    }
    wx.showLoading({
      title: '提交中...',
    })

    var self = this;
    request('publish-remember', {
      musicId: this.data.currentMusic.objectId,
      content: content,
      toCommentId: this.data.toComment?this.data.toComment.objectId:''
    }).then(res=>{
      var commentList = self.data.commentList;
      commentList.splice(0,0,res.remember);
      self.setData({
        commentList: commentList,
        comment: self.data.content,
        toComment:null,
        content:'',
        commentShow:false,
        submitIng: false
      });
      wx.showToast({
        title: '提交成功！',
        icon: "success"
      })
    }).catch(e=>{
      wx.hideLoading()
      wx.showToast({
        title: e.errorMsg
      })
      self.setData({
        submitIng: false
      });
    })
  },

  onPullListenListBottom:function() {
    if (playerManager.hasMore()) {
      var _this = this
      playerManager.loadMorePlayList(function() {
        _this.setData({
          musicList: playerManager.playList()
        })
      })
    }
  },

  startPrePlay() {
    this.data.musicList = playerManager.playList()
    this.data.currentIndex = playerManager.currentIndex()

    var lyric = util.reconvert(this.data.currentMusic.lyric)
    lyric = util.parseLyric(lyric);
    this.setData({
      lyric: lyric
    })

    this.fetchUserListenPreview();
    this.fetchRecommend();
    this.fetchCollect();
    this.fetchRemember();
  },

  onStartPlay(info) {
    this.setData({
      currentMusic: info.music,
      loading: false,
      isPlay: player.playing()
    })
    if (info.new) {
      this.setData({
        sliderValue: 0,
        duration: info.music.duration,
        currentTime: "0:00",
        currentLyric: info.music.name,
        durationTime: util.formatSecondTime(info.music.duration)
      })
    } else {
      this.setData({
        sliderValue: player.currentTime(),
        currentTime: util.formatSecondTime(player.currentTime()),
        duration: player.duration(),
        durationTime: util.formatSecondTime(player.duration())
      })
    }
    this.startPrePlay();
  },

  onPlay(info) {                      
    this.setData({
      isPlay:true,
      duration: info.duration
    })
  },

  onStop() {
    this.setData({
      isPlay:false,
      sliderValue: 0
    })
    // wx.navigateBack({
    //   delta: 1,
    // })
  },

  onPause() {
    this.setData({
      isPlay:false
    })
  },

  onEnded() {    
    this.setData({
      isPlay: false,
      sliderValue: 0
    })           
  },

  onTimeUpdate(info) {
    var currentLyric = this.data.currentLyric
    var currentTime = parseInt(info.currentTime)
    if (this.data.lyric && this.data.lyric[currentTime]) { 
      currentLyric = this.data.lyric[currentTime]
      if (currentLyric == '\r' || currentLyric.indexOf('QQ') != -1) {
        currentLyric = this.data.currentLyric
      }
    }
    this.setData({
      sliderValue: info.currentTime,
      currentTime: util.formatSecondTime(info.currentTime),
      durationTime: util.formatSecondTime(info.duration),
      duration: info.duration,
      currentLyric: currentLyric
    })
  },

  updatePlayList:function(info) {
    this.setData({
      musicList: info.list
    })
  },

  didClickCollect:function() {
    if (this.data.simplifyMode) {
      wx.showToast({
        title:'请前往小程序使用完整服务',
        icon: 'none'
      })
      return
    }
    var _this = this;
    if (this.data.isCollect) {
      request('cancelCollect', {
        'musicId':this.data.currentMusic.objectId
      }).then(res=>{
        if (res.success) {
          _this.setData({
            isCollect:false,
            collectCount: Math.max(_this.data.collectCount - 1, 0)
          })
          notification.postNotificationName('refreshCollect', {});
        }
      })
    } else {
      request('collect', {
        'musicId':this.data.currentMusic.objectId
      }).then(res=>{
        if (res.success) {
          _this.setData({
            isCollect:true,
            collectCount: _this.data.collectCount + 1
          })
          notification.postNotificationName('refreshCollect', {});
        }
      })
    }
  },

  didClickPostCard:function() {
    wx.navigateTo({
      url: '/pages/music/postcard/postcard?musicId='+this.data.currentMusic.objectId,
    })
  },

  didClickSwitchMode:function() {
    let mode = playerManager.switchMode()
    this.setData({
      playMode: mode
    })
  },
 
  didClickPlaylist:function() {
    this.setData({
      currentIndex: playerManager.currentIndex(),
      showPlayList: true,
      musicList: playerManager.playList()
    })
  },

  didClickClosePlaylist:function() {
    this.setData({
      showPlayList:false
    })
  },

  onSliderStartDrag:function(e) {
    player.pause()
  },

  onSliderChange:function(e) {
    player.seek(e.detail.value)
    player.play()
  },

  handleToggleBGAudio() {
    if (!app.globalData.setting.userPlayEnable) {
      wx.showModal({
        title: '',
        content: '因版权问题，小程序上不支持播放',
        showCancel: false,
        complete: (res) => {}
      })
      return
    } 
    if (player) {
      if (player.playing()) {
        player.pause();
      } else {
        player.play();
      }
    } else {
      this.startPlay();
    }
  },

  didClickMusicAlbumLink:function() {
    wx.navigateTo({
      url: '../album/album?albumId='+this.data.currentMusic.album.objectId
    })
  },

  didClickMusicLyric:function() {
    wx.navigateTo({
      url: '../lyric/lyric?musicId='+this.data.currentMusic.objectId,
    })
  },

  didClickNextMusic: function () {
    playerManager.next()
  },

  didClickPreMusic:function () {
    playerManager.prev()
  },

  didTapRecommendMusic: function(e) {
    var music = e.currentTarget.dataset.music;
    playerManager.updateList(music)
    player.startPlay(music)
  },

  didTapMusic:function (e) {
    var music = e.currentTarget.dataset.music;
    var index = e.currentTarget.dataset.index;
    playerManager.setCurrentIndex(index)
    player.startPlay(music)
    this.setData({
      currentIndex: index
    })
  },

  didClickBackButton:function() {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({
        complete: (res) => {},
      })
    } else {
      wx.switchTab({
        url: '../list/list'
      })
    }
  },

  didClickUserListenList:function(e) {
    if (e.target.id == 'back') {
      return;
    }
    // this.didClickBackButton()
  },

  didTapCell:function(e) {
    var essay = e.currentTarget.dataset.essay;
    wx.navigateTo({
      url: '/pages/essay/web/web?essayId='+essay.objectId
    })
    // requestSubscribeMessage(SCENE.ESSAY);
  },

  shareData:function() {
    return {
      title:this.data.currentMusic.singer.name + ":" + this.data.currentMusic.name,
      path:'pages/music/play/play?musicId='+this.data.currentMusic.objectId,
      imageUrl:this.data.currentMusic.album.covers[0]
    }
  },

  onShareAppMessage:function() {
    return this.shareData()
  },

  onShareTimeline:function () {
    return this.shareData()
  }
})