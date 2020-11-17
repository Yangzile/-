// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
// 1. 获取数据库引用
const db = cloud.database();
// 条件查询
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(event);
  // event.timeType
  let sreachdata ={}
  if(event.timeType == 1){
    sreachdata.userInfo =event.userInfo;
    sreachdata.datetime = _.gte(event.start).and(_.lte(event.end))
  }else{
    sreachdata=event;
  }
  console.log(sreachdata);
  try{
    return await db.collection('add_book_data').where(sreachdata).get({
    })
  }catch(e){
    console.log(e)
  }
}