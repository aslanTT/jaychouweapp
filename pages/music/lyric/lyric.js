const AV = require('../../../utils/av-core-min');
const { User, Cloud } = require('../../../utils/av-core-min');
const util = require('../../../utils/util.js')
const request = require('../../../network/request.js');
const player = require('../../../player/player');
const app = getApp()

Page({

  data: {
    cover:'',
    name:'',
    album:{},
    lyric:{},
    lyricKeys: [],
    lyricValues: [],
    loading: true,
    currentIndex: 0,
    isIpx: app.globalData.isIpx
  },

  onLoad: function (options) {
    var musicId = options.musicId
    if (musicId) {
      this.loadMusic(musicId)
      player.addObserver(this);
    }
  },

  onUnload:function() {
    player.removeObserver(this)
    wx.pageScrollTo({
      duration: 0,
      scrollTop: 0
    })
  },

  didClickBackButton:function() {
    wx.navigateBack({
      delta: 1,
    })
  },

  loadMusic:function(musicId) {
    this.data.musicId = musicId
    var _this = this
    request('music-lyric', {
      musicId: musicId
    }).then(res=>{
      var lyric = util.reconvert(res.lyric)
      lyric = util.parseLyric(lyric)
      _this.setData({
        loading: false,
        lyric: lyric,
        lyricKeys: Object.keys(lyric),
        lyricValues: Object.values(lyric),
        cover: res.cover,
        name: res.name,
        album: res.album,
        currentIndex: 0,
        scrollTop: 0
      })
      wx.setNavigationBarTitle({
        title: res.name
      })
      _this.updateTime(player.currentTime())
    })
  },

  updateTime(playerTime) {
    if (playerTime <= 0) return
    var currentLyric = this.data.currentLyric
    var currentTime = parseInt(playerTime)
    var currentIndex = this.data.currentIndex
    if (this.data.lyric[currentTime]) { 
      currentLyric = this.data.lyric[currentTime]

      if (currentLyric == '\r' || currentLyric.indexOf('QQ') != -1) {
        currentLyric = this.data.currentLyric
        currentTime = this.data.currentTime
      } else {
        currentIndex = this.data.lyricKeys.indexOf(currentTime.toString())
      }
    }
    if (currentLyric) {
      this.setData({
        currentLyric: currentLyric,
        currentTime: currentTime,
        currentIndex: currentIndex,
        currentTime: util.formatSecondTime(player.currentTime()),
        durationTime: util.formatSecondTime(player.duration())
      })
      if (currentIndex > 8 && currentIndex < this.data.lyricKeys.length - 8) {
        // wx.createSelectorQuery()
        // .select('#content-view')
        // .node()
        // .exec((res) => {
        //   const scrollView = res[0].node;
        //   scrollView.scrollEnabled = true
        //   scrollView.scrollTo({
        //     duration: 1.5,
        //     top: currentIndex * 54,
        //     animated: true
        //   })
        // })
        this.setData({
          scrollTop: currentIndex * 54
        })
      }
    } else {
      this.updateTime(currentTime - 1)
    }
  },

  onShareAppMessage:function() {
    return {
      title:'听周杰伦的歌：' + this.data.name,
      path:'pages/music/play/play?musicId='+this.data.musicId,
      imageUrl:this.data.cover
    }
  },

  onStartPlay(info) {
    this.loadMusic(info.music.objectId)
  },

  onTimeUpdate(info) {
    if (this.data.lyricKeys.length == 0) return
    this.updateTime(info.currentTime)
  }
})