// miniprogram/pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  arr:[],
  dateRange:{
   start:'',
   end:''
  },
  datetime:'', //函数调用的时间
  selecttime:'',  //前端显示的时间
  isFristLoading:true,
  cost:{
    zhichu: 0,
    shouru: 0,
  },
  isToday:true,
  month:'',
  monthcost:{
    zhichu: 0,
    shouru: 0,
  },
  sum:{
    intage:0,
    float:0,
  }
 
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("第一次加载!");
    this.selectDate();  //初始化时间
    let that =this;
    // 查询用户是否已经授权
    wx.getSetting({
      success: function (res) {
        // console.log(res)
        // console.log(res.authSetting["scope.userInfo"])
        if (res.authSetting["scope.userInfo"]) {
        
          
          that.getBookData(that.data.dateRange.end);  //获取某天记账数据
          that.getBook_MonthData(that.data.month);    //获取整月记账数据
         
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
  onShow:function(){
    if(this.data.isFristLoading){
      this.data.isFristLoading=false;
      return
    }else{
      console.log("二次加载");
      this.getBookData(this.data.datetime);
      this.getBook_MonthData(this.data.month);
    }
    
  },
  // 设置选中时间
  setDate:function (e) {
      let selecttime='';
      let date =new Date();
      let year=date.getFullYear();
      let month = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
      let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(); 

      let datearr=e.detail.value.split("-"); //选择日期的数组
      // let selectdate =  e.detail.value.split('-');
      let nowmonth=datearr[0]+'-'+datearr[1]; //选中的年月
      //判断前端日期是否同年
      if (year==datearr[0]) {
        selecttime=datearr[1]+'月'+datearr[2]+'日';
      }else{
        selecttime=datearr[0]+'年'+datearr[1]+'月'+datearr[2]+'日';
      }
      let before=this.data.month

      // if(qian != nowmonth){
      //   this.getBook_MonthData(nowmonth);  //切换时调用，获取当月的记录
      // }
      this.setData({
        // 修改当前显示时间为选中时间
        datetime:e.detail.value,  //函数参数日期
        selecttime:selecttime,  //前端显示日期
        month:nowmonth,         //选中的年月
      })
      // console.log("选中日期：",e.detail.value)
      // console.log("选中月份：",this.data.month)
      // this.onShow();
      this.getBookData(e.detail.value); //切换时调用选择日期，获取当前的记录
      if(this.data.month != before){
          this.getBook_MonthData(this.data.month);  //切换时调用，获取当月的记录
      }
      
  },
  // 初始化时间
  selectDate:function () {
    //  获取当前日期
    let date=new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(); 
    // // 上限时间
    let satrt=(year-1)+"-"+month+"-"+day;
    // // 下限时间
    let end=year+"-"+month+"-"+day;
    //当天日期
    let today=month+"月"+day+'日';
    //当月
    let nowmonth=year+"-"+month;
    this.setData({
      // 初始化时间选择器
      dateRange:{
        satrt:satrt,
        end:end
      },
      // 设置当前显示时间
      datetime:end ,
      selecttime:today,
      month:nowmonth
    })
    console.log("初始化时间（参数）",this.data.datetime);
    console.log("初始化时间（前端）",this.data.selecttime);
    console.log("初始化当前月",this.data.month);
  },
  // 获取当天的记账记录
  getBookData:function(time){
    console.log("云函数获取的日期："+time);
    wx.showLoading({
      title: '加载中',
      mask:true,
    })
    let that=this;
    // 初始化本日支出与收入
    this.data.cost.zhichu=0;
    this.data.cost.shouru=0;
    // 调用云函数get_book_data获取选择某天的值
    wx.cloud.callFunction({
      name:"get_book_data",  //云函数名称
      data:{
        datetime:time //请求传递的参数
      },              
      success:function (res) {
         // 数据获取成功，关闭加载框
        wx.hideLoading();
        console.log("调用云函数get_book_data成功！");
        res.result.data.forEach(v => {
           v.money =Number(v.money).toFixed(2);
           that.data.cost[v.costtype]+=Number(v.money);;
        });
        //设置千分位
        that.data.cost.shouru=that.data.cost.shouru.toLocaleString();
        that.data.cost.zhichu=that.data.cost.zhichu.toLocaleString();
          // 判断选择的日期是否是当天
          if(time == that.data.dateRange.end){
           that.data.isToday = true
           }else{
           that.data.isToday = false
           }
     
        that.setData({
          arr:res.result.data,
          cost:that.data.cost,
          isToday:that.data.isToday,
        })
        console.log("云函数返回的当天数据：",res.result.data);
        console.log("前端arr数据：",that.data.arr);
      },fail: function(err) {
        wx.hideLoading();
        console.log("调用云函数get_book_data失败！"+err);
      }
    })
  },
  // 获取当月记账
  getBook_MonthData:function(month){
    this.data.monthcost.shouru=0;
    this.data.monthcost.zhichu=0;
    let that=this;
    // console.log("云函数获取的月份："+month);
    // 调用云函数
    wx.cloud.callFunction({
      name:"get_book_data",  //云函数名称
      data:{
        month:month //请求传递的参数
      },              
      success:function (res) {
        wx.hideLoading();
        console.log("调用云函数getBook_MonthData成功！");
        // console.log(res);
        res.result.data.forEach(v => {
          //  v.money =Number(v.money).toFixed(2);
           that.data.monthcost[v.costtype]+=Number(v.money);
        });
        
        that.data.monthcost.shouru=that.data.monthcost.shouru.toFixed(2);
        that.data.monthcost.zhichu=that.data.monthcost.zhichu.toFixed(2);
        let sum = Number(Number(that.data.monthcost.shouru)-Number(that.data.monthcost.zhichu)).toFixed(2)
        let sumarr=sum.toString().split('.');
        that.data.sum.intage=sumarr[0];
        that.data.sum.float=sumarr[1];
        
        that.setData({
          monthcost:that.data.monthcost,
          sum:that.data.sum        
        })
        console.log("云函数返回当月的数据：",res.result.data);
        console.log("云函数返回当月的支出与收入：",that.data.monthcost);
        console.log("云函数返回当月的结余：",that.data.sum);
        // console.log("前端monthcost数据：",that.data.monthcost);
      },fail: function(err) {
        wx.hideLoading();
        console.log("调用云函数getBook_MonthData失败！"+err);
      }
    })
  }
 

})