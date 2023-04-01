const player = require("./player");
const request =  require('../network/request');

var app;
var _ = {};
var playerManager = {};

playerManager.init = function() {
  player.addObserver(this)
  var _this = this
  setTimeout(function () {     
    _this.fetchMusicList(true, function(){})
  }, 1 * 0.5 * 1000);
  var playMode = wx.getStorageSync('play-mode') || 0
  this._.info.properties.mode = playMode
}

playerManager.addObserver = function(observer) {
  if (!observer) return;
  var observers = this._.info.properties.observers;
  if (observers.indexOf(observer) != -1) return;
  observers.push(observer);
}

playerManager.removeObserver = function(observer) {
  if (!observer) return;
  var index = this._.info.properties.observers.indexOf(observer);
  if (index != -1) {
    this._.info.properties.observers.splice(index, 1);
  }
}

playerManager.mode = function() {
  var currentMode = this._.info.properties.mode;
  return playMode(currentMode)
}

playerManager.switchMode = function() {
  var currentMode = this._.info.properties.mode;
  currentMode = currentMode + 1;
  if (currentMode == 3) {
    currentMode = 0;
  }
  this._.info.properties.mode = currentMode
  wx.setStorage({
    key: 'play-mode',
    data: currentMode
  })
  return playMode(currentMode)
}

function playMode(mode) {
  return {
    'icon': playModeIcon(mode),
    'title': playModeTitle(mode)
  }
}

function playModeIcon(mode) {
  return {
    0: "/image/list-play.png",
    1: "/image/one-play.png",
    2: "/image/random-play.png" 
  }[mode]
}

function playModeTitle(mode) {
  return {
    0: "顺序播放",
    1: "单曲循环",
    2: "随机播放" 
  }[mode]
}

playerManager.currentIndex = function() {
  return this._.info.properties.currentIndex
}

playerManager.setCurrentIndex = function(index) {
  this._.info.properties.currentIndex = index
}

playerManager.playList = function() {
  return this._.info.properties.playList;
}

playerManager.updateList = function(music) {
  var mList = this._.info.properties.playList

  var times = 1;
  for (var index = 0; index < mList.length; index ++) {
    var m = mList[index].music
    if (music.objectId == m.objectId) {
      mList.splice(index, 1)
      times ++
      break
    }
  }
  var mMap = {
    music: music,
    times: times
  }
  mList.splice(0, 0, mMap)
  this._.info.properties.playList = mList
  this._.info.notify('updatePlayList', {'list': mList});  
  this._.info.properties.currentIndex = 0        
},

playerManager.hasMore = function() {
  return this._.info.properties.hasMore
}

playerManager.loadMorePlayList = function(callback) {
  this.fetchMusicList(false, function() {
    callback()
  })
}

playerManager.next = function() {
  this.onNext()
}

playerManager.prev = function() {
  this.onPrev()
}

playerManager.onStartPlay = function(info) {
  var music = info.music
  var musicId = music.objectId
  request('music-listen', {
    'musicId': musicId
  })
}

playerManager.onEnded = function() {
  this.onNext()
},

playerManager.onNext = function() {
  var mode = this._.info.properties.mode
  if (mode == 0) {
    // 顺序播放
    playerManager.listPlay(true)
  } else if (mode == 1) {
    // 单曲循环
    player.startPlay(player.music())
  } else {
    // 随机播放
    playerManager.randomPlay()
  }
}

playerManager.listPlay = function(isNext) {
  var index = this._.info.properties.currentIndex
  var list = this._.info.properties.playList
  if (isNext) {
    if (index + 1 < list.length) {
      index = index + 1
    } else {
      index = 0
    }
  } else {
    if (index - 1 >= 0) {
      index = index - 1
    } else {
      index = list.length - 1
    }
  }
  this.setCurrentIndex(index)
  var music = list[index].music
  player.startPlay(music)
}

playerManager.randomPlay = function() {
  var index = this._.info.properties.currentIndex
  var list = this._.info.properties.playList
  wx.showToast({
    title: '随机为您播放一曲',
    icon: 'none'
  })
  var _this = this
  this.fetchNextMusic(function (music) {
    index = 0
    _this.setCurrentIndex(index)
    list.push({
      'music': music,
      'times': 1
    })
    _this._.info.properties.playList = list
    _this._.info.notify('updatePlayList', {'list': list});          
    player.startPlay(music)
    playerManager.updateList(music)
  })
}

playerManager.onPrev = function() {
  var mode = this._.info.properties.mode
  if (mode == 0) {
    // 顺序播放
    playerManager.listPlay(false)
  } else if (mode == 1) {
    // 单曲循环
    player.startPlay(player.music())
  } else {
    // 随机播放
    playerManager.randomPlay()
  }
} 

playerManager.fetchNextMusic = function(callback) {
  request('random-one-music', {
    'currentMusicId': player.music().objectId ?? ''
  }).then(music=>{
    callback(music)
  })
}

playerManager.fetchMusicList = function(isRefresh=true, callback) {
  var playList = this._.info.properties.playList
  var _this = this
  request('listen-list', {
    'total': isRefresh ? 0 : playList.length
  }).then(res=>{
    var list = playList
    if (isRefresh) {
      list = res.list;
    } else {
      list = list.concat(res.list);
    }
    _this._.info.properties.hasMore = res.hasMore
    _this._.info.properties.playList = list
    if (callback && typeof callback == 'function') {
      callback()
    }
    this._.info.notify('updatePlayList', {'list': list});  
  });
}

_.info = {
  properties: {
    playList:[],
    observers:[],
    hasMore: true,
    currentIndex: 0,
    mode: 0 // 0: 顺序播放, 1: 单曲循环, 2: 随机播放
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
  playerManager.init();
}

playerManager._ = _;

module.exports = playerManager;