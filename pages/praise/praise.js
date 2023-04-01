const app = getApp()

Page({
  data: {
    prices: [
      0.6, 0.8, 1.8, 6.6, 8.8, 18.8
    ],
  },

  didClickPrice: function (event) {
    wx.showLoading({
      title: '赞赏中...',
    })
    var total_fee = event.currentTarget.dataset.item;
    this.setData({
      selected: event.currentTarget.dataset.item
    });
    app.request('order', {
      'totalFee': total_fee
    }).then(result => {
      wx.hideLoading()
      var payload = result.payload;
      payload.success = () => {
        wx.showToast({
          title: '感谢支持',
          icon: 'success',
          duration: 1500,
        });
      }
      payload.fail = ({ errMsg }) => {
      }
      wx.requestPayment(payload);
    });
  }
})