
const app = getApp()
const {SCENE, requestSubscribeMessage} = require('../../../subscribe')

Page({
  data: {
    loading:true,
    filters:[
      '最新',
      '推荐',
      '热度'
    ],
    select:0,
    list:[],
    title: "同感同在。",
    hasMore:false,
    noticeCount: 0,
    adaptQQ:false,
    restMode: false,
    banner: {},
    activity:{},
    triggered: false,
    menuTop: 0,
    hasPopBanner: false
  },

  onLoad: function (options) {
    this.fetchSubjectList();

    let titleBarHeight = app.globalData.titleBarHeight
    let statusBarHeight = app.globalData.statusBarHeight
    let windowHeight = app.globalData.windowHeight
    let tabBarHeight = app.globalData.tabBarHeight
    let containerHeight = windowHeight - 50 - tabBarHeight
    this.setData({
      adaptQQ: app.globalData.platform=='qq',
      titleBarHeight: titleBarHeight,
      statusBarHeight: statusBarHeight,
      topBarHeight: titleBarHeight+statusBarHeight,
      tabBarHeight: tabBarHeight,
      containerHeight: containerHeight
    })
    this.bannerRefresh()
  },

  bannerRefresh:function() {
    this.setData({
      'banner': app.globalData.setting.banner,
      'activity': app.globalData.setting.activity.home
    })
    // this.popBanner()
  },

  popBanner: function() {
    if (this.data.hasPopBanner) {
      return
    }
    // 在页面中定义插屏广告
    let interstitialAd = null

    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: this.data.banner['home-pop-banner']
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
    }

    var _this = this
    setTimeout(function () {     
      if (interstitialAd) {
        interstitialAd.show().catch((err) => {
          console.error(err)
        })
        _this.setData({
          hasPopBanner: true
        })
      }
    }, 1 * 8 * 1000);
  },

  didClickActivity:function() {
    if (this.data.activity.type == 'miniprogram') {
      wx.navigateToMiniProgram({
        appId: this.data.activity.appid,
        path: this.data.activity.skipUrl
      })
    } else if (this.data.activity.type == 'web') {
      wx.navigateTo({
        url: '/pages/web/web?url='+this.data.activity.skipUrl
      })
    }
  },

  onShow:function() {
    this.fetchSubjectTitle();
    this.fetchNoticeCount();
  },

  fetchSubjectTitle:function() {
    var _this = this
    app.request('subject-title', {}).then(res=>{
      if (res.title) {
        _this.setData({
          'title': res.title
        })
      }
    })
  },

  fetchSubjectList:function(isRefresh=true) {
    if (this._freshing) return
    this._freshing = true
    var total = 0;
    if (!isRefresh) {
      total = this.data.list.length;
    }
    var _this = this
    app.request('subject-list', {
      total:total,
      strategy: this.data.select
    }).then(res=>{
      wx.hideLoading()
      wx.stopPullDownRefresh()
      var list = _this.data.list;
      if (isRefresh) {
        list = res.list;
      } else {
        list = list.concat(res.list)
      }
      _this.setData({
        list:list,
        hasMore:res.hasMore,
        loading:false,
        triggered:false
      })
      this._freshing = false
    }).catch(e=>{
      this._freshing = false
      if (e.code == 140) {
        _this.setData({
          restMode: true,
          loading: false
        })
      }
    });
  },

  didClickFilter:function(e) {
    var index = e.currentTarget.dataset.index;
    if (this.data.select == index) return
    this.setData({
      select: index,
      loading:true
    })
    this.fetchSubjectList(true)
  },

  fetchNoticeCount:function() {
    var _this = this
    app.request('notice-count', {}).then(res=>{
      let menuButton = wx.getMenuButtonBoundingClientRect() 
      _this.setData({
        noticeCount: res,
        menuLeft: menuButton.width+18,
        menuTop: menuButton.top+menuButton.height/2-20
      })
    })
  },

  didTapSubjectCell:function(e) {
    var target = e.target;
    if (target.id === 'user' || target.id === 'share') return;
    requestSubscribeMessage(SCENE.SUBJECT)
    var subjectId = e.currentTarget.dataset.subjectId;
    wx.navigateTo({
      url: '/pages/subject/detail/detail?subjectId='+subjectId
    })
  },

  didClickNotice:function() {
    requestSubscribeMessage(SCENE.SUBJECT)
    wx.navigateTo({
      url: '/pages/notice/list/list',
    })
  },

  didClickHeadTitle:function() {
    requestSubscribeMessage(SCENE.SUBJECT)
    wx.navigateTo({
      url: '/pages/notice/list/list',
    })
  },
 
  didClickPublish:function() {
    requestSubscribeMessage(SCENE.SUBJECT)
    wx.navigateTo({
      url: '/pages/subject/publish/publish',
    })
  },

  updateSubjectList:function() {
    this.fetchSubjectList(true);
  },

  onPullDownRefresh: function () {
    this.fetchSubjectList(true)
  },

  onReachBottom: function () {
    if (this.data.hasMore) {
      this.fetchSubjectList(false)
    }
  },

  onShareAppMessage: function () {
    return {
      title:'杰伦粉丝圈，一起来聊杰伦',
      path:'pages/subject/list/list',
      'imageUrl':app.globalData.setting.sharePic
    }
  }
})