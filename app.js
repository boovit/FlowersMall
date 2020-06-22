//app.js
App({
  globalData: {
    userInfo: null,
    appWindowSize: {},
    sessionID: '',
    version:'1.2.0'
  },

  onLaunch: function() {
    var that = this;
    this.getAppWindowSize();
    // this.authorApp();
  },

  authorApp:function(){
    wx.authorize({
      scope: 'scope.userInfo',
      success: function(res) {
        console.log('授权成功',res);
      },
      fail: function(res) {
        console.log('授权失败',res);
      },
      complete: function(res) {},
    })
  },

  getAppWindowSize: function() {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        var width = res.windowWidth;
        var height = res.windowHeight;
        that.globalData.appWindowSize = {
          width: width,
          height: height,
        }
        console.log(width, height);
      },
    });
  }
})