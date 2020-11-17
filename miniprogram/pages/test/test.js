// miniprogram/pages/test/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},   // 存在用户信息
    isAuth: false   // 判断是否是授权状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
      // 查询用户是否已经授权
    wx.getSetting({
      success: function(res){
        // console.log(res)
        console.log("是否获取授权：>>",res.authSetting["scope.userInfo"])
        // 判断是否授权，然后调起授权
        if (res.authSetting["scope.userInfo"]){
          wx.getUserInfo({   // 获取用户信息接口
            success: function(r){
              console.log("授权用户的数据:>>",r.userInfo)
              that.setData({
                userInfo: r.userInfo,
                isAuth: true
              })

            }
          })
        }
        
      }
    })
  },
  // 获取用户信息
  onGetUserInfo: function(res){
    console.log(res)
    if (res.detail.userInfo){
      this.setData({
        userInfo: res.detail.userInfo, /*  保存用户信息 */
        isAuth: true /* 标记是否授权 */
      })
    }
  }
  


})