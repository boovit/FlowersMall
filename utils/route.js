var util = require('util.js');

var OriginExternal_UnderPay = "OriginExternal_UnderPay";
var OriginInside_Under = "OriginInside_Under";
var OriginInside_Order = 'OriginInside_Order';
var OriginInside_Detail = 'OriginInside_Detail';
var OriginInside_PayResult = 'OriginInside_PayResult';

var pageRoute = function(option) {
  if (Object.keys(option).length == 0) {
    return;
  }
  var param = null;
  if('scene' in option){//二维码scene
    const scene = decodeURIComponent(option.scene);
    param = util.urlParamFormat(scene);
  }else if('op' in option){
    param = option;
  }

  if(param != null){
    var op = param.op;
    console.log('页面路由op=', op);
    if (op == 'pay') {
      var orderId = param.id;
      wx.navigateTo({
        url: '../new_order/new_order?orderId=' + orderId + '&origin=' + OriginExternal_UnderPay,
      });
    } else if (op == 'under'){
      wx.navigateTo({
        url: '../custom_sell/custom_sell'
      });
    }else if(op == 'act'){
      var id = param.actId;//服务端给的二维码名没有改为id
      wx.navigateTo({
        url: '../activity/fission/fission?id=' + id
      });
    }
  }
}

module.exports = {
  pageRoute: pageRoute,



  OriginExternal_UnderPay: OriginExternal_UnderPay,
  OriginInside_Under: OriginInside_Under,
  OriginInside_Order: OriginInside_Order,
  OriginInside_Detail: OriginInside_Detail,
  OriginInside_PayResult: OriginInside_PayResult
}