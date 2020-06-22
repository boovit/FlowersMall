var networkTools = require('../../utils/network.js');

Page({
  data: {

  },

  onLoad: function(opt) {
    this.login();
  },

  login: function() {
    // 登录
    networkTools.networkCenter.login({
      success: res => {
        wx.hideLoading();
        if (res.data.success) {
          var sessionID = res.data.data;
          var appObj = getApp();
          appObj.globalData.sessionID = sessionID;

          wx.switchTab({
            url: '../home/home',
          });
        }else{
          wx.showToast({
            title:'登陆失败',
            icon:'none',
            duration:3000
          })
        }
      },
      fail: res => {
        wx.hideLoading();
      }
    });
  },

  loginClick: function(e) {
    this.login();
  }
});