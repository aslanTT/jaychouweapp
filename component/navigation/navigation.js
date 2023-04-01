const app = getApp();
Component({
  properties: {
    //小程序页面的表头
    title: {
      type: String,
      default: '周杰伦粉丝圈'
    },
    //是否展示返回和主页按钮
    showIcon: {
      type: Boolean,
      default: true
    },
		//是否显示标题
		showTitle: {
		  type: Boolean,
		  default: true
		},
		//是否显示搜索框
		showSearch: {
		  type: Boolean,
		  default: true
    },
    placeholder: {
      type: String,
      default: '搜索你感兴趣的内容'
    },
    backgroundColor:{
      type:String,
      default:'#f0f0f0'
    }
  },

  data: {
    statusBarHeight: 0,
    titleBarHeight: 0,
    boxHeight: 0
  },

  ready: function () {
    // 因为很多地方都需要用到，所有保存到全局对象中
    if (app.globalData && app.globalData.statusBarHeight && app.globalData.titleBarHeight) {
      this.setData({
        statusBarHeight: app.globalData.statusBarHeight,
        titleBarHeight: app.globalData.titleBarHeight,
        boxHeight: app.globalData.boxHeight,
        backgroundColor: this.data.backgroundColor?this.data.backgroundColor:'#ffffff'
      });
    } else {
      console.error('should set style in app.js')
    }
  },

  methods: {
    headerBack() {
      wx.navigateBack({
        delta: 1,
        fail(e) {
          wx.switchTab({
            url: '/pages/music/list/list'
          })
        }
      })
    },
    headerHome() {
      wx.switchTab({
        url: '/pages/music/list/list'
      })
    },
		headerSearch(){
      this.triggerEvent("tapSearch", {}, {})
		}
  }
})
