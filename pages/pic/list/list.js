let col1H = 0;
let col2H = 0;
const app = getApp()

Page({

  data: {
    scrollH: 0,
    imgWidth: 0,
    loadingCount: 0,
    images: [],
    col1: [],
    col2: [],
    pageNum: 0
  },

  onLoad(options) {
    wx.getSystemInfo({
      success: (res) => {
        let ww = res.windowWidth;
        let wh = res.windowHeight;
        let imgWidth = ww * 0.48;
        let scrollH = wh;

        this.setData({
          scrollH: scrollH,
          imgWidth: imgWidth
        });

        this.fetchPicList(true)
      }
    })
  },

  onImageLoad: function(e) {
    let imageId = e.currentTarget.id;
    let oImgW = e.detail.width; //图片原始宽度
    let oImgH = e.detail.height; //图片原始高度
    let imgWidth = this.data.imgWidth; //图片设置的宽度
    let scale = imgWidth / oImgW; //比例计算
    let imgHeight = oImgH * scale; //自适应高度

    let images = this.data.images;
    let imageObj = null;

    for (let i = 0; i < images.length; i++) {
      let img = images[i];
      if (img.id === imageId) {
        imageObj = img;
        break;
      }
    }

    imageObj.height = imgHeight;

    let loadingCount = this.data.loadingCount - 1;
    let col1 = this.data.col1;
    let col2 = this.data.col2;

    if (col1H <= col2H) {
      col1H += imgHeight;
      col1.push(imageObj);
    } else {
      col2H += imgHeight;
      col2.push(imageObj);
    }

    let data = {
      loadingCount: loadingCount,
      col1: col1,
      col2: col2
    };

    if (!loadingCount) {
      data.images = [];
    }

    this.setData(data);
  },

  loadImages: function() {
    let baseId = "img-" + (+new Date());

    for (let i = 0; i < this.data.images.length; i++) {
      this.data.images[i].id = baseId + "-" + i;
    }

    this.setData({
      loadingCount: this.data.images.length,
      images: this.data.images
    });
  },

  fetchPicList:function(isRefresh=true) {
    var total = 0;
    if (!isRefresh) {
      this.data.pageNum += 1;
    } else {
      this.data.pageNum -= 1;
      if (this.data.pageNum < 0) {
        this.data.pageNum = 0;
      }
    }
    total = 20 * this.data.pageNum;
    var _this = this
    app.request('pic-list', {
      total:total
    }).then(res=>{
      wx.hideLoading()
      wx.stopPullDownRefresh()
      var temp = []
      res.list.forEach(item=>{
        temp.push({
          pic: item.cover,
          height: 0
        })
      })
      _this.data.images = temp
      _this.data.hasMore = res.hasMore
      _this.data.loading = false
      _this.loadImages()
    }).catch(e=>{
    })
  },

  onPullDownRefresh:function() {
    this.fetchPicList(true)
  },

  onReachBottom:function() {
    if (this.data.hasMore) {
      this.fetchPicList(false)
    }
  },

  didClickPreview:function(e) {
    let pic = e.currentTarget.dataset.pic
    wx.previewImage({
      urls: [pic],
    })
  },
 
  onShareAppMessage() {
    return {
      title:'最帅周杰伦，为杰伦打call',
      path:'pages/pic/list/list',
      imageUrl: this.data.col2[0].pic
    }
  }
})