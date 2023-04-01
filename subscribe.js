const { User } = require('./utils/av-core-min');
const util = require('./utils/util.js')

const SCENE = {
  MUSIC:1,
  ESSAY:2,
  SUBJECT:3,
  CHAT:4
}

const TEMPIDS = {
  MUSIC_RECOMMEND: 'I9W12zP_xR8SAuzTutZ5OXZtmkMOdwn4TvACjvmTy04',
  REPLY_COMMEND: 'ctf0GYZIWPOacMVHB8GPqdxpUalVj68gSSr7TkjGHg4',
  CHAT: 'S0_EA4KcfgycWDqrVi614zqCaUIqiHOnYdIMmCcsi1E',
  ESSAY: 'XvlUp8gav7b4FwFR6aQ-5yt_iWEifrtqx5y7FXrADkQ',
  SUBJECT: 'yEnyOpVyKubAqcSi1FBzbHVDB1wW5b8SH2M0MdT-nXo',
  REPLY_SUBJECT: 'l4z9zTO89lW_6BaywsNK5tJDMZPMul-uKOw-geiAnZo'
}

const CONFIG = {
  // MUSIC
  1:[
    TEMPIDS.MUSIC_RECOMMEND,
    TEMPIDS.REPLY_COMMEND,
    TEMPIDS.CHAT
  ],
  // ESSAY
  2:[
    TEMPIDS.ESSAY,
    TEMPIDS.MUSIC_RECOMMEND,
    TEMPIDS.CHAT
  ],
  // SUBJECT
  3:[
    TEMPIDS.SUBJECT,
    TEMPIDS.REPLY_SUBJECT,
    TEMPIDS.CHAT
  ],
  4: [
    TEMPIDS.CHAT
  ]
}

function requestSubscribeMessage(scene, force=false, callback=null) {
  // scene
  // music, essay, subject
  var tempIds = sceneToMsgId(scene)

  var date = util.formatDate(new Date())
  var hasSubscribe = wx.getStorageSync('subscribe')[date]

  wx.requestSubscribeMessage({
    tmplIds: tempIds,
    success:function(res) {
      var user = User.current();
      if (user != null) {
        user.increment('subscribe', 1)
        user.save()    
        console.log(res) 
      }
    },
    complete:function(res) {
      if (callback != null && typeof(callback) === 'function') {
        callback()
      } 
      console.log(res)
    }
  })

  var map = {}
  map[date] = '1'
  wx.setStorage({
    key:"subscribe",
    data:map
  })
}

function sceneToMsgId(scene) {
  return CONFIG[scene]
}

module.exports = {
  requestSubscribeMessage,
  SCENE
}