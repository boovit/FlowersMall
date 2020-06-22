var APPBaseHost = 'https://pre-yuandong.yaohr.com';

var requestHeader = function() {
  var sessionID = getApp().globalData.sessionID;
  var version = getApp().globalData.version;
  var header = {
    'sessionID': sessionID,
    'Content-Type': "application/json",
    'version': version
  }
  console.log(header);
  return header;
}

var CreateNetworkCenter = function() {
  this.baseHost = APPBaseHost;
  this.init();
};

CreateNetworkCenter.prototype.init = function() {
  console.log('init network center!');
};

CreateNetworkCenter.prototype.request = function(obj) {
  wx.request({
    url: obj.url,
    method: obj.method,
    header: requestHeader(),
    success: res => {
      console.log(res);
      obj.success(res);
    },
    fail: res => {
      obj.fail(res);
    }
  });
};

CreateNetworkCenter.prototype.login = function(obj) {
  var that = this;
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      console.log(res.code);
      wx.request({
        url: that.baseHost + '/wx/login',
        header: requestHeader(),
        data: {
          code: res.code
        },
        success: res => {
          console.log(res);
          if (res.data.success) {
            var appObj = getApp();
            var sessionID = res.data.data.sessionID;
            var userInfo = res.data.data.wx;
            appObj.globalData.sessionID = sessionID;
            if (userInfo != null && Object.keys(userInfo).length>0){
              appObj.globalData.userInfo = userInfo;
            }
            obj.success(res);
          } else {
            obj.fail(res);
          }
        },
        fail: res => {
          obj.fail(res);
        },
        complete: res => {

        }
      });
    }
  });
}

CreateNetworkCenter.prototype.checkLogin = function(obj) {
  var appObj = getApp();
  var sessionID = appObj.globalData.sessionID;
  if (sessionID != undefined) {
    obj.success();
  } else {
    this.login({
      success: res => {
        obj.success(res);
      },
      fail: res => {
        obj.fail(res);
      }
    });
  }
}


var NetworkCenter = (function() {
  var instance;
  return function() {
    if (!instance) {
      instance = new CreateNetworkCenter();
    }
    return instance;
  }
})();

module.exports = {
  APPBaseHost: APPBaseHost,
  requestHeader: requestHeader,
  networkCenter: new NetworkCenter()
}