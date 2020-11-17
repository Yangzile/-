// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
// 1. 获取数据库引用
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log("调用云函数getBook！初始化成功")

  try{
    return await db.collection('book_item').get({
      success: function(res) {
        console.log("获取初始数据成功==>"+res)
       },
       fail: function (err) {
        console.log("获取初始数据失败==>"+res)
       } 
    })
  }catch(e){
    console.log(e)
  }

}