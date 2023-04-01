const AV = require('../../../utils/av-core-min');
const { User } = require('../../../utils/av-core-min');
const { notifyAllPage } = require('../../../utils/notify.js')
const app = getApp()

Page({
  data: {
    avatar:'',
    name:''
  },

  onLoad: function (options) {
    var userInfo = app.globalData.userInfo;
    var avatar = userInfo.get('avatarUrl')
    if (userInfo == null || avatar == null || avatar.length == 0) {
      this.fetchAvatar()
    } 

    var nickname = userInfo.get('nickName')
    if (userInfo == null || nickname == null || nickname.length == 0) {
      this.fetchNickName()
    }

    this.setData({
      name: nickname || '',
      avatar: avatar || ''
    })
  },

  fetchAvatar:function() {
    var _this = this
    wx.request({
      url: 'https://faker.csrbobo.com/api/faker-avatar',
      method:"POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        wx.showToast({
          title: '已为您随机生成头像',
          icon:'none'
        })
        _this.setData({
          avatar:res.data.url
        })
      }
    })
  },

  fetchNickName:function() {
    var _this = this
    wx.request({
      url: 'https://faker.csrbobo.com/api/faker-name',
      method:"POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        wx.showToast({
          title: '已为您随机生成昵称',
          icon:'none'
        })
        _this.setData({
          name:res.data.name
        })
      }
    })
  },

  didClickSwitchAvatar:function() {
    this.fetchAvatar()
  },

  didClickSelectImage:function(e) {
    var that = this;
    wx.chooseImage({
      count:1,
      sizeType: ['compressed'],
      success: function(res) {
        var tempFilePath = res.tempFilePaths[0];
        wx.showToast({
          title: '上传中，请稍候',
          icon: 'loading'
        })
        that.uploadImage(tempFilePath);
      },
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
          avatar: file.url()
        })
      }
    )
  },

  didClickSwitchNickname:function() {
    this.fetchNickName()
  },

  bindNicknameChange:function(e) {
    this.setData({
      name:e.detail.value
    })
  },
 
  didClickSave:function() {
    var user = User.current();
    user.set('avatarUrl', this.data.avatar||'');
    user.set('nickName', this.data.name||'');
    user.save();
    app.globalData.userInfo = user
    notifyAllPage({name:'userUpdate',value:this.data.name});
    wx.navigateBack({
      delta:1
    })
  }
})