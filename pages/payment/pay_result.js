var util = require('../../utils/util.js');
var networkTools = require('../../utils/network.js');
var routeTools = require('../../utils/route.js');
var reqPath = 'bizOrder/queryByOrderId';
var reqHotPath = 'main/payResult';
var reqCoupon = "bizCouponUser/add";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollViewHight: 0,
    orderId: '',
    isPaySuccess: true,
    payMoney: 0,
    otherGoodsData: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var that = this;
    var id = options.orderId;
    this.requestOrderResult(id);
    this.setData({
      orderId: id,
      scrollViewHight: that.getScrollViewHeight()
    });
    this.requestHotGoods();
  },

  getScrollViewHeight: function() {
    var k = 750 / util.defaultDevice.windowWidth;
    var kHeight = k * (util.defaultDevice.screenHeight - util.defaultDevice.statusBarHeight - util.defaultDevice.navBarHeight);
    return kHeight - 355;
  },

  requestOrderResult: function(orderId) {
    var that = this;
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqPath,
      data: {
        "enablePaging": false,
        "orderId": orderId
      },
      method: 'POST',
      dataType: 'json',
      header: networkTools.requestHeader(),
      success: res => {
        console.log(res);
        if (res.data.success == true) {
          var orderInfo = res.data.data[0];
          if (orderInfo.status > 0) {
            that.setData({
              payMoney: orderInfo.price,
              isPaySuccess: true
            });
          } else {
            that.setData({
              isPaySuccess: false
            });
          }
        } else {
          that.setData({
            isPaySuccess: false
          });
        }
      },
      fail: res => {
        that.setData({
          isPaySuccess: false
        });
      }
    });
  },

  requestHotGoods: function() {
    var that = this;
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqHotPath,
      data: {
        "page": false
      },
      method: 'POST',
      dataType: 'json',
      header: networkTools.requestHeader(),
      success: res => {
        console.log(res.data.data);
        if (res.data.success) {
          var data = res.data.data
          that.setData({
            otherGoodsData: data
          });
        }
      },
      fail: res => {}
    });
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
                wx.redirectTo({
                  url: '../coupon/coupon',
                });
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

  homeClick: function(e) {
    wx.switchTab({
      url: '../home/home',
    });
  },

  orderClick: function(e) {
    var that = this;
    wx.redirectTo({
      url: '../order_detail/order_detail?orderId=' + that.data.orderId,
    });
  },

  repayClick: function(e) {
    var that = this;
    wx.redirectTo({
      url: '../new_order/new_order?orderId=' + that.data.orderId + '&origin=' + routeTools.OriginInside_PayResult,
    });
  },

  couponClick: function(e) {
    var data = e.currentTarget.dataset.data;
    console.log(data);
    this.requestCouponAdd(data.id);
  },

  squareCardClicked: function(e) {
    console.log(e.currentTarget.dataset);
    var data = e.currentTarget.dataset.data;
    this.pushDetailPage(data);
  },

  pushDetailPage: function(item) {
    var id = item.id;
    wx.redirectTo({
      url: '../detail/detail?id=' + id,
    });
  },
})