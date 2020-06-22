var networkTools = require('../../utils/network.js');
var serviceTools = require('../../utils/service.js');
var reqPath = "sysMenu/query";

const Tag_offline = 'Tag_offline';
const Tag_coupon = 'Tag_coupon';
const Tag_addGoods = 'Tag_addGoods';
const Tag_addMaterial = 'Tag_addMaterial';

Page({
  data: {
    userInfo: null,
    orderItems: [{
        title: '全部',
        type: -1
      },
      {
        title: '待付款',
        type: 0,
        icon: '../../images/mine/unpayment_icon.png'
      },
      {
        title: '待发货',
        type: 1,
        icon: '../../images/mine/unship_icon.png'
      },
      {
        title: '已发货',
        type: 2,
        icon: '../../images/mine/shipped_icon.png'
      },
      {
        title: '已完成',
        type: 3,
        icon: '../../images/mine/finish_icon.png'
      }
    ],
    menuItems: [{
        title: '优惠券',
        icon: '../../images/mine/coupon_icon.png',
        tag: Tag_coupon
      }]
  },

  onLoad: function(options) {
    // 生命周期函数--监听页面加载
    console.log('mine page onload');
    wx.setNavigationBarTitle({
      title: '我的',
    });
    var appIns = getApp();
    this.setData({
      userInfo: appIns.globalData.userInfo
    });
    this.requestMenuItems();
  },

  //private
  onGotUserInfo: function(res) {
    console.log('用户信息',res);
    var detail = res.detail;
    var userInfo = detail.userInfo;
    this.setData({
      userInfo: userInfo,
    });
    
    this.syncUserInfo(userInfo);
  },

  syncUserInfo:function(userInfo){
    var appIns = getApp();
    appIns.data.userInfo = userInfo;
    serviceTools.syncUserInfo({
      data: userInfo,
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  
  requestMenuItems: function() {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    });
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqPath,
      data: {
        enablePaging: false
      },
      header: networkTools.requestHeader(),
      method: 'POST',
      success: function(res) {
        console.log(res);
        wx.hideLoading();
        var items = res.data.data[0].child;
        that.setupMenuItemsIcon(items);
        that.setData({
          menuItems: items
        });
      },
      fail: function(res) {
        wx.hideLoading();
      },
      complete: function(res) {
      },
    })
  },

  setupMenuItemsIcon:function(items){
    for(var i = 0 ;i < items.length; i++){
      var item = items[i];
      if (item.tag == Tag_coupon){
        item.icon = '../../images/mine/coupon_icon.png';
      }else{
        item.icon = '../../images/mine/share_icon.png';
      }
    }
  },

  //Click Action
  orderItemClick: function(e) {
    console.log(e);
    var data = e.currentTarget.dataset.item;
    var type = data.type;
    wx.navigateTo({
      url: '../order/order?type=' + type,
    });
  },

  menuItemClick: function(e) {
    console.log(e);
    var data = e.currentTarget.dataset.item;
    var tag = data.tag;
    if (tag == Tag_offline) {
      wx.navigateTo({
        url: '../custom_sell/custom_sell',
      });
    } else if (tag == Tag_coupon) {
      wx.navigateTo({
        url: '../coupon/coupon',
      });
    } else if (tag == Tag_addGoods){

    } else if (tag == Tag_addMaterial){

    }
  },
})