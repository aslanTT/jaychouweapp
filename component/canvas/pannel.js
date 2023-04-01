import Template from './template.js';

Component({
  properties: {
    profile:{
      type:Object,
      value:{},
      observer: function (newVal, oldVal, changedPath) {
        this.profileChanged(newVal, oldVal)
      }
    },
    template:{
      type:Object,
      value:{}
    }
  },

  data: {
    imagePath:''
  },

  methods: {

    preventMove:function() {
      // do nothing, just catch move
    },

    onDismiss:function(e) {
      this.setData({
        template: {},
        showBigPainter: false
      });
      wx.hideLoading()
      this.triggerEvent('dismissCallback', {});
    },

    profileChanged(newVal, oldVal) {
      var painter = null;
      painter = new Template();
      if (newVal) {
        this.setData({
          template: painter.palette(newVal)
          // bigTemplate: painter.paletteBigImage(newVal)
        });
      }
    },

    onImgOK(e) {
      this.setData({
        imagePath: e.detail.path
      });
      this.triggerEvent('shareImagePath', {'imagePath': e.detail.path});
    },

    triggerSaveImage(e) {
      this.setData({
        showBigPainter: true
      })
      wx.showLoading({
        title: '保存中...',
      })
    },

    paintImgOK(e) {
      this.data.bigImagePath = e.detail.path;
      wx.hideLoading();
      this.saveImage(e.detail.path);
    },

    saveImage(path) {
      var _this = this;
      wx.saveImageToPhotosAlbum({
        filePath:path,
        success(res){
          wx.showModal({
            content: '保存成功，从相册选择图片分享',
            title: '',
            showCancel:false,
            confirmColor:'#008000'
          })
          _this.onDismiss();
        },
        fail(res) {
          wx.showModal({
            title: '保存失败，请重试',
            showCancel: false,
            confirmColor: '#008000'
          })
        }
      });
    }
  }
})
