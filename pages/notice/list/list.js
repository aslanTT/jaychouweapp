const app = getApp()
const {SCENE, requestSubscribeMessage} = require('../../../subscribe')

Page({

  data: {
    loading:true,
    list:[],
    hasMore:false
  },

  onShow:function() {
    this.fetchNoticeList();
  },

  fetchNoticeList(isRefresh=true) {
    var total = 0;
    if (!isRefresh) {
      total = this.data.list.length;
    }
    var _this = this
    app.request('notice-list', {
      total:total
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
        loading:false
      })
    })
  },

  didTapNoticeCell:function(e) {
    requestSubscribeMessage(SCENE.SUBJECT)
    var index = e.currentTarget.dataset.index;
    var notice = this.data.list[index]
    var subjectId = ''
    if (notice.subject) {
      subjectId = notice.subject.objectId
    } else if (notice.reply) {
      subjectId = notice.reply.subject.get('objectId')
    }

    if (subjectId.length > 0) {
      wx.navigateTo({
        url: '/pages/subject/detail/detail?subjectId='+subjectId+'&noticeId='+notice.objectId
      })
    } else {
      var userId = notice.fromuser.objectId
      wx.navigateTo({
        url: '/pages/message/message?userId='+userId+'&noticeId='+notice.objectId
      })
    }
  }
})