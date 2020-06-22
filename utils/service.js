var util = require('util.js');
var networkTools = require('network.js');

//兑换
var reqExchangeCouponPath = "bizFission/exchangeCoupon";
var exchangeCoupon = function(param){
  wx.request({
    url: networkTools.APPBaseHost + '/' + reqExchangeCouponPath,
    data: param.data,
    method: 'POST',
    dataType: 'json',
    header: networkTools.requestHeader(),
    success: res => {
      param.success(res);
    },
    fail: res => {
      param.fail(res);
    }
  });
};

//查询用户活动兑换
var reqFissionSumPath = "bizFission/queryUnusedSum";
var fissionSum = function(param){
  wx.request({
    url: networkTools.APPBaseHost + '/' + reqFissionSumPath,
    data: param.data,
    method: 'POST',
    dataType: 'json',
    header: networkTools.requestHeader(),
    success: res => {
      param.success(res);
    },
    fail: res => {
      param.fail(res);
    }
  });
};

//活动详情页
var reqActDetailPath = "bizActivityUser/queryById";
var activityUser = function(param){
  wx.request({
    url: networkTools.APPBaseHost + '/' + reqActDetailPath,
    data: param.data,
    method: 'POST',
    dataType: 'json',
    header: networkTools.requestHeader(),
    success: res => {
      param.success(res);
    },
    fail: res => {
      param.fail(res);
    }
  });
};

//同步用户信息
var reqUserPath = "wx/getUserInfo";
var syncUserInfo = function(param){
  wx.request({
    url: networkTools.APPBaseHost + '/' + reqUserPath,
    data: param.data,
    method: 'POST',
    dataType: 'json',
    header: networkTools.requestHeader(),
    success: res => {
      param.success(res);
    },
    fail: res => {
      param.fail(res);
    }
  });
};

//点赞
//param:actId=''
var reqFavoritePath = "bizGoods/fabulous";
var favorite = function(param){
  wx.request({
    url: networkTools.APPBaseHost + '/' + reqFavoritePath,
    data: param.data,
    method: 'POST',
    dataType: 'json',
    header: networkTools.requestHeader(),
    success: res => {
      param.success(res);
    },
    fail: res => {
      param.fail(res);
    }
  });
};

//生成海报
//param: actId=111
var reqHaiBaoPath = "bizActivityUser/getHaibao";
var getPoster = function (param) {
  wx.request({
    url: networkTools.APPBaseHost + '/' + reqHaiBaoPath,
    data: param.data,
    method: 'POST',
    dataType: 'json',
    header: networkTools.requestHeader(),
    success: res => {
      param.success(res);
    },
    fail: res => {
      param.fail(res);
    }
  });
};

//orderid查订单
var reqOrderByIdPath = "bizOrder/queryByOrderId";
var orderById = function(param) {
  wx.request({
    url: networkTools.APPBaseHost + '/' + reqOrderByIdPath,
    data: param.data,
    method: 'POST',
    dataType: 'json',
    header: networkTools.requestHeader(),
    success: res => {
      param.success(res);
    },
    fail: res => {
      param.fail(res);
    }
  });
};

module.exports = {
  //order接口
  orderById: orderById,
  //生成海报
  getPoster: getPoster,
  //点赞
  favorite: favorite,
  //同步用户信息
  syncUserInfo: syncUserInfo,
  //用户活动页
  activityUser: activityUser,
  //查询用户可兑换优惠券金额
  fissionSum: fissionSum,
  //兑换优惠券
  exchangeCoupon: exchangeCoupon
}