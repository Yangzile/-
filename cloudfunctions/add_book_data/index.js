// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db =cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log("调用云函数成功！添加数据")
  // console.log("event+++>",event)
 
  try{
    return await db.collection('add_book_data').add({
      data:event,
      success: function(res) {
        console.log("添加成功！"+res)
       },
       fail: function (err) {
        console.log("添加失败！"+res)
       } 
    })
  }catch(e){
    console.log(e)
  }
}