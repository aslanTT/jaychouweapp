Page({
  onLoad(options) {
    let url = decodeURIComponent(options.url)
    let appid = options.appid
    console.log("appid: "+ appid + " url:"+ url)
    if (!url || !appid) {
      wx.navigateBack({
        delta: 1,
      })
    } else {
      wx.showModal({
        content:"您即将打开第三方小程序",
        showCancel: false,
        confirmText: "打开",
        success:function(res) {
          if (res.confirm) {
            wx.navigateToMiniProgram({
              appId: appid,
              path: url,
              success:function(res) {
                console.error(res)
                wx.navigateBack({
                  delta: 1,
                })
              }
            })
          }
        }
      })
    }
  }
})