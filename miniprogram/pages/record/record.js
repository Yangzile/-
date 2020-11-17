// miniprogram/pages/record/record.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banner: [1, 50],
    arr: [],
    tabData: [
      {
        title: "支出",
        type: "zhichu",
        isActive: true
      },
      {
        title: "收入",
        type: "shouru",
        isActive: false
      }
    ],
    swiperData: {
      indicatorDots: true, // 指示点的控制
      indicatorColor: "#dbdbdb",// 指示点颜色
      activeColor: "#FEDB5A"   // 选中的指示点颜色
    },
    selsectData:
      [{
        title: "现金",
        type: "xianjin",
        isActive: true
      },
      {
        title: "微信钱包",
        type: "weixinqianbao",
        isActive: false
      },
      {
        title: "支付宝",
        type: "zhifubao",
        isActive: false
      },
      {
        title: "储蓄卡",
        type: "chuxuka",
        isActive: false
      },
      {
        title: "信用卡",
        type: "xingyongka",
        isActive: false
      }
      ],
    dateRange: {
      start: "2020-12-31",
      end: "2020-12-31"
    },

    input_info: {
      datetime: '',
      money: '',
      beizhu: ''
    },
    today: "",
    userInfo:{},
    isAuth: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  // 加载入口
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })

    // 初始化时间选择器
    this.selectDate2();

    // getBook_item云函数调用，加载图标数据
    let that = this; //为了云函数成功函数的数据修改
    wx.cloud.callFunction({
      name: "getBook_item",  //云函数名称
      data: {},              //请求传递的参数
      success: function (res) {
        console.log("调用getBook_item成功！", res);
        wx.hideLoading();
        // 将获取的数据分组
        let data_result = res.result.data;
        let begin = 0; // 获取开始位置
        let end = 8;   //一组8个数据
        let type = [];
        data_result.forEach(v => {
          v.isActive = false
        })
        while (begin < data_result.length) {
          let tmp = data_result.slice(begin, begin + end)
          begin += end;
          type.push(tmp)
        }
        // 修改data中的数据
        that.setData({
          arr: type

        })

      },
      fail: function (err) {
        console.log("调用getBook_item失败！", err);
      }
    })

  },
  // 支出和收入切换标题事件，账户选择的状态切换
  toggleTab: function (e) {
    if (e.currentTarget.dataset.active) {
      console.log("已激活");
      return;
    }
    let index = e.currentTarget.dataset.index;
    let name = e.currentTarget.dataset.name;
    let tabData = this.data[name];
    //  console.log(tabData);
    for (let i = 0; i < tabData.length; i++) {
      if (tabData[i].isActive) {
        tabData[i].isActive = false;
      }

    }
    tabData[index].isActive = true;
    this.setData({
      [name]: tabData
    })

  },
  // 时间选择器初始化(没用)
  selectDate: function () {
    //  获取当前日期
    var now_data1 = new Date();
    var now_data = now_data1.toLocaleDateString().split("/");
    // console.log("原始数据：",now_data1);
    // console.log("转化后的数据:",now_data);
    // 上限时间
    var satrt = now_data[0] - 1 + "-" + now_data[1] + "-" + now_data[2];
    // console.log(satrt);
    // 下限时间
    var end = now_data.join("-");
    this.setData({
      // 初始化时间选择器
      dateRange: {
        satrt: satrt,
        end: end
      },
      // 设置当前显示时间
      today: end
    })
  },
  // 输入框更新输入数据
  getInfo: function (e) {
    let title = e.currentTarget.dataset.title;
    this.data.input_info[title] = e.detail.value

    this.setData({
      input_info: this.data.input_info
    })
  },
  // 补零的方法
  addZore: function (num) {
    return (num < 10 ? "0" + num : num)
  },
  // 时间选择器初始化
  selectDate2: function () {
    let date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let satrt = (year - 1) + "-" + month + "-" + day;
    let end = year + "-" + month + "-" + day;
    // console.log(year+"-"+month+"-"+day);
    this.data.input_info.datetime = end;
    this.setData({
      // 初始化时间选择器
      dateRange: {
        satrt: satrt,
        end: end
      },
      // 设置当前显示时间
      // datetime:end, 
      input_info: this.data.input_info,
      today: end
    })
  },
  // 类型切换
  selectBook: function (e) {

    // 获取点击的图标id和所在位置的数组下标
    let id = e.currentTarget.dataset.id
    let index = e.currentTarget.dataset.index
    let alldata = this.data.arr;
    //重新点击取消选中，点击其他图标切换状态
    if (alldata[index][id].isActive) {
      alldata[index][id].isActive = false
    } else {
      alldata.forEach(function (value) {
        value.forEach(function (data) {
          if (data.isActive) {
            data.isActive = false;
          }
        });
      });
      alldata[index][id].isActive = true;
    }
    this.setData({
      arr: alldata
    })

  },
  // 获取数据，然后添加到数据库
  getdata: function (e) {

    let data = {}
    // 获得支出收入类型
    this.data.tabData.forEach(element => {
      if (element.isActive) {
        data.cost = element.title;
        data.costtype = element.type;
      }
    });
    // 获得类型
    let isSelect = false;
    this.data.arr.forEach(element => {
      element.forEach(value => {

        if (value.isActive) {
          isSelect = true;
          data.ico_title = value.title;
          data.icon_id = value._id;
          data.ico = value.icon_url;
          data.icon_type = value.type;

        }
      });
    });
    // 检查是否选择类型
    if (!isSelect) {
      wx.showToast({
        title: '请选择类型！',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return
    }
    // 获取支付方式
    this.data.selsectData.forEach(element => {
      if (element.isActive) {
        data.selectDate_title = element.title
        data.selectDate_type = element.type
      }
    });

    // 获取用户输入信息
    let input_info_data = this.data.input_info;
    for (var key in input_info_data) {
      data[key] = input_info_data[key];
    }
    //获取当前月份标记  
    let datearr = data["datetime"].split('-');
    let month = datearr[0] + '-' + datearr[1];
    data.month = month;
    // 检查是否全部输入
    let wan = true;
    for (var key in data) {
      if (data[key] == '') {
        wan = false;
      }
    }
    if (!wan) {
      wx.showToast({
        title: '请补充信息！',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return
    }
    // 提示正在保存
    let that = this;
    wx.showLoading({
      title: "正在保存",
      mask: true
    })
    // 调用云函数
    wx.cloud.callFunction({
      name: "add_book_data",  //云函数名称
      data,              //请求传递的参数
      success: function (res) {
        console.log("调用add_book_data成功！", res);
        wx.hideLoading();
        wx.showToast({
          title: "保存成功",
          mask: true,
          duration: 1000,
          icon: 'success',
        })
        that.resetData();
        console.log(that.data)
      },
      fail: function (err) {
        console.log("调用add_book_data失败！", err);
      }
    })


  },
  onHide: function () {
    this.resetData();
  },
  // 保存后初始化每一项
  resetData: function () {
    // 初始化收入和支出标题
    this.data.tabData[0].isActive = true;
    this.data.tabData[1].isActive = false;

    // 初始化类型选择
    this.data.arr.forEach(element => {
      element.forEach(value => {
        if (value.isActive) {
          value.isActive = false;
        }
      });
    });

    // 初始化账户选择
    this.data.selsectData[0].isActive = true
    for (let i = 1; i < this.data.selsectData.length; i++) {
      this.data.selsectData[i].isActive = false
    }



    this.setData({
      tabData: this.data.tabData,
      arr: this.data.arr,
      selsectData: this.data.selsectData,
      input_info: {
        datetime: this.data.today,
        money: "",
        beizhu: ""
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