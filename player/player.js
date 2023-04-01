var app;
var _ = {};
var player = {};

player.init = function() {

};

player.addObserver = function(observer) {
  if (!observer) return;
  var observers = this._.info.properties.observers;
  if (observers.indexOf(observer) != -1) return;
  observers.push(observer);
}

player.removeObserver = function(observer) {
  if (!observer) return;
  var index = this._.info.properties.observers.indexOf(observer);
  if (index != -1) {
    this._.info.properties.observers.splice(index, 1);
  }
}

player.startPlay = function(music) {
  if (!music || !music.url || music.url.length == 0) return;
  var currentMusic = this._.info.properties.music
  if (currentMusic && music.objectId == currentMusic.objectId && player.playing()) {
    this._.info.notify('onStartPlay', {'music': music, 'new': false});
    return
  } 
  console.log("[play] ready play")
  player.readyPlay(music)
}

player.readyPlay = function(music) {
  this._.info.properties.music = music;
  var bgAudioManager = this._.info.properties.bgAudioManager;
  if (bgAudioManager == null) {
    bgAudioManager = wx.getBackgroundAudioManager(); 
    this._.info.properties.bgAudioManager = bgAudioManager;
  } 

  bgAudioManager.title = music.name;  
  bgAudioManager.epname = music.album.name;
  bgAudioManager.src = music.url; 
  bgAudioManager.coverImgUrl = music.album.covers[0];
  bgAudioManager.singer = music.singer.name;

  this._.info.notify('onStartPlay', {'music': music, 'new': true});

  bgAudioManager.onPlay(res => {   
    this._.info.properties.playing = true;    
    console.log("[play] on play")                 
    this._.info.notify('onPlay', {'duration':bgAudioManager.duration});
  });

  bgAudioManager.onPause(() => {
    this._.info.properties.playing = false;
    console.log("[play] on pause")                 
    this._.info.notify('onPause', {});
  });

  bgAudioManager.onStop(()=>{
    this._.info.properties.bgAudioManager = null;
    this._.info.properties.playing = false;
    this._.info.notify('onStop', {});          
    console.log("[play] on stop")
  })

  bgAudioManager.onNext(() => {
    this._.info.notify('onNext', {});
  });

  bgAudioManager.onPrev(()=>{
    this._.info.notify('onPrev', {});
  });

  bgAudioManager.onEnded(() => {  
    this._.info.properties.bgAudioManager = null;
    this._.info.properties.playing = false; 
    console.log("[play] end") 
    this._.info.notify('onEnded', {});          
  });

  bgAudioManager.onError((res) => {  
    console.error("[play] "+res) 
  });

  bgAudioManager.onTimeUpdate(() => {
    this._.info.notify('onTimeUpdate', {
      'currentTime': bgAudioManager.currentTime,
      'duration': bgAudioManager.duration
    })
  })
  if (!app.globalData.setting.userPlayEnable) {
    bgAudioManager.stop()
    wx.showModal({
      title: '',
      content: '因版权问题，小程序上不支持播放',
      showCancel: false,
      complete: (res) => {}
    })
    return
  } 
}

player.music = function() {
  return this._.info.properties.music;
}

player.playing = function () {
  return this._.info.properties.playing;
}

player.currentTime = function() {
  var manager = this._.info.properties.bgAudioManager
  if (manager == null) {
    return 0
  }
  return manager.currentTime;
}

player.duration = function() { 
  var manager = this._.info.properties.bgAudioManager
  if (manager == null) {
    return 0
  }
  return manager.duration;
}

player.play = function() {
  this._.info.properties.playing = true;
  if (this._.info.properties.bgAudioManager != null) {
    if (!app.globalData.setting.userPlayEnable) {
      bgAudioManager.stop()
      wx.showModal({
        title: '',
        content: '因版权问题，小程序上不支持播放',
        showCancel: false,
        complete: (res) => {}
      })
      return
    }  
    this._.info.properties.bgAudioManager.play()
  } else {
    let music = this._.info.properties.music;
    player.startPlay(music)
  }
  console.log("[play] click play")  
}

player.pause = function() {
  this._.info.properties.playing = false;
  this._.info.properties.bgAudioManager.pause()
}

player.seek = function(duration) {
  this._.info.properties.bgAudioManager.seek(duration)
}

_.info = {
  properties: {
    observers:[],
    playing:false,
    music:null,
    bgAudioManager:null
  },

  notify:function(callback, params) {
    var observers = this.properties.observers;
    observers.forEach(observer=>{
      if (observer[callback]) {
        observer[callback](params);
      }
    });
  }
};

function e(t, n, o) {
  if (t[n]) {
    var e = t[n];
    t[n] = function (t) {
      o.call(this, t, n);
      e.call(this, t);
    };
  } else {
    t[n] = function (t) {
      o.call(this, t, n);
    };
  }
}

var p = App;
App = function (t) {
  e(t, 'onLaunch', appLaunch);
  p(t);
};

function appLaunch(options) {
  app = this;
  player.init();
}

player._ = _;

module.exports = player;