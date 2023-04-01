const app = getApp()
const util = require('../../../utils/util.js')
const request = require('../../../network/request.js');

Page({

  data: {
    musicId: "",
    lyricValues: [],
    loading: true,
    currentTab:0,
    selectLyrics:[],
    bgPics:[],
    profile:{'lyrics':'', 'name':'', 'singer':''},
    selectBg: '',
    selectPicTab:0
  },

  onLoad(options) {
    if (options.musicId) {
      this.loadMusic(options.musicId)
    }
  },

  loadMusic:function(musicId) {
    this.data.musicId = musicId
    var _this = this
    request('music-lyric', {
      musicId: musicId
    }).then(res=>{
      var profile = _this.data.profile
      profile['name'] = res.name
      profile['singer'] = '周杰伦'
      _this.data.profile = profile
      _this.loadBgPicList()
      var lyric = util.reconvert(res.lyric)
      lyric = util.parseLyric(lyric)
      _this.setData({
        lyricValues: Object.values(lyric),
        name: res.name,
      })
    })
  },

  loadBgPicList:function() {
    var _this = this
    request('postcard-bg-list', {}).then(res=>{
      if (res.length > 0) {
        var firstItem = res[0].picList[0]
        var profile = _this.data.profile
        profile['picUrl'] = firstItem.bigImg
        _this.setData({
          bgPics: res,
          selectBg: firstItem.bigImg,
          profile: profile,
          loading: false
        })
      }
    });
  },

  didSelectLyric:function(e) {
    var index = e.currentTarget.dataset.index
    var hasFound = this.data.selectLyrics.indexOf(index)
    if (hasFound != -1) {
      this.data.selectLyrics.splice(hasFound, 1)
    } else {
      if (this.data.selectLyrics.length > 5) {
        wx.showModal({
          showCancel: false,
          content:"所选歌词不能超过六句",
          confirmColor:'#B64A48'
        })
        return
      } 
      this.data.selectLyrics.push(index)
    }
    let selectLyrics = this.data.selectLyrics
    var lyrics = ''
    selectLyrics.map(index=>{
      let text = this.data.lyricValues[index]
      lyrics += text;
      lyrics += '\n';
    })
    var profile = this.data.profile
    profile['lyrics'] = lyrics
    profile['lines'] = selectLyrics.length
    this.setData({
      selectLyrics: selectLyrics,
      profile: profile
    })
  },

  didClickTab:function(e) {
    var tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
  },

  didSelectPicTab:function(e) {
    var tab = e.currentTarget.dataset.index
    this.setData({
      selectPicTab: tab
    })
  },

  didSelectPic:function(e) {
    var pic = e.currentTarget.dataset.pic
    var profile = this.data.profile
    profile['picUrl'] = pic
    this.setData({
      selectBg: pic,
      profile: profile
    })
  },

  shareImagePath:function(e) {
    this.data.imagePath = e.detail.imagePath;
  },

  didClickSave:function() {
    this.saveImage(this.data.imagePath)
  },

  saveImage(path) {
    var _this = this;
    wx.saveImageToPhotosAlbum({
      filePath:path,
      success(res){
        wx.showModal({
          content: '保存成功，从相册选择图片分享',
          title: '',
          showCancel:false,
          confirmColor:'#008000'
        })
        _this.onDismiss();
      },
      fail(res) {
        wx.showModal({
          title: '保存失败，请重试',
          showCancel: false,
          confirmColor: '#008000'
        })
      }
    });
  },

  onShareAppMessage() {
    return {
      'title': '精美歌词海报制作，你也来试试吧',
      'path': 'pages/music/postcard/postcard?musicId=' + (this.data.musicId),
      'imageUrl': this.data.profile['picUrl']
    }
  }
})