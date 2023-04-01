const app = getApp()
Page({

  data: {
    desc:"大家好～",
    adList:[]
  },

  onLoad(options) {
    var _this = this
    app.request('ad-list', {}).then(res=>{
      _this.setData({
        desc: res.desc,
        adList: res.adList
      })
      _this.triggerPopBanner()
    })
  },

  triggerPopBanner() {
    if (this.data.adList.length == 0) {
      return
    }
    var adUnitId = ''
    for (var index = 0; index < this.data.adList.length; index ++) {
      let item = this.data.adList[index]
      if (item.type == "pop") {
        adUnitId = item["ad-id"]
      }
    }
    if (adUnitId.length == 0) {
      return
    }
    let InterstitialAd = wx.createInterstitialAd({
      adUnitId: adUnitId
    });
    if (InterstitialAd && InterstitialAd.load()) {
      InterstitialAd.load().catch((err) => {
        console.error('load',err)
      })   
      setTimeout(function () {     
        InterstitialAd.show().catch((err) => {
          console.error('show',err)
        }) 
      }, 1 * 3 * 1000);
    }
  }
})