const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var CreateDevice = function() {
  this.screenWidth;
  this.screenHeight;
  this.windowWidth;
  this.windowHeight;
  this.pixelRatio;
  this.statusBarHeight;
  this.navBarHeight = 44;
  this.tabBarHeight = this.navBarHeight;
  this.init();
};

CreateDevice.prototype.init = function() {
  var that = this;
  console.log('default device init!');
  wx.getSystemInfo({
    success: function(res) {
      console.log(res);
      that.screenWidth = res.screenWidth;
      that.screenHeight = res.screenHeight;
      that.windowWidth = res.windowWidth;
      that.windowHeight = res.windowHeight;
      that.pixelRatio = res.pixelRatio;
      that.statusBarHeight = res.statusBarHeight;
    },
  })
};

var defaultDevice = (function() {
  var instance;
  return function() {
    if (!instance) {
      instance = new CreateDevice();
    }
    return instance;
  }
})();

var skuPrice = function(sku) {
  var sum;
  for (var i = 0; i < (sku.length); i++) {
    var tags = sku[i].group;
    for (var j = 0; j < tags.length; j++) {
      var selected = tags[j].selected;
      if (selected) {
        sum += tags[j].skuRealPrice;
        break;
      }
    }
  }
  return sum;
};

var goodsAmount = function(goods, sku) {
  var goodsPrice = goods.goodsRealPrice;
  var skuPrice = this.skuPrice(sku);
  return goodsPrice + skuPrice;
};

var urlParamFormat = function(urlParam){
  let paramArr = urlParam.split('&');
  let obj = {};
  for (let i of paramArr) {
    obj[i.split("=")[0]] = i.split("=")[1];
  }
  return obj;
};

module.exports = {
  urlParamFormat: urlParamFormat,
  formatTime: formatTime,
  goodsAmount: goodsAmount,
  defaultDevice: new defaultDevice()
}