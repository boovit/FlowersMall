//主页
var util = require('../../utils/util.js');
var networkTools = require('../../utils/network.js');
var routeTools = require('../../utils/route.js');
var reqPath = "main/query";
var reqCoupon = "bizCouponUser/add";

Page({
  data: {
    options:null,
    pageWidth: 0,
    carouselCurrentIndex: 0,
    homeData: []
  },

  onLoad: function(options) {
    // 生命周期函数--监听页面加载
    console.log(options);
    this.data.options = options;
    this.getPageWidth();
    this.login();
  },

  onPullDownRefresh: function() {
    //下拉刷新
    console.log('下拉刷新');
    this.requestHomeData();
    wx.stopPullDownRefresh();
  },

  onReachBottom: function() {
    //上拉加载更多
    console.log('上拉更多');
  },

  //private
  //登陆
  login: function () {
    var that = this;
    wx.showLoading({
      title: '正在登陆',
    });
    networkTools.networkCenter.login({
      success: res => {
        wx.hideLoading();
        if (res.data.success) {
          var _op = res.data.data.op;
          //登陆成功
          //请求数据
          that.requestHomeData();
          if (that.data.options == null || Object.keys(that.data.options).length == 0){
            that.data.options = {op:_op};
          }
          routeTools.pageRoute(that.data.options);
        } else {
          wx.showToast({
            title: '登陆失败',
            icon: 'none',
            duration: 3000
          })
        }
      },
      fail: res => {
        wx.hideLoading();
      }
    });
  },

  //请求首页数据
  requestHomeData: function() {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    });
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqPath,
      data: {},
      method: 'POST',
      dataType: 'json',
      header: networkTools.requestHeader(),
      success: function(res) {
        console.log('req home data success',res);
        wx.hideLoading();
        if (res.data.success) {
          that.setData({
            homeData: res.data.data
          });
        }
      },
      fail: function(res) {
        wx.hideLoading();
        console.log('req home data fail');
      },
      complete: function(res) {
        console.log('req home data complete');
      },
    })
  },

  getPageWidth: function() {
    var app = getApp();
    this.setData({
      pageWidth: app.globalData.appWindowSize.width,
    });
  },

  bigCardClicked: function(e) {
    console.log(e.currentTarget.dataset);
    console.log(e.target.dataset);
    var data = e.currentTarget.dataset.data;
    var buttonID = e.target.dataset.buttonId
    if (buttonID == 'button1') {
      console.log('购物车');
    } else if (buttonID == 'button2') {
      console.log('分享');
    } else { //卡片点击
      // this.pushDetailPage(data);
      wx.navigateTo({
        url: '../activity/fission/fission',
      });
    }
  },

  landscapeItemClicked: function(e) {
    console.log(e.currentTarget.dataset);
    var data = e.currentTarget.dataset.data;
    this.pushDetailPage(data);
  },

  squareCardClicked: function(e) {
    console.log(e.currentTarget.dataset);
    var data = e.currentTarget.dataset.data;
    this.pushDetailPage(data);
  },

  pushDetailPage: function(item) {
    var id = item.id;
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
    });
  },

  pushActDetailPage:function(item){
    var actId = item.actId;
    wx.navigateTo({
      url: '../activity/fission/fission?actId=' + actId,
    });
  },

  onShareAppMessage: function(ops) {
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops);
      var item = ops.target.dataset.data;
      return {
        title: '吆喝鲜花',
        path: 'pages/detail/detail?id=' + item.id,
        imageUrl: item.goodsImgsArr[0],
        success: function(res) {
          // 转发成功
          console.log("转发成功:" + JSON.stringify(res));
        },
        fail: function(res) {
          // 转发失败
          console.log("转发失败:" + JSON.stringify(res));
        }
      }
    }
  },

  cartClick: function(e) {

  },

  shareClick: function(e) {

  },

  catchButtonEvent: function(e) {

  },

  requestCouponAdd: function(couponID) {
    var that = this;
    wx.showLoading({
      title: '领券中',
    })
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqCoupon,
      data: {
        couponId: couponID
      },
      method: 'POST',
      dataType: 'json',
      header: networkTools.requestHeader(),
      success: function(res) {
        console.log('req home data success');
        console.log(res);
        wx.hideLoading();
        if (res.data.success) {
          wx.showToast({
            title: '领取成功',
          })
        } else if (res.data.code == '-4') {
          wx.showModal({
            title: '提示',
            content: '该优惠券已领取,是否查已有优惠券',
            success: function(res) {
              if (res.cancel) {
                //点击取消,默认隐藏弹框
              } else {
                //点击确定
                wx.navigateTo({
                  url: '../coupon/coupon'
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '领取失败',
          });
        }
      },
      fail: function(res) {
        console.log('req home data fail');
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
        })
      },
      complete: function(res) {
        console.log('req home data complete');
      },
    })
  },

  couponClick: function(e) {
    var data = e.currentTarget.dataset.data;
    console.log(data);
    this.requestCouponAdd(data.id);
  },

  //轮播图回调
  carouselItemClicked: function (e) {
    console.log(e.currentTarget.dataset);
    var data = e.currentTarget.dataset.data;
    var jumpType = data.jumpType;
    if (jumpType == 'act'){//活动
      this.pushActDetailPage(data);
    }else{
      this.pushDetailPage(data);
    }
  },

  carouselChangeHandler: function(e) {
    this.setData({
      carouselCurrentIndex: e.detail.current
    });
  },
})