var serviceTools = require('../../../utils/service.js');
var util = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowSharePan: false,
    isFavorite:false,
    showPoster: false,
    posterData: null,
    base64Data: null,
    actId: null,//活动id
    id:null, //扫码识别的id
    userInfo: null,
    actData: null,
    goods:null,
    fissionSum : 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    this.setData({
      actId: parseInt(options.actId),
      id: parseInt(options.id),
      userInfo: getApp().globalData.userInfo
    });
    this.requestActivity();
    this.requestFissionSum();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(opt) {
    console.log(opt);
    var btnId = opt.target.id;
    if (btnId == 'shareBtn') {

    } else {

    }
  },

  requestActivity: function() {
    var that = this;
    serviceTools.activityUser({
      data: {
        id: that.data.id,
        actId:that.data.actId
      },
      success: res => {
        console.log(res);
        if (res.data.success) {
          var actData = res.data.data[0];
          this.setData({
            actData: actData,
            goods:actData.goods
          });
        }
      },
      fail: res => {

      }
    });
  },

  requestFissionSum: function() {
    var that = this;
    serviceTools.fissionSum({
      data: {
        actId: that.data.actId
      },
      success: res => {
        console.log(res);
        if(res.data.success){
          that.setData({
            fissionSum:res.data.data
          });
        }
      },
      fail: res => {

      }
    });
  },

  requestExchangeCoupon:function(){
    var that = this;
    serviceTools.exchangeCoupon({
      data: {
      },
      success: res => {
        console.log(res);
        if (res.data.success) {
          wx.redirectTo({
            url: '../../coupon/coupon',
          });
        }else{
          wx.showToast({
            title: '兑换失败',
            icon:'none'
          });
        }
      },
      fail: res => {
        wx.showToast({
          title: '接口错误',
          icon: 'none'
        });
      }
    });
  },

  favoriteClick: function() {
    console.log('点赞');
    var that = this;
    this.checkAuthSetting({
      scope: 'scope.userInfo',
      success: res => {
        serviceTools.favorite({
          data: {
            actId: that.data.actId
          },
          success: function(res) {
            console.log(res);
            if(res.data.success){
              that.setData({
                isFavorite:true
              });
            }
          },
          fail: function(res) {
            console.log(res);
          }
        });
      },
      fail: res => {
        wx.showToast({
          title: "未授权",
          icon: 'none'
        });
      }
    });
  },

  //兑换
  exchangeClick: function (e) {
    console.log(e);
    this.requestExchangeCoupon();
  },

  shareClick: function() {
    this.setData({
      isShowSharePan: true
    });
  },

  closeSharePan: function() {
    this.setData({
      isShowSharePan: false
    });
  },

  createPosterClick: function() {
    var that = this;
    wx.showLoading({
      title: '正在生成',
    });
    serviceTools.getPoster({
      data: {
        actId: 1
      },
      success: function(res) {
        console.log(res);
        wx.hideLoading();
        if (res.data.success) {
          var base64 = res.data.data;
          that.setData({
            showPoster: true,
            posterData: 'data:image/jpeg;base64,' + base64,
            base64Data: base64
          });
        }
      },
      fail: function(res) {
        wx.hideLoading();
        console.log(res);
      }
    });

    this.setData({
      isShowSharePan: false
    });
  },

  closePosterClick: function() {
    this.setData({
      showPoster: false
    });
  },

  cancelPosterClick: function(e) {
    console.log('取消海报', e);
    this.setData({
      showPoster: false
    });
  },

  openSetting: function() {
    wx.openSetting();
  },

  savePosterClick: function(e) {
    console.log('保存海报', e);
    var that = this;
    this.checkAuthSetting({
      scope: 'scope.writePhotosAlbum',
      success: res => {
        that.savePhoto();
      },
      fail: res => {

      }
    });
  },

  checkAuthSetting: function(param) {
    wx.getSetting({
      success: res => {
        console.log('success', res);
        if (!res.authSetting[param.scope]) {
          wx.authorize({
            scope: param.scope,
            success: res => {
              console.log('授权成功', res);
              param.success();
            },
            fail: res => {
              console.log('授权失败', res);
              param.fail();
            }
          });
        } else {
          param.success(res);
        }
      },
      fail: res => {
        console.log('fail', res);
        param.fail();
      }
    });
  },

  savePhoto: function() {
    var that = this;
    wx.showLoading({
      title: '正在保存',
    });
    var aa = wx.getFileSystemManager();
    var photoName = this.getPhotoName();
    aa.writeFile({
      filePath: wx.env.USER_DATA_PATH + '/' + photoName,
      data: that.data.base64Data,
      encoding: 'base64',
      success: res => {
        wx.saveImageToPhotosAlbum({
          filePath: wx.env.USER_DATA_PATH + '/' + photoName,
          success: function(res) {
            wx.hideLoading();
            wx.showToast({
              title: '保存成功',
            })
          },
          fail: function(err) {
            wx.hideLoading();
            console.log(err)
          }
        })
        console.log(res)
      },
      fail: err => {
        wx.hideLoading();
        console.log(err)
      }
    });
  },

  getPhotoName: function() {
    var name = '';
    name = 'flowerShare' + (new Date()).valueOf() + '.jpeg';
    console.log(name);
    return name;
  },
})