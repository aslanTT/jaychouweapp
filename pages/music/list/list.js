const app = getApp()
const env = require('../../../network/env')
const player = require('../../../player/player')
const util = require('../../../utils/util.js')
const notification = require("../../../utils/notificationCenter");
const {SCENE, requestSubscribeMessage} = require('../../../subscribe')

Page({

  data: {
    bannerImg:'',
    shareImg:'',
    banner:{},
    albumList:[],
    loading: true,

    noticeShow: !env.simplifyMode(),

    menus: [],

    currentMusic:null,
    onPlay:false, // 当前是否有音频 
    isPlay:false,  // 音频是否在播放
    todayMusic: null
  },

  onLoad: function (options) {
    let titleBarHeight = app.globalData.titleBarHeight
    let statusBarHeight = app.globalData.statusBarHeight
    this.setData({
      topBarHeight: statusBarHeight + titleBarHeight,
      bannerImg: app.globalData.setting.coverPic,
      shareImg: app.globalData.setting.sharePic
    })
    this.fetchMenus()
    this.fetchAlbumList()
    this.fetchTodayMusic()
    player.addObserver(this);
    if (player.playing()) {
      this.setData({
        currentMusic:player.music(),
        onPlay:true,
        isPlay:true
      })
    }
    notification.addNotification('refreshSetting', this.reloadCoverPic, {})
  },

  onReady:function() {
    notification.addNotification("refreshCollect", this.fetCollectList, this)
  },

  reloadCoverPic:function() {
    this.setData({
      bannerImg: app.globalData.setting.coverPic,
      shareImg: app.globalData.setting.sharePic,
      banner: app.globalData.setting.banner
    })
  },

  headerSearch:function() {
    wx.navigateTo({
      url: '/pages/music/search/search',
    })
  },

  onPlay() {
    this.setData({
      currentMusic:player.music(),
      onPlay:true,
      isPlay:true
    })
  },

  onPause() {
    this.setData({
      isPlay:false
    })
  },

  onStop() {
    this.setData({
      onPlay:false,
      isPlay:false
    })
  },

  onEnded() {
    this.setData({
      onPlay:false,
      isPlay:false
    })
  },

  onTimeUpdate(info) {
    this.setData({
      currentTime: util.formatSecondTime(info.currentTime),
      durationTime: util.formatSecondTime(info.duration)
    })
  },

  didClickPlay:function() {
    if (player.playing()) {
      player.pause()
    } else {
      player.play()
    }
  },

  didClickCurrentMusic:function(e) {
    if (e.target.id=='play') return;
    wx.navigateTo({
      url: '../play/play?musicId='+player.music().objectId
    })
  },

  fetchMenus:function() {
    var _this = this
    app.request('menu', {}).then(res=>{
      _this.setData({
        menus: res
      })
    })
  },

  fetchAlbumList: function() {
    var _this = this
    app.request('album-list', {

    }).then(res=>{
      _this.setData({
        albumList: res,
        loading: false
      })
    }).catch(e=>{
      if (e.code == 140) {
        _this.setData({
          restMode: true,
          loading: false
        })
      }
    });
  },

  fetchTodayMusic:function() {
    var _this = this
    app.request('today-music', {

    }).then(res=>{
      _this.setData({
        todayMusic: res
      })
    });
  },

  didClickTodayMusic:function() {
    if (!app.globalData.setting.playEnable) {
      wx.showToast({
        title: '小程序上不支持播放',
        icon: 'none'
      })
      return
    }
    requestSubscribeMessage(SCENE.MUSIC)
    wx.navigateTo({
      url: '/pages/music/play/play?musicId='+this.data.todayMusic.music.objectId,
    })
  },

  didClickPraise:function() {
    wx.navigateTo({
      url: '/pages/praise/praise',
    })
  },

  didClickAd:function() {
    wx.navigateTo({
      url: '/pages/ad/ad',
    })
  },

  didClickMessage:function() {
    requestSubscribeMessage(SCENE.MUSIC)
    wx.navigateTo({
      url: '/pages/music/remember/remember',
    })
  },

  didClickAlbum:function() {
    if (!app.globalData.setting.playEnable) {
      wx.showToast({
        title: '小程序上不支持播放',
        icon: 'none'
      })
      return
    }
    requestSubscribeMessage(SCENE.MUSIC)
    if (player.playing()) {
      wx.navigateTo({
        url: '/pages/music/play/play?musicId='+this.data.currentMusic.objectId,
      })
    }
  },

  didClickSong:function() {
    wx.navigateTo({
      url: '/pages/music/songs/songs',
    })
  },

  didClickMyCollect:function() {
    wx.navigateTo({
      url: '/pages/mine/collect/collect',
    })
  },

  didClickMyListened:function() {
    wx.navigateTo({
      url: '/pages/mine/listened/listened',
    })
  },

  didClickEssay:function() {
    wx.switchTab({
      url: '/pages/essay/list/list',
    })
  },

  didClickPhoto:function() {
    wx.navigateTo({
      url: '/pages/pic/list/list',
    })
  },

  didClickCollectedSong:function() {
    wx.navigateTo({
      url: '/pages/music/songs/songs?strategy=1',
    })
  },

  didClickListenedSong:function() {
    wx.navigateTo({
      url: '/pages/music/songs/songs?strategy=2',
    })
  },

  didClickPostcardSong:function() {
    wx.navigateTo({
      url: '/pages/music/songs/songs?postcard=1',
    })
  },

  didClickBZ:function () {
    wx.navigateTo({
      url: '/pages/essay/result/result?searchWord=壁纸',
    })
  },

  didClickAvatar:function () {
    wx.navigateTo({
      url: '/pages/essay/result/result?searchWord=头像',
    })
  },

  didClickPublic:function() {
    var url = encodeURIComponent("https://mp.weixin.qq.com/s?__biz=MzkzNjI2NzE5OA==&mid=2247483847&idx=1&sn=4c0dd3b452d2b198bd79d62db5d36ce9&chksm=c2a01d16f5d794009b61313111ece8e7ae35fb9411f1c91a448622dce93324aaaa91c97f3930#rd")
    wx.navigateTo({
      url: '/pages/essay/web/web?url='+url
    })
  },

  didClickShop:function() {
    wx.navigateToMiniProgram({
      appId: 'wx2e059a595036e58a',
      envVersion: 'release'
    })
  },

  didTapAlbumCell:function(e) {
    requestSubscribeMessage(SCENE.MUSIC)
    var albumId = e.currentTarget.dataset.albumId;
    wx.navigateTo({
      url: '/pages/music/album/album?albumId='+albumId
    })
  },

  onShareAppMessage: function () {
    return this.shareContent()
  },

  onShareTimeline:function() {
    return this.shareContent()
  },

  shareContent: function() {
    return {
      title:'免费听周杰伦的歌',
      path:'pages/music/list/list',
      imageUrl:app.globalData.setting.sharePic
    }
  }
})