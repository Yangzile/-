// miniprogram/pages/login.js
Page({
  handleGetUserinfo(e){
    console.log(e);
    const {userInfo}=e.detail;
    // 把数据保存到本地缓存
    wx.setStorageSync("userInfo",userInfo);
    wx.navigateBack({
      delta: 1, // 回退前 delta(默认为1) 页面
      success: function(res){
        // success
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  }
})