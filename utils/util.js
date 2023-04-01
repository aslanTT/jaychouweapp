const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('/')
}

function formatSecondTime(second) {
  var min = ~~(second / 60)
  var sec = parseInt(second - min * 60)
  return min + ':' + ('00' + sec).substr(-2)
}

function reconvert(str) {
  str = str.replace(/(\\u)(\w{1,4})/gi, function ($0) {
    return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g, "$2")), 16)));
  });
  str = str.replace(/(&#x)(\w{1,4});/gi, function ($0) {
    return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
  });
  str = str.replace(/(&#)(\d{1,6});/gi, function ($0) {
    return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g, "$2")));
  });
  return str;
}

function parseLyric(lrc) {
  var lyrics = lrc.split("\n");
  var lrcObj = {};
  for (var i = 0; i < lyrics.length; i++) {
    var lyric = decodeURIComponent(lyrics[i]);
    var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
    var timeRegExpArr = lyric.match(timeReg);
    if (!timeRegExpArr)
      continue;
    var clause = lyric.replace(timeReg, '');
    var str = clause.replace(/\s+/g,"").trim();
    if (str.length == 0 || str == "\r" || str == "\n") {
      continue
    }
    if (clause.length > 0) {
      for (var k = 0, h = timeRegExpArr.length; k < h; k++) {
        var t = timeRegExpArr[k];
        var min = Number(String(t.match(/\[\d*/i)).slice(1)),
          sec = Number(String(t.match(/\:\d*/i)).slice(1));
        var time = min * 60 + sec;
        lrcObj[time] = clause;
      }
    }
  }
  return lrcObj;
}

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  formatSecondTime: formatSecondTime,
  reconvert: reconvert,
  parseLyric: parseLyric
}
