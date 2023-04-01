// pages/videoList/videoList.js
const {SCENE, requestSubscribeMessage} = require('../../../../subscribe')

Component({
  properties: {
    videoList: {
      type: Array,
      value: []
    },
    model: {
      type: Boolean,
      value: true
    }
  },

  data: {
    isShow: false,
    currentIndex: -1,
    cpWidth: 0,
    cpHeight: 0,
    showItem: {},
    picUrl: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 去视频详情
    goDetail: function (e) {
      var itemId = e.currentTarget.dataset.list.objectId
      this.triggerEvent('toDetail', itemId)
      requestSubscribeMessage(SCENE.MUSIC)
    },

    // 显示分享
    showSharemenu: function (e) {
      var index = e.currentTarget.dataset.index
      // console.log(index)
      var that = this
      that.setData({
        currentIndex: index
      })
    },
    // 取消分享
    cancelShare: function () {
      var that = this
      that.setData({
        currentIndex: -1
      })
    },
    /**
     * 以下是filter函数
     */
    // 处理时间
    formatInterval: function (interval) {
      var minute = this._pad(interval / 60 | 0)
      var second = this._pad(interval % 60)
      return minute + ":" + second
    },
    _pad: function (num, n = 2) {
      var len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
  
    // 处理换行问题
    noWrap: function (text,context,ImgHeight) {
      var chr = text.split(""); //这个方法是将一个字符串分割成字符串数组
      var temp = "";
      var row = [];
      context.setFontSize(14)
      for (var a = 0; a < chr.length; a++) {
        if (context.measureText(temp).width < this.data.cpWidth - 30) {
          temp += chr[a];
        } else {
          a--; //这里添加了a-- 是为了防止字符丢失，效果图中有对比
          row.push(temp);
          temp = "";
        }
      }
      row.push(temp);
      //如果数组长度大于2 则截取前两个
      if (row.length > 2) {
        var rowCut = row.slice(0, 2);
        var rowPart = rowCut[1];
        var test = "";
        var empty = [];
        for (var a = 0; a < rowPart.length; a++) {
          if (context.measureText(test).width < 220) {
            test += rowPart[a];
          } else {
            break;
          }
        }
        empty.push(test);
        var group = empty[0] + "..." //这里只显示两行，超出的用...表示
        rowCut.splice(1, 1, group);
        row = rowCut;
      }
      for (var b = 0; b < row.length; b++) {
        context.fillText(row[b], 10, ImgHeight + 80 + b * 20, this.data.cpWidth - 30);
      }
    }

  },
  onShareAppMessage: function () {
    console.log(222)
  }
})