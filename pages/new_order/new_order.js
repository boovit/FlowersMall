var util = require('../../utils/util.js');
var networkTools = require('../../utils/network.js');
var routeTools = require('../../utils/route.js');

var reqPath = "bizOrder/add";
var payPath = 'bizOrder/pay';
var couponPath = "bizCouponUser/query";
var reqOrderDetailPath = "bizOrder/queryByOrderId";

var CouponType_FullReduction = 'all';//满减券,可叠加使用
var CouponType_Cash = 'cash'; //现金券

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pushAddressOrigin:'',//点击调起地址页的源,address,connect
    scrollViewHeight: 0,
    orderInfo: {
      goodsList: []
    },
    paymentParam: {},
    orderId: '',
    expressInfo: null,
    isShowCoupon: false,
    expressItem: ['包邮 ￥0元', '自提'],
    defExpIndex: 0,
    currentCouponList:[],
    couponAmount:0,
    connectAddress:'',
    connectTel:'',//联系电话
    cardMsg:'',//卡片祝福
    leaveMsg:'',//买家留言
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var that = this;
    wx.setNavigationBarTitle({
      title: '待支付订单',
    });
    this.setData({
      scrollViewHeight: that.getScrollViewHeight()
    });
    if (Object.keys(options).length != 0){
      var origin = options.origin;
      if(origin != undefined){
        var orderID = options.orderId;
        this.data.orderId = orderID;
        this.requestOrderDetail(orderID);
        if (origin == routeTools.OriginExternal_UnderPay){
          this.requestWechatPaymentInfo();
          this.setData({
            defExpIndex:1
          });
        } else if (origin == routeTools.OriginInside_Order||
                   origin == routeTools.OriginInside_PayResult){
          this.requestWechatPaymentInfo();
          this.setData({
            defExpIndex: 1
          });
        }
      } else {
        //详情页带过来的数据
        var data = JSON.parse(decodeURIComponent(options.data));
        console.log(data);
        that.setData({
          orderInfo: data
        });
      }
    }
    this.requestCoupon();//请求优惠券
  },

  addressPageCallBack:function(e){
    var address = e;
    console.log(address);
    if (this.data.pushAddressOrigin == 'address') {
      this.setData({
        expressInfo: address
      });
    } else if (this.data.pushAddressOrigin == 'connect') {
      this.setData({
        connectAddress: address
      });
    }
  },

  getScrollViewHeight: function() {
    var k = 750 / util.defaultDevice.windowWidth;
    var kHeight = k * util.defaultDevice.windowHeight;
    return kHeight - 44;
  },

  formateGoodsList: function() {
    var that = this;
    var list = this.data.orderInfo.goodsList;
    var resultList = [];
    for (var i = 0; i < list.length; i++) {
      var goods = list[i];
      var sku = goods.sku;
      var newGoods = {
        id: goods.id,
        sku: that.formateSkuList(sku),
        number: goods.number,
      };
      resultList.push(newGoods);
    }
    return resultList;
  },

  formateSkuList: function(sku) {
    var resSku = [];
    for (var i = 0; i < sku.length; i++) {
      var group = sku[i].group;
      for (var j = 0; j < group.length; j++) {
        var skuid = group[j].id;
        if (group[j].selected) {
          resSku.push(skuid);
        }
      }
    }
    return resSku;
  },

  requestOrderDetail: function (orderId) {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    })
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqOrderDetailPath,
      data: {
        'orderId': orderId
      },
      method: 'POST',
      dataType: 'json',
      header: networkTools.requestHeader(),
      success: res => {
        wx.hideLoading();
        console.log(res);
        var list = res.data.data;
        if (res.data.success && list.length>0) {
          var order = list[0]; //取第一个
          console.log(order);
          that.setData({
            orderInfo: order
          });
        }
      },
      fail: res => {
        wx.hideLoading();
      }
    });
  },

  checkOrderInfoValid:function(){
    let valid = false;
    if(this.data.defExpIndex == 0 && this.data.expressInfo!=null){
      valid = true;
    } else if (this.data.defExpIndex == 1){
      valid = true;
    }
    return valid;
  },

  postAddOrder: function() {
    var that = this;
    if(!that.checkOrderInfoValid()){
      //
      wx.showToast({
        title: '请完善订单地址信息',
        icon:'none'
      });
      return;
    }

    var addrId = '';
    var backtel = '';
    if(that.data.defExpIndex == 0){
      addrId = that.data.expressInfo.id;
      backtel = that.data.connectTel;
    }
    var order = {
      goodsList: that.formateGoodsList(),
      addressId: addrId,
      express: that.data.expressItem[that.data.defExpIndex],
      coupon: that.getSelectedCouponId(),
      leavingMsg:that.data.leaveMsg,
      cardMsg:that.data.cardMsg,
      backTel: backtel
    };
    wx.showLoading({
      title: '正在支付',
    });
    wx.request({
      url: networkTools.APPBaseHost + '/' + reqPath,
      data: order,
      method: 'POST',
      dataType: 'json',
      header: networkTools.requestHeader(),
      success: res => {
        wx.hideLoading();
        if (res.data.success == true) {
          var orderId = res.data.data;
          that.data.orderId = orderId;
          that.requestWechatPaymentInfo();
        } else {
          wx.showToast({
            title: '创建订单出错',
            icon:'none'
          });
        }
      },
      fail: res => {
        wx.hideLoading();
        wx.showToast({
          title: '创建订单出错',
          icon:'none'
        });
      }
    });
  },

  submitPayment: function() {
    var paymentParam = this.data.paymentParam;
    var that = this;
    wx.requestPayment({
      timeStamp: paymentParam.timeStamp,
      nonceStr: paymentParam.nonceStr,
      package: paymentParam.package,
      signType: paymentParam.signType,
      paySign: paymentParam.paySign,
      success: res => {
        console.log('success');
        console.log(res);

        wx.redirectTo({
          url: '../payment/pay_result?orderId='+that.data.orderId,
        })
      },
      fail: res => {
        console.log('fail');
        console.log(res);
        wx.redirectTo({
          url: '../payment/pay_result?orderId=' + that.data.orderId,
        })
      }
    });
  },

  requestWechatPaymentInfo: function() {
    var that = this;
    wx.showLoading({
      title: '正在支付',
    });
    wx.request({
      url: networkTools.APPBaseHost + '/' + payPath,
      data: {
        'orderId': that.data.orderId
      },
      method: 'POST',
      dataType: 'json',
      header: networkTools.requestHeader(),
      success: res => {
        wx.hideLoading();
        console.log(res);
        if (res.data.success) {
          var data = res.data.data;
          var payParam = {
            timeStamp: data.timeStamp,
            nonceStr: data.nonceStr,
            package: data.packages,
            signType: data.signType,
            paySign: data.paySign
          }
          that.data.paymentParam = payParam;

          that.submitPayment();
        }else{
          wx.showToast({
            title: '支付错误',
            icon: 'none'
          })
        }
      },
      fail: res => {
        wx.hideLoading();
        wx.showToast({
          title: '支付错误',
          icon:'none'
        })
      }
    });
  },

  //请求优惠券
  requestCoupon: function() {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    })
    wx.request({
      url: networkTools.APPBaseHost + '/' + couponPath,
      data: {
        'status': '1'
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


  //Action click
  handleScrollMove:function(e){
    //空实现即可
  },

  submitOrderClick: function(e) {
    this.postAddOrder();
  },

//卡片留言
  cardMessageInput:function(e){
    var msg = e.detail.value;
    this.data.cardMsg = msg;
  },

//买家电话
  connectTelInput:function(e){
    var msg = e.detail.value;
    this.data.connectTel = msg;
  },

//买家留言
  leaveMessageInput:function(e){
    var msg = e.detail.value;
    this.data.leaveMsg = msg;
  },

  //地址选择点击
  addressClick: function(e) {
    var that = this;
    wx.navigateTo({
      url: '../address_list/address_list',
    });
    this.data.pushAddressOrigin = 'address';
  },

  //关闭选择板
  selectedPanCloseClick: function(e) {
    this.setData({
      isShowCoupon: false
    });
  },

  expressChange: function(e) {
    console.log(e);
    var index = e.detail.value;
    this.setData({
      defExpIndex: index
    });
  },

  //优惠券点击
  discountClick: function() {
    this.setData({
      isShowCoupon: true
    });
  },

  //取消
  couponCancelClick: function(e) {
    this.cancelAllSelectedCoupon();
    this.setData({
      isShowCoupon: false,
      couponAmount:''
    });
  },
  //确定
  couponConfirmClick: function(e) {
    var that = this;
    var sum = that.calculateCouponAmount();
    this.setData({
      isShowCoupon: false,
      couponAmount: sum
    });
  },

  couponClick:function(e){
    console.log(e);
    var data = e.currentTarget.dataset.data;
    if(data.selected){
      this.unselectedCoupon(data);
    }else if(this.checkCouponCanUse(data)){
      this.selectedCoupon(data);
    }else{
      wx.showToast({
        title: '优惠券已达使用上限',
        icon:'none'
      });
    }
  },

  connectPersonClick:function(e){
    wx.navigateTo({
      url: '../address_list/address_list'
    });
    this.data.pushAddressOrigin = 'connect';
  },

  checkCouponCanUse:function(coupon){
    var canUse = false;
    var couponType = coupon.type;
    var sumGoodsPrice = this.sumGoodsPrice();//商品总价
    if(couponType == CouponType_FullReduction){
      var sumFullPrice = this.sumFullReductionCoupon();//满减叠加价
      var sumCashPice = this.sumCashCoupon();//现金抵扣
      var gapPrice = sumGoodsPrice - sumFullPrice;
      var prePrice = sumGoodsPrice - this.sumFullReductionPrice() - this.sumCashCoupon() - coupon.couponPrice;
      if(gapPrice>0 && gapPrice>coupon.fullPrice && prePrice>0){
        //可以用
        canUse = true;
      }else{
        //不能用
        canUse = false;
      }
    }else if(couponType == CouponType_Cash){
      var prePrice = sumGoodsPrice - this.sumFullReductionPrice() - coupon.couponPrice;
      if (prePrice > 0 && !this.checkCashCouponSelected()){//只能用一张
        //可以用
        canUse = true;
      }else{
        //不能用
        canUse = false;
      }
    }
    return canUse;
  },

  sumGoodsPrice:function(){
    var goodsList = this.data.orderInfo.goodsList;
    var sum = 0;
    for (var idx in goodsList){
      var goods = goodsList[idx];
      sum += this.skuPriceSum(goods)*goods.number;
    }
    return sum;
  },

  skuPriceSum:function(goodsInfo) {
    var sum = goodsInfo.goodsRealPrice;
    console.log(sum);
    var sku = goodsInfo.sku;
    for (var i = 0; i < sku.length; i++) {
      var tags = sku[i].group;
      sum += tags[0].skuRealPrice;
    }
    return sum;
  },

  sumFullReductionCoupon:function(){
    var list = this.data.currentCouponList;
    var fullSum = 0;
    for(var idx in list){
      var coupon = list[idx];
      if(coupon.type == CouponType_FullReduction && coupon.selected){
        fullSum += coupon.fullPrice;
      }
    }
    return fullSum;
  },

  sumFullReductionPrice:function(){
    var list = this.data.currentCouponList;
    var fullSum = 0;
    for (var idx in list) {
      var coupon = list[idx];
      if (coupon.type == CouponType_FullReduction && coupon.selected) {
        fullSum += coupon.couponPrice;
      }
    }
    return fullSum;
  },

  sumCashCoupon:function(){
    var list = this.data.currentCouponList;
    var cashSum = 0;
    for (var idx in list) {
      var coupon = list[idx];
      if (coupon.type == CouponType_Cash && coupon.selected) {
        cashSum += coupon.couponPrice;
      }
    }
    return cashSum;
  },

  checkCashCouponSelected: function () {
    var list = this.data.currentCouponList;
    for (var idx in list) {
      var coupon = list[idx];
      if (coupon.type == CouponType_Cash && coupon.selected) {
        return true;
      }
    }
    return false;
  },

  selectedCoupon:function(coupon){
    var list = this.data.currentCouponList;
    for(var idx in list){
      if(list[idx].id == coupon.id){
        list[idx].selected = true;
        break;
      }
    }
    console.log(list);
    this.setData({
      currentCouponList:list
    });
  },

  unselectedCoupon:function(coupon){
    var list = this.data.currentCouponList;
    for (var idx in list) {
      if (list[idx].id == coupon.id) {
        list[idx].selected = false;
        break;
      }
    }
    console.log(list);
    this.setData({
      currentCouponList: list
    });
  },

  cancelAllSelectedCoupon:function(){
    var list = this.data.currentCouponList;
    for (var idx in list) {
      list[idx].selected = false;
    }
    this.setData({
      currentCouponList: list
    });
  },

  calculateCouponAmount:function(){
    var list = this.data.currentCouponList;
    var sum = 0;
    for(var idx in list){
      var data = list[idx];
      if(data.selected){
        sum += data.couponPrice;
      }
    }
    return sum;
  },

  getSelectedCouponId:function(){
    var list = this.data.currentCouponList;
    var idArr = [];
    for (var idx in list) {
      var data = list[idx];
      if (data.selected) {
        idArr.push(data.id);
      }
    }
    if(idArr.length > 0){
      return '[' + idArr.join(',') + ']';
    }
    return null;
  },
})