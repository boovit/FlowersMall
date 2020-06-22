var util = require('../../utils/util.js');
var networkTools = require('../../utils/network.js');
var routeTools = require('../../utils/route.js');
var reqPath = "bizOrder/queryByOrderId";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    status: 0,
    orderInfo: {},
    needbackHomePage:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var orderId = options.orderId;
    this.setData({
      orderId: orderId
    });
    this.requestOrderDetail(orderId);
    wx.setNavigationBarTitle({
      title: '订单详情',
    });
  },

  onUnload:function(){
    if(this.data.needbackHomePage){
      // wx.switchTab({
      //   url: '../home/home',
      // });
    }
  },

  requestOrderDetail: function(orderId) {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    })
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqPath,
      data: {
        'orderId': orderId
      },
      method: 'POST',
      dataType: 'json',
      header: networkTools.requestHeader(),
      success: res => {
        wx.hideLoading();
        console.log(res);
        if (res.data.success) {
          var list = res.data.data;
          var order = list[0]; //取第一个
          console.log(order);
          that.setData({
            orderInfo: order,
            status: order.status
          });
        }
      },
      fail: res => {
        wx.hideLoading();
      }
    });
  },

  // Action
  //立即支付
  goodsPayClick: function(e) {
    console.log(e);
    var that = this;
    wx.navigateTo({
      url: '../new_order/new_order?orderId=' + that.data.orderId + '&origin=' + routeTools.OriginInside_Order,
    })
  },

  goodsCardClick:function(e){
    console.log(e);
    this.data.needbackHomePage = true;
    var goods = e.currentTarget.dataset.data;
    wx.redirectTo({
      url: '../detail/detail?id=' + goods.goodsId,
    });
  },
})