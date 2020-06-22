var util = require('../../utils/util.js');
var networkTools = require('../../utils/network.js');
var routeTools = require('../../utils/route.js');
var reqPath = "bizOrder/query";
var reqDelPath = "bizOrder/delete";

var PageOffset = 10;
var defaultPageBegin = 1;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    scrollViewHeight:0,
    hasMore: true,
    currentPage: defaultPageBegin,
    orderListHeight: 0,
    currentOrderList: [],
    orderItems: [{
        title: '全部',
        type: -1,
        selected: true
      },
      {
        title: '待付款',
        type: 0
      },
      {
        title: '待发货',
        type: 1
      },
      {
        title: '已发货',
        type: 2
      },
      {
        title: '已完成',
        type: 3
      },
      {
        title: '退款中',
        type: 4
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    wx.setNavigationBarTitle({
      title: '订单查询',
    });
    this.setData({
      scrollViewHeight: this.getScrollViewHeight()
    });
    var selectedType = options.type;
    this.selectedItemType(selectedType);
  },

  getScrollViewHeight: function() {
    var k = 750 / util.defaultDevice.windowWidth;
    var kHeight = k * (util.defaultDevice.screenHeight - util.defaultDevice.statusBarHeight - util.defaultDevice.navBarHeight);
    return kHeight - 93;
  },

  //请求订单list
  requestOrderList: function(type) {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    });
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqPath,
      data: {
        'param': {
          'pageNumber': that.data.currentPage,
          'pageSize': PageOffset
        },
        'orderStatus': type == -1 ? '' : type,
      },
      method: 'POST',
      dataType: 'json',
      header: networkTools.requestHeader(),
      success: res => {
        wx.hideLoading();
        console.log(res);
        if (res.data.success) {
          var list = res.data.data;
          if (list.length > 0) {
            that.setData({
              currentOrderList: that.data.currentOrderList.concat(list)
            });
          }
          if(list.length<PageOffset) {//不够一页时，下次就不用请求了
            that.setData({
              hasMore: false
            });
          }
        }
      },
      fail: res => {
        wx.hideLoading();
      }
    });
  },

  requestDeleteOrder: function(orderId) {
    var that = this;
    wx.showLoading({
      title: '正在处理',
    });
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqDelPath,
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
          that.deleteOrder4CurList(orderId);
        }
      },
      fail: res => {
        wx.hideLoading();
      }
    });
  },

  deleteOrder4CurList: function(orderId) {
    var curList = this.data.currentOrderList;
    var delIndex = -1;
    for (var i = 0; i < curList.length; i++) {
      var order = curList[i];
      if (order.orderId == orderId) {
        delIndex = i;
        break;
      }
    }
    if (delIndex >= 0) {
      curList.splice(delIndex, 1);
    }
    this.setData({
      currentOrderList: curList
    });
  },

  //选中item
  selectedItemType: function(type) {
    var orderItems = this.data.orderItems;
    for (var i = 0; i < orderItems.length; i++) {
      var item = orderItems[i];
      if (type == item.type) { //选中
        item.selected = true;
      } else { //未选中
        item.selected = false;
      }
    }
    this.setData({
      hasMore: true,
      currentPage: defaultPageBegin,
      currentOrderList: [],
      orderItems: orderItems
    });
    this.requestOrderList(type);
  },

  //Action
  selectTabItemClick: function(e) {
    console.log(e);
    var data = e.currentTarget.dataset.item;
    var type = data.type;
    this.selectedItemType(type);
  },

  currentSelectedTabItem: function() {
    var orderItems = this.data.orderItems;
    for (var i = 0; i < orderItems.length; i++) {
      var item = orderItems[i];
      if (item.selected) { //选中
        return item;
      }
    }
    return null;
  },

  orderCardClick: function(e) {
    console.log(e);
    var orderData = e.currentTarget.dataset.data;
    var elementId = e.target.id;
    if (elementId == 'payment') { //立即支付
      //跳转支付页
      wx.navigateTo({
        url: '../new_order/new_order?orderId=' + orderData.orderId +'&origin='+routeTools.OriginInside_Order,
      })
    } else if (elementId == 'delete') { //取消、删除
      var that = this;
      //请求删除接口
      wx.showModal({
        title: '提示',
        content: '是否要删除订单',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            that.requestDeleteOrder(orderData.orderId);
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      });
    } else if (elementId == 'tips') { //提醒发货

    } else if (elementId == 'confirm') { //确认收货

    } else if (elementId == 'rebuy') { //再次购买

    } else { //跳转详情
      wx.navigateTo({
        url: '../order_detail/order_detail?orderId=' + orderData.orderId,
      })
    }
  },

  scrollViewDidLoadMore: function(e) {
    console.log(e);
    if(!this.data.hasMore){
      return;
    }
    this.data.currentPage = this.data.currentPage + 1;
    var tabItem = this.currentSelectedTabItem();
    this.requestOrderList(tabItem.type);
  },
})