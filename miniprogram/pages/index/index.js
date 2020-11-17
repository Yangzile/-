// miniprogram/pages/index/index.js
var wxCharts = require('../../wxcharts.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isYear: false,   // 是否显示年列表
    isDate: false,   // 是否显示日列表
    nowtime: {
      year: "",
      month: "",
      day: ""
    },
    alldata: [],      //全部数据
    yearlist: [],      //年份列表
    currentyear: '',  // 选中的年份 
    currentmonth: '',  // 选中的月份
    currentday: '',  // 选中的日期 
    monthlist: [{     // 月份列表 
      num: 1,
      isAct: false
    }],
    daylist: [{
      num: 1,
      isAct: false,
    }],
    yearcost: [{
      title: "",
      money: 0,
      isAct: true,
      type: "shouru"
    }, {
      title: "",
      money: 0,
      isAct: false,
      type: "zhichu"
    }],
    typedata: {
    },
    month_typedata:{
    },
    screenWidth:0,
    isFristLoading:true,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("一次加载");
     // 获取屏幕宽度
    this.data.screenWidth = wx.getSystemInfoSync().screenWidth;
    let that=this
    // 查询用户是否已经授权
    wx.getSetting({
      success: function (res) {
        // console.log(res)
        // console.log(res.authSetting["scope.userInfo"])
        if (res.authSetting["scope.userInfo"]) {
          // 获取所有数据
          that.getAllbookdata();
        }else{
          wx.showToast({
            title: '请授权登录！',
            icon: 'none',
            mask:true,
            duration: 2000
          })
          
        }

      }
    })
  },
  // 二次加载
  onShow:function(){
    let that=this
    if(this.data.isFristLoading){
      this.data.isFristLoading=false;
      return
    }else{
      console.log("二次加载");
      wx.getSetting({
        success: function (res) {
          // console.log(res)
          // console.log(res.authSetting["scope.userInfo"])
          if (res.authSetting["scope.userInfo"]) {
            // 获取所有数据
            that.getAllbookdata();
          }else{
            wx.showToast({
              title: '请授权登录！',
              icon: 'none',
              mask:true,
              duration: 2000
            })
            
          }
  
        }
      })
    }
  },
  // 控制年列表和日期列表的同时出现顺序
  showItem: function (e) {
    let type = e.currentTarget.dataset.type;
    if (type == 'isYear') {
      this.setData({
        isYear: !this.data.isYear,
        isDate: false,
      })
    } else if (type == 'isDate') {
      this.setData({
        isYear: false,
        isDate: !this.data.isDate,
      })
    }
  },

  // 年份点击选择
  selectYear(e) {
    let ordselect = this.data.currentyear
    let select = e.currentTarget.dataset.year
    // console.log(select);
    if (select == ordselect) {
      return
    }
    this.setData({
      currentyear: select,
    })
    // 调用函数获取月份列表
    // this.getMonthlist(this.data.currentyear);
    // 获取月份列表
    this.getMonthandDayList("monthlist", "currentmonth", this.data.currentyear, 5, 7);
    // 获取整年的数据
    this.getTotalYearData(this.data.currentyear);
  },
  // 月份点击选择
  selectMonth(e) {
    // 获得选中月份
    let selectmon = e.currentTarget.dataset.month;
    let ordmonth = this.data.currentmonth;
    // console.log("月份列表",this.data.monthlist)
    // console.log("选中月份",selectmon)
    // 遍历月份列表，设置选中的月份的isAct
    this.data.monthlist.forEach(v => {
      if (v.num == selectmon) {
        v.isAct = true;
      } else {
        v.isAct = false;
      }

    })
    // 选中相同月份的处理
    if (selectmon == ordmonth) {
      return
    }
    this.setData({
      monthlist: this.data.monthlist,
      currentmonth: selectmon,
    })
    // 获取日期列表函数
    // this.getDaylist(this.data.currentmonth);

    this.getMonthandDayList("daylist", "currentday", (this.data.currentyear + '-' + this.data.currentmonth), 8, 10);
    this.getTotalmonthData((this.data.currentyear + '-' + this.data.currentmonth))
  },
  // 日期点击选择
  selectDate(e) {
    // console.log("日期列表",this.data.daylist)
    // console.log("选中日期",e.currentTarget.dataset.day)
    // console.log(e)
    // 获得选中日期
    let selectday = e.currentTarget.dataset.day;
    let ordday = this.data.currentday;
    // 遍历月份列表，设置选中的月份的isAct
    this.data.daylist.forEach(v => {
      if (v.num == selectday) {
        v.isAct = true;
      } else {
        v.isAct = false;
      }

    })

    if (selectday == ordday) {
      return
    }
    this.setData({
      daylist: this.data.daylist,
      currentday: selectday,
    })
    //  console.log("选中日：",this.data.currentday)
    //  this.getDaylist(this.data.selectday);
  },
  // 获得用户全部记账信息数据
  getAllbookdata() {
    var that = this;
    wx.cloud.callFunction({
      name: "get_book_data",
      data: {},
      success: function (res) {
        console.log("调用云函数成功==>", res)
        // 遍历全部数据年份，显示年份列表
        res.result.data.forEach(v => {
          var y = v.datetime.substring(0, 4);
          if (that.data.yearlist.indexOf(y) == -1) {
            that.data.yearlist.push(y);
          }
        })
        that.data.yearlist.sort((a, b) => a - b) // 升序写法，从小到大
        // console.log("获得的显示年份：", that.data.yearlist)
        // 设置显示年份列表，全部数据，选中最后一个年份
        that.setData({
          yearlist: that.data.yearlist,
          alldata: res.result.data,
          currentyear: that.data.yearlist[that.data.yearlist.length - 1],
        })
        // that.getMonthlist(that.data.currentyear);
        // 获取月份列表
        that.getMonthandDayList("monthlist", "currentmonth", that.data.currentyear, 5, 7);
        // 获取日期列表
        that.getMonthandDayList("daylist", "currentday", (that.data.currentyear + '-' + that.data.currentmonth), 8, 10);
        // console.log("获得的年份对象",that.data.yearlist)
        // 获得当前整年得数据
        that.getTotalYearData(that.data.currentyear);
      },
      fail: function (err) {
        console.log("调用云函数失败==>", err)
      }
    })

  },
  // 获取月份列表(无效)
  getMonthlist(year) {
    let monthlist = [];
    let montharr = [];
    // 遍历所有月份，把出现的月份加入到月份数组中
    this.data.alldata.forEach(v => {
      let month_item = Number(v.datetime.substring(5, 7))
      if (monthlist.indexOf(month_item) == -1 && v.datetime.indexOf(year) != -1) {
        monthlist.push(month_item);
      }

    })
    // 月份列表排序（升序）
    monthlist.sort((a, b) => a - b);
    //还原月份列表结构
    monthlist.forEach(v => {
      montharr.push({
        num: v,
        isAct: false
      });
    })

    montharr[0].isAct = true;
    this.setData({
      monthlist: montharr,
      currentmonth: montharr[0].num,
    })
    // console.log("获得的月份默认对象", montharr[0].num)
    // console.log("获得的月份对象", this.data.monthlist)
    this.getDaylist(this.data.currentmonth);

  },
  // 获取月份日期的列表
  /*   参数：1、DataName 数据列表
        2、Datacurent 默认选中
        3、time 获取月份就是monthlist  ,  获取日期就是daylist
        4、start,end 截取的日期段，月份（5，7）日期(8,10) 
  */
  getMonthandDayList(DataName, Datacurent, time, start, end) {
    let datalist = [];
    let dataarr = [];
    // console.log("time参数：",time)
    // 截取全部数据的时间段
    this.data.alldata.forEach(v => {
      let data_item = Number(v.datetime.substring(start, end))
      if (datalist.indexOf(data_item) == -1 && v.datetime.indexOf(time) != -1) {
        datalist.push(data_item);
      }
    })

    // 排序
    datalist.sort((a, b) => a - b);
    //还原列表结构
    datalist.forEach(v => {
      let num = this.addZero(v).toString();
      dataarr.push({
        num: num,
        isAct: false
      });
    })
    dataarr[0].isAct = true;
    this.setData({
      [DataName]: dataarr,
      [Datacurent]: dataarr[0].num,
    })
    // console.log("获得的合体默认对象", this.data[Datacurent])
    // console.log("获得的合体对象", this.data[DataName])
  },
  // 获取日期列表(无效)
  getDaylist(month) {
    let time = this.data.currentyear + '-' + (month > 10 ? month : '0' + month)
    let daylist = [];
    let dayarr = [];
    // 遍历所有月份，把出现的月份加入到月份数组中
    this.data.alldata.forEach(v => {
      let day_item = Number(v.datetime.substring(8, 10))
      if (daylist.indexOf(day_item) == -1 && v.datetime.indexOf(time) != -1) {
        daylist.push(day_item);
      }

    })

    // 月份列表排序（升序）
    daylist.sort((a, b) => a - b);
    //还原月份列表结构
    daylist.forEach(v => {
      dayarr.push({
        num: v,
        isAct: false
      });
    })
    dayarr[0].isAct = true;
    this.setData({
      daylist: dayarr,
      currentday: dayarr[0].num,
    })
    // console.log("获得的日期默认对象", dayarr[0].num)
    // console.log("获得的日期对象", this.data.daylist)

  },
  // 获取整一年的数据
  getTotalYearData(year) {
    var that = this;
    wx.cloud.callFunction({
      name: "get_book_data",
      data: {
        timeType: 1,
        start: year + "-01-01",
        end: year + "-12-31"
      },
      success: function (res) {
        console.log("调用云函数getTotalYearData成功==>", res)
        let type = ["shouru","zhichu"]
        let typData = {}
        //yearcost整一年的总支出与收入（总数），typData整一年的每一项收入与支出（分开存放）
        type.forEach((v, i) => {
          // 初始化整年的金额，点击，标题
          that.data.yearcost[i].money = 0;
          that.data.yearcost[i].isAct= false;
          if(v=="shouru"){
            that.data.yearcost[i].title="年收入"
          }else{
            that.data.yearcost[i].title="年支出"
          }
          
          typData[v] = [];
          // 遍历一年的数据，分别计算收入与支出，并且保存数据
          res.result.data.forEach(item => {
            if (item.costtype == v) {
              that.data.yearcost[i].money += Number(item.money)
              typData[v].push(item)
            }
          })
          that.data.yearcost[i].money = that.data.yearcost[i].money.toFixed(2)
        })
        // 初始化选中框
        that.data.yearcost[0].isAct=true
        that.setData({
          yearcost: that.data.yearcost,
          typedata: typData
        })
        // 计算各类的总金额 参数(收入类)
        that.countTypeSum(that.data.typedata.shouru)

        console.log('整年的显示的收入与支出:>> ',that.data.yearcost );
        console.log('整年收入与支出数据:>> ', that.data.typedata);
        
      },
      fail: function (err) {
        console.log("调用云函数getTotalYearData失败==>", err)
      }

    })

  },
  // 获取整一个月的数据
  getTotalmonthData(time){
    
    var that = this;
    let allyeardata=this.data.typedata
    let yearcost=this.data.yearcost
    let monthcost=[]
    let month_typedata={}
    // console.log(' allyeardata:>> ',allyeardata );
    for(var key in allyeardata){
      // console.log(' key:>> ',key);
      let monthitem={}
      monthitem.money=0
      monthitem.type=key
      monthitem.isAct=false
      month_typedata[key]=[]
      if(key=="shouru"){
        monthitem.title="月收入"
      }else{
        monthitem.title="月支出"
      }
      allyeardata[key].forEach((v,i)=>{
      
       if( v.month==time){

        monthitem.money+=Number(v.money)
        month_typedata[key].push(v)
       }
      })
      monthcost.push(monthitem)
    }
    

    monthcost[0].isAct=true;
    console.log('整一个月的时间 :>> ', time);
    console.log(' 显示月收入与支出:>> ',monthcost );
    console.log(' 整月收入与支出数据:>> ',month_typedata );
    this.setData({
      yearcost:monthcost,
      month_typedata
    })
    // 计算各类的总金额 参数(收入类)
    that.countTypeSum(that.data.month_typedata.shouru)
  },
  // 计算各类的总金额 参数(收入类或者支出类)
  countTypeSum(data) {
    console.log('绘图数据:>> ', data);
    // 记录所有的类型
    let types = [];
    // 存放图表的数据
    let series = [];
    // 数据遍历，获取到不同的类型，添加到types中
    data.forEach(v => {
      if (types.indexOf(v.ico_title) == -1) {
        types.push(v.ico_title)
      }
    })

    // 类型遍历,定义当前类型的图标数据，绘制图表用
    types.forEach(v => {
      // 定义当前类型的图标数据
      let seriesData = {
        name: v,
        data: 0,
        format: function (value) {
          return v + Number(value * 100).toFixed(2) + "%";
        }
      }
      //  计算各类总金额
      data.forEach(item => {
        if(v == item.ico_title){
          seriesData.data += Number(item.money)
        }
      })
      // 把图表需要的数据加入数组
      series.push(seriesData);
    })

    // 调用绘制图表函数，传入series数据
    if(series.length==0){
      return
    }else{
      // 绘制图表
      this.drawPie(series);  
    }
   
    // console.log('types :>> ', types);
    // console.log('series :>> ', series)
  },
  // 绘制图表 参数(绘制的每项数据对象)
  drawPie(series){
    new wxCharts({
      canvasId: 'pieCanvas',
      type: 'pie',
      series:series,
      width:this.data.screenWidth,
      height: 300,
      dataLabel: true
    });
  },
  initTiem() {
    let date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    let day = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    this.setData({
      nowtime: {
        year: year,
        month: month,
        day: day,
      }
    })
    console.log("当前时间==>", this.data.nowtime)
  },
  // 数字补零函数
  addZero: function (num) {
    return num < 10 ? "0" + num : num;
  },
  // 年/月收入与支出的切换点击事件
  toggleTap: function (e) {
    // 获取当前点击对应的下标
    let index = e.currentTarget.dataset.index;
    let title = e.currentTarget.dataset.title
    // 判断当前点击的是否已激活，是则终止代码
    if (this.data.yearcost[index].isAct) {
      return;
    }

    // 将上一个激活的日份取消
    for (var i = 0; i < this.data.yearcost.length; i++) {
      if (this.data.yearcost[i].isAct) {
        this.data.yearcost[i].isAct = false;
        break;  // 终止循环
      }
    }
    // 将点击的日份激活
    this.data.yearcost[index].isAct = true;

    this.setData({
      yearcost: this.data.yearcost
    })
    // console.log('this.data.yearcost :>> ', this.data.yearcost);
    // console.log('title :>> ', title);
    // console.log('点击 :>> ', this.data.yearcost[index].type);
    // console.log('that.data.typedata :>> ', this.data.typedata);
    // 点击切换，重新绘制图表
   if(title.indexOf("月") == -1){
    this.countTypeSum(this.data.typedata[this.data.yearcost[index].type])
    //  console.log('title.indexOf("月") :>> ', title.indexOf("月"));
   }else{
    // console.log('title.indexOf("月") :>> ', title.indexOf("月"));
     this.countTypeSum(this.data.month_typedata[this.data.yearcost[index].type])
   }

    
  },

});