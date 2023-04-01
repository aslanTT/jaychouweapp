const {User} = require('../../../utils/av-core-min');
const AV = require('../../../utils/av-core-min');
const notification = require("../../../utils/notificationCenter.js");
const app = getApp()
const request = require('../../../network/request.js')
const env = require('../../../network/env')
const {SCENE, requestSubscribeMessage} = require('../../../subscribe');
const { music } = require('../../../player/player');

Page({
  data: {
    loading:true,
    restMode:false,
    essayList:[],
    hasMore: false,
    animation: '',
    shareEssay:{},
    adaptQQ:false,
    restMode: false,
    myselfId: '',

    relateEssayId:''
  },

  onLoad: function () {
    this.setData({
      adaptQQ:app.globalData.platform=='qq',
      myselfId: env.simplifyMode() ? '' : User.current().id
    });
    this.fetchList()
    this.bannerRefresh()
    notification.addNotification("refreshMineList", this.fetchList, this)
  },

  bannerRefresh:function() {
    this.setData({
      'banner': app.globalData.setting.banner,
      'activity': app.globalData.setting.activity.home
    })
  },

  headerSearch:function() {
    wx.navigateTo({
      url: '/pages/essay/search/search',
    })
  },

  fetchList: function (refresh) {
    var _this = this;
    request('essayList', {
      total: refresh ? 0 : _this.data.essayList.length
    }).then(function (result) {
      wx.stopPullDownRefresh()
      var list = _this.data.essayList;
      if (refresh) {
        list = result.list;
      } else {
        list = list.concat(result.list);
      }
      _this.setData({
        essayList: list,
        hasMore: result.hasMore,
        loading: false
      });
    }).catch(e => {
      wx.stopPullDownRefresh()
      console.log(e);
      if (e.code == 140) {
        _this.setData({
          restMode: true,
          loading: false
        })
      }
    });
  },

  didTapCell:function(e) {
    if (e.target.id === "relate") {
      return;
    }
    var essay = e.currentTarget.dataset.essay;
    // wx.navigateTo({
    //   url: '../detail/detail?essayId='+essay.objectId
    // })
    wx.navigateTo({
      url: '../web/web?essayId='+essay.objectId
    })
    requestSubscribeMessage(SCENE.ESSAY);
  },

  didSelectMusic:function(value) {
    var musicId = value
    if (this.data.relateEssayId.length > 0 && musicId) {
      request('relate-music', {
        'essayId': this.data.relateEssayId,
        'musicId': musicId
      })
    }
    this.setData({
      relateEssayId:''
    })
  },

  didClickRelateButton:function(e) {
    var essayId = e.currentTarget.dataset.essayId;
    this.setData({
      'relateEssayId': essayId
    })
    wx.navigateTo({
      url: '/pages/music/songs/songs?selectMode=true',
    })
  },

  onPullDownRefresh:function() {
    this.fetchList(true)
  },

  onReachBottom:function() {
    this.onPullRefreshMore();
  },

  onPullRefreshMore: function () {
    if (this.data.hasMore) {
      this.fetchList(false);
    }
  },

  didClickAddEssay:function() {
    wx.navigateTo({
      url: '/pages/essay/publish/publish',
    })
  },

  onShareAppMessage: function () {
    return {
      'title': '围观周杰伦最新动态',
      'path': 'pages/essay/list/list',
      'imageUrl':app.globalData.setting.sharePic
    }
  }
})
