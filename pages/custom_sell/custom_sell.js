var networkTools = require('../../utils/network.js');
var serviceTools = require('../../utils/service.js');
var reqPath = "bizGoods/query";
var reqSkuPath = "bizSku/getSkuInfoByGoodId";
var reqCodePath = "bizOrder/addUnderOrder";

var CustomGoodsID = 14;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    mixGoods: null, //本页数据使用id=14的混合商品
    sku: null,
    isSelectedAll: false,
    showGoodsPan: false,
    showCodePan: false,
    codeData: '',
    discount: 0,
    orderId: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '线下销售',
    });
    this.requestCustomGoodsList();
    this.requestSkuInfo();
  },

  requestCustomGoodsList: function() {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    });
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqPath,
      data: {
        "enablePaging": false,
        "id": CustomGoodsID
      },
      method: 'POST',
      dataType: 'json',
      header: networkTools.requestHeader(),
      success: res => {
        wx.hideLoading();
        console.log(res);
        var data = res.data;
        if (data.success) {
          that.setData({
            mixGoods: data.data[0]
          });
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
        'id': CustomGoodsID
      },
      method: 'POST',
      dataType: 'json',
      header: networkTools.requestHeader(),
      success: res => {
        wx.hideLoading();
        var data = res.data;
        if (data.success) {
          var skuData = data.data[0]; //这里只取数组第一个
          that.setData({
            sku: skuData.group
          });
          console.log(that.data.sku);
        }
      },
      fail: res => {
        wx.hideLoading();
      }
    });
  },

  getPaymentQRCode: function(list) {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    });
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqCodePath,
      data: {
        rangePrice: that.data.discount * 100,
        goodsList: list,
        express: '自提'
      },
      header: networkTools.requestHeader(),
      method: 'POST',
      success: function(res) {
        wx.hideLoading();
        console.log(res);
        if (res.data.success) {
          console.log('订单号:', res.data.data.orderId);
          var imageData = res.data.data.ewm;
          var base64 = imageData;
          var orderid = res.data.data.orderId;
          that.setData({
            showCodePan: true,
            codeData: 'data:image/jpeg;base64,' + base64,
            orderId: orderid
          });
          //轮询检查订单状态
          that.checkOrderStatus();
        } else {
          wx.showToast({
            title: '生成二维码失败',
            icon: 'none'
          });
        }
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
    });
  },

  checkOrderStatus: function() {
    var that = this;
    var timer = setTimeout(function() {
      serviceTools.orderById({
        data: {
          orderId: that.data.orderId
        },
        success: function(res) {
          console.log(res);
          clearTimeout(timer);
          if(res.data.success){
            var order = res.data.data[0];
            if (order.status != 0){
              wx.switchTab({
                url: '../mine/mine',
              });
              return;
            }
          }
          if (that.data.showCodePan){
            that.checkOrderStatus();
          }
        },
        fail: function(res) {
          console.log(res);
          clearTimeout(timer);
          if (that.data.showCodePan) {
            that.checkOrderStatus();
          }
        }
      });
    }, 5000);
  },

  addCustomGoodsClick: function(e) {
    console.log('show pan');
    this.setData({
      showGoodsPan: true
    });
  },

  getQRCodeClick: function(e) {
    console.log('QR code');
    var sku = this.data.sku;
    var goodsList = [];
    for (var idx in sku) {
      var item = sku[idx];
      if (item.selected) {
        var goods = {
          id: this.data.mixGoods.id,
          number: item.number,
          sku: [item.id]
        }
        goodsList.push(goods);
      }
    }
    this.getPaymentQRCode(goodsList);
  },

  reloadData: function(data) {
    if (data.number <= 0) {
      data.selected = false;
    } else {
      data.selected = true;
    }
    var newList = [];
    var sku = this.data.sku;
    for (var idx in sku) {
      var item = sku[idx];
      if (item.id == data.id) {
        newList.push(data);
      } else {
        newList.push(item);
      }
    }
    this.setData({
      sku: newList
    });
  },

  refreshAllSelected: function() {
    var sku = this.data.sku;
    var isAll = true;
    for (var idx in sku) {
      var item = sku[idx];
      if (!item.selected) {
        isAll = false;
        break;
      }
    }
    this.setData({
      isSelectedAll: isAll
    });
  },

  goodsAmount: function() {
    var sum = 0;
    var list = this.data.sku;
    var goods = this.data.mixGoods;
    for (var i = 0; i < list.length; i++) {
      var sku = list[i];
      if (sku.selected) {
        sum += (sku.skuRealPrice + goods.goodsRealPrice) * (sku.number == null ? 0 : sku.number);
      }
    }
    return sum;
  },

  panBodyClick: function(e) {
    console.log('pan click');
  },

  panEnterClick: function(e) {
    this.setData({
      showGoodsPan: false
    });
  },

  closePanClick: function(e) {
    console.log('close pan');
    this.setData({
      showGoodsPan: false
    });
  },

  closeCodePanClick: function(e) {
    this.setData({
      showCodePan: false
    });
  },

  discountReduceClick: function(e) {
    console.log(e);
    var that = this;
    var sum = this.goodsAmount();
    if (sum + this.data.discount * 100 < 100) {
      return;
    }
    this.setData({
      discount: that.data.discount - 1
    });
  },

  bindDiscountInput: function(e) {
    console.log(e);
    var value = e.detail.value;
    if (value == '' || value == '-') {
      value = 0;
    }
    this.setData({
      discount: parseInt(value)
    });
  },

  discountPlusClick: function(e) {
    console.log(e);
    var that = this;
    this.setData({
      discount: that.data.discount + 1
    });
  },

  reduceClick: function(e) {
    console.log(e);
    var data = e.currentTarget.dataset.data;
    if (data.number == 0 || data.number == undefined) {
      return;
    }
    data.number = data.number - 1;
    this.reloadData(data);
  },

  bindInput: function(e) {
    console.log(e);
    var data = e.currentTarget.dataset.data;
    var value = e.detail.value;
    if (value == '') {
      value = 0;
    }
    data.number = value;
    this.reloadData(data);
  },

  plusClick: function(e) {
    console.log(e);
    var data = e.currentTarget.dataset.data;
    if (data.number == undefined) {
      data.number = 0;
    }
    data.number = data.number + 1;
    this.reloadData(data);
  },

  selectedClick: function(e) {
    console.log(e);
    // var data = e.currentTarget.dataset.data;
    // data.selected = !data.selected;
    // this.reloadData(data);
    // this.refreshAllSelected();
  },

  selectedAllClick: function(e) {
    console.log(e);
    var that = this;
    var sku = this.data.sku;
    for (var idx in sku) {
      var item = sku[idx];
      item.selected = !this.data.isSelectedAll;
    }

    this.setData({
      isSelectedAll: !that.data.isSelectedAll,
      sku: sku
    });
  },
})