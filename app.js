
const AV = require('./utils/av-core-min');
const { User } = require('./utils/av-core-min');
var res = wx.getSystemInfoSync();
if (res && res.AppPlatform == 'qq') {
  const qqAdapters = require('./utils/leancloud-adapters-qqapp.js');
  AV.setAdapters(qqAdapters);
} else {
  const adapters = require('./utils/leancloud-adapters-weapp.js');
  AV.setAdapters(adapters);
}
const config = require('./config.js');
const request = require('./network/request.js')
const notification = require("./utils/notificationCenter");
const playerManager = require("./player/playerManager")
const player = require("./player/player")

var hasRequestSettings = false

AV.init({
  appId: '',
  appKey: '',
  serverURLs: "",
});

App({

  request:request,

  onLaunch: function (options) {
    var res = wx.getSystemInfoSync();
    if (res && res.AppPlatform) {
      this.globalData.platform = res.AppPlatform;
    }

    if (options.scene == 1154) {
      this.globalData.simplifyMode = true
    }

    var _this = this;

    if (!this.globalData.simplifyMode) {
      AV.User.loginWithWeapp().then(user => {
        var user = User.current();
        _this.globalData.userInfo = user;
      }).catch(console.error);
    }

    wx.getSetting({
      withSubscriptions: true,
      success (res) {
        if (res.subscriptionsSetting) {
          if (res.subscriptionsSetting.mainSwitch) {
            var user = User.current(); 
            if (user != null) {
              user.set('subscribe', 10000)
              user.save()
            }
          }
        }
      }
    })

    wx.getSystemInfo({
      success: function (res) {
        if (res.model.indexOf('iPhone X') != -1) {
          _this.globalData.isIpx = true;
        }
        if (res.model.indexOf('iPhone 11 Pro') != -1) {
          _this.globalData.isIpx = true;
        }
        if (res.model.indexOf('iPhone 12') != -1) {
          _this.globalData.isIpx = true;
        }
        if (res.model.indexOf('iPhone 13') != -1) {
          _this.globalData.isIpx = true;
        }
        if (res.model.indexOf("MI 8") != -1) {
          _this.globalData.isIpx = true;
        }

        const menu = wx.getMenuButtonBoundingClientRect()
        _this.globalData.boxHeight = menu.height
        _this.globalData.titleBarHeight = menu.height + 12
        _this.globalData.statusBarHeight = res.statusBarHeight
        _this.globalData.windowHeight = res.windowHeight
        _this.globalData.windowWidth = res.windowWidth
        _this.globalData.tabBarHeight = res.safeArea.top
      }
    })
  },

  onShow() {
    if (!hasRequestSettings) {
      var _this = this;
      request('setting', {}).then(res=>{
        hasRequestSettings = true
        _this.globalData.setting = res
        notification.postNotificationName('refreshSetting', {});
      })
    }
  },

  globalData: {
    platform: 'wechat',
    userInfo: null,
    version: config.version,
    isIpx: false,
    setting:{
      'chatEnable': false,
      'playEnable': false,
      'userPlayEnable': true,
      'sharePic':'https://pubfile.baowenlaile.cn/i6RhRArGHGIjjQuqev30Q6RTlNo4po9W/share.jpg',
      'coverPic':''
    },
  },
})