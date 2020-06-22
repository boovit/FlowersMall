var util = require('../../utils/util.js');
var networkTools = require('../../utils/network.js');
var routeTools = require('../../utils/route.js');
var reqPath = "bizGoods/query";
var reqSkuPath = "bizSku/getSkuInfoByGoodId";
var reqCoupon = "bizCouponUser/add";

Page({
  data: {
    carouselCurrentIndex: 0,
    goodsID: '',
    isShowGoodsPan: false,
    goodsInfo: {},
    sku: [],
    goodsNumber: 1,
  },

  onLoad: function(option) {
    console.log(option);
    var that = this;
    wx.setNavigationBarTitle({
      title: '商品详情',
    });
    this.setData({
      goodsID: option.id,
    });

    //请求详情信息
    this.requestDetailInfo(option.id);
  },

  requestDetailInfo(goodsID) {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    });
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqPath,
      data: {
        'id': goodsID
      },
      method: 'POST',
      dataType: 'json',
      header: networkTools.requestHeader(),
      success: res => {
        wx.hideLoading();
        console.log(res);
        var data = res.data;
        if (data.success) {
          var goodsDetailInfo = data.data[0]; //这里只取数组第一个
          that.setData({
            goodsInfo: goodsDetailInfo
          });
        } else if (data.code == -1) {
          console.log('need_login');
        }
      },
      fail: res => {
        wx.hideLoading();
      }
    });
  },

  requestSkuInfo: function() {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    });
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqSkuPath,
      data: {
        'id': that.data.goodsID
      },
      method: 'POST',
      dataType: 'json',
      header: networkTools.requestHeader(),
      success: res => {
        wx.hideLoading();
        console.log(res);
        var data = res.data;
        if (data.success) {
          var skuData = data.data; //这里只取数组第一个
          that.setData({
            isShowGoodsPan: true,
            sku: skuData
          });
        } else {

        }
      },
      fail: res => {
        wx.hideLoading();
      }
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
          title: '网络错误请重试',
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

  homeClick: function(e) {
    console.log('home click');
    wx.switchTab({
      url: '../home/home',
    });
  },

  goodsBuyClick: function(e) {
    console.log('buy click');
    this.requestSkuInfo();
  },

  closeClick: function(e) {
    console.log('close click');
    this.clearSelected();
    this.setData({
      isShowGoodsPan: false
    });
  },

  goodsGroupClick: function(e) {
    console.log('e');
  },

  skuItemClick: function(e) {
    console.log(e);
    if (e.target.id != 'skuItem') return;

    var curSku = this.data.sku;
    var selectGroupData = e.currentTarget.dataset.data;
    var selectItemData = e.target.dataset.data;
    if (selectGroupData.group.length == 1) {
      selectItemData.selected = true;
    } else {
      selectItemData.selected = !selectItemData.selected;
    }

    for (var i = 0; i < curSku.length; i++) {
      var curGroupData = curSku[i];
      if (selectGroupData.title == curGroupData.title) {
        for (var j = 0; j < curGroupData.group.length; j++) {
          var curItemData = curGroupData.group[j];
          if (curItemData.id == selectItemData.id) {
            curItemData.selected = true;
          } else {
            curItemData.selected = false;
          }
        }
      }
    }
    console.log(curSku);
    this.setData({
      sku: curSku
    });
  },

  reduceClick: function(e) {
    var num = this.data.goodsNumber;
    if (num > 1) {
      num--;
    }
    this.setData({
      goodsNumber: num
    });
  },

  bindInput: function(e) {
    console.log(e);
    var num = e.detail.value;
    this.setData({
      goodsNumber: parseInt(num),
    });
  },

  plusClick: function(e) {
    var num = this.data.goodsNumber;
    num++;
    this.setData({
      goodsNumber: num
    });
  },

  enterClick: function() {
    console.log('确定');
    var that = this;
    var group = this.checkSelected();
    if (group == undefined) {
      this.data.goodsInfo.sku = this.validSkuArr();
      this.data.goodsInfo.number = this.data.goodsNumber;
      var list = [];
      list.push(that.data.goodsInfo);
      var obj = {
        goodsList: list
      }
      console.log(obj);
      wx.navigateTo({
        url: '../new_order/new_order?data=' + encodeURIComponent(JSON.stringify(obj)),
      });
    } else {
      wx.showToast({
        title: '请选择' + group.title,
        icon: 'none',
      })
    }
  },

  catchSkuTouchMove: function(e) {

  },

  validSkuArr: function() {
    var sku = this.data.sku;
    for (var i = 0; i < sku.length; i++) {
      var skuItem = sku[i];
      var group = [];
      for (var j = 0; j < skuItem.group.length; j++) {
        var groupItem = skuItem.group[j];
        if (groupItem.selected == true) {
          group.push(groupItem);
          break;
        }
      }
      skuItem.group = group;
    }
    return sku;
  },

  checkSelected: function() {
    var sku = this.data.sku;
    for (var i = 0; i < sku.length; i++) {
      var groups = sku[i];
      var isSelected = false;
      for (var j = 0; j < groups.group.length; j++) {
        var tag = groups.group[j];
        if (tag.selected == true) {
          isSelected = true;
          break;
        }
      }
      if (isSelected == false) {
        return groups;
      }
    }
    return;
  },

  clearSelected: function() {
    var sku = this.data.sku;
    for (var i = 0; i < sku.length; i++) {
      var groups = sku[i];
      for (var j = 0; j < groups.group.length; j++) {
        var tag = groups.group[j];
        tag.selected = false;
      }
    }
    this.setData({
      sku: sku,
      goodsNumber: 1,
    });
  },

//轮播图滚动
  carouselChangeHandler: function(e) {
    this.setData({
      carouselCurrentIndex: e.detail.current
    });
  },

  carouselItemClicked:function(e){
    //空实现即可
  },
})