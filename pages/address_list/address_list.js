var networkTools = require('../../utils/network.js');
var reqAddPath = "bizUserAddress/add";
var reqQueryPath = "bizUserAddress/query";
var reqDelPath = "bizUserAddress/delete";

//页面选中地址信息后，callback方法为:addressPageCallBack(address)

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [],
    currentAddress: {},
    pageOrigin: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    wx.setNavigationBarTitle({
      title: '地址列表'
    });
    this.data.pageOrigin = options.origin;
    this.requestAddressList();
  },

  requestAddAddress: function(address) {
    var that = this;
    wx.showLoading({
      title: '正在新增地址',
    });
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqAddPath,
      data: address,
      header: networkTools.requestHeader(),
      method: 'POST',
      success: function(res) {
        wx.hideLoading();
        console.log(res);
        if (res.data.success) {
          that.requestAddressList();
        }
      },
      fail: function(res) {
        wx.hideLoading();
      },
    });
  },

  requestDeleteAddress: function(address) {
    var that = this;
    wx.showLoading({
      title: '正在新增地址',
    });
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqDelPath,
      data: address,
      header: networkTools.requestHeader(),
      method: 'POST',
      success: function(res) {
        wx.hideLoading();
        console.log(res);
        if (res.data.success) {
          that.requestAddressList();
        }
      },
      fail: function(res) {
        wx.hideLoading();
      },
    });
  },

  requestAddressList: function() {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    });
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqQueryPath,
      data: {
        "enablePaging": false
      },
      header: networkTools.requestHeader(),
      method: 'POST',
      success: function(res) {
        console.log(res);
        wx.hideLoading();
        var list = res.data.data;
        that.setData({
          addressList: list
        });
      },
      fail: function(res) {
        wx.hideLoading();
      },
      complete: function(res) {},
    });
  },

  wechatAddressFormate: function(wechatAddr) {
    var address = {
      area: wechatAddr.provinceName + wechatAddr.cityName + wechatAddr.countyName,
      addressName: wechatAddr.detailInfo,
      userName: wechatAddr.userName,
      userTel: wechatAddr.telNumber
    }
    return address;
  },

  //Action
  //获取微信地址
  wechatAddressClick: function(e) {
    var that = this;
    wx.chooseAddress({
      success: res => {
        console.log(res);
        if (res.errMsg == 'chooseAddress:ok') {
          var address = that.wechatAddressFormate(res);
          var addrList = that.data.addressList;
          that.requestAddAddress(address);
        }
      },
      fail: res => {

      },
      complete: res => {

      }
    });
  },

  //选择地址卡片
  addressCardClick: function(e) {
    console.log(e);
    var addrData = e.currentTarget.dataset.data;
    if (e.target.id == 'delete') { //删除
      this.requestDeleteAddress(addrData);
    } else {
      if (addrData.area.indexOf('陕西') > -1 &&
          addrData.area.indexOf('西安') > -1){
        this.selectedAddress(addrData);
        var address = this.getSelectedAddress();
        var page = getCurrentPages();
        if (page.length > 1) {
          var prepage = page[page.length - 2];
          prepage.addressPageCallBack(address);
        }
        wx.navigateBack({
          delta: 1,
        });
      } else {
        wx.showToast({
          title: '目前只支持西安市配送',
          icon: 'none'
        });
      }
    }
  },

  selectedAddress: function(address) {
    var addrList = this.data.addressList;
    for (var idx in addrList) {
      if (address.id == addrList[idx].id) {
        addrList[idx].selected = true;
      } else {
        addrList[idx].selected = false;
      }
    }

    this.setData({
      addressList: addrList
    })
  },

  getSelectedAddress: function() {
    var addrList = this.data.addressList;
    var result = {};
    for (var idx in addrList) {
      if (addrList[idx].selected) {
        result = addrList[idx];
        break;
      }
    }
    return result;
  },
})