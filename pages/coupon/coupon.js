var networkTools = require('../../utils/network.js');
var util = require('../../utils/util.js');
var reqPath = "bizCouponUser/query";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollViewHeight: 0,
    couponItems: [{
        title: '全部',
        type: -1,
        selected: true
      },
      {
        title: '未使用',
        type: 0
      },
      {
        title: '已使用',
        type: 1
      }
    ],
    currentCouponList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    this.selectedItemType(-1);
    this.setData({
      scrollViewHeight:that.getScrollViewHeight()
    });
  },

  getScrollViewHeight: function() {
    var k = 750 / util.defaultDevice.windowWidth;
    var kHeight = k * (util.defaultDevice.screenHeight - util.defaultDevice.statusBarHeight - util.defaultDevice.navBarHeight);
    return kHeight - 93;
  },

  requestCouponList: function(status) {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    })
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqPath,
      data: {
        'status': status
      },
      method: 'POST',
      header: networkTools.requestHeader(),
      success: res => {
        wx.hideLoading();
        console.log(res);
        var data = res.data;
        if (data.success) {
          that.setData({
            currentCouponList: data.data
          });
        }
      },
      fail: res => {
        wx.hideLoading();
      }
    });
  },

  //Action
  selectTabItemClick: function(e) {
    console.log(e);
    var data = e.currentTarget.dataset.item;
    var type = data.type;
    this.selectedItemType(type);
  },

  couponClick: function(e) {
    console.log(e);
    if (e.target.id == 'button') {
      var data = e.currentTarget.dataset.data;
      console.log(data);
      if (data.status == 1) {
        wx.switchTab({
          url: '../home/home',
        });
      }
    }
  },

  //选中item
  selectedItemType: function(type) {
    var items = this.data.couponItems;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (type == item.type) { //选中
        item.selected = true;
      } else { //未选中
        item.selected = false;
      }
    }
    this.setData({
      couponItems: items
    });

    var status = '';
    if (type == 0) { //未使用
      status = '1';
    } else if (type == 1) { //已使用
      status = '3';
    }
    this.requestCouponList(status);
  },
})