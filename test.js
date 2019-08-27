var fs = require("fs");
var mysql  = require('mysql');
var config = require('./config.js')
var time = '1H'
// mysql 参数 
var connection = mysql.createConnection({
  host     : config.config[0].host,       
  user     : config.config[0].user,              
  password : config.config[0].password,       
  port: config.config[0].port,                   
  database: config.config[0].database 
});
// 读取Json文件
var data = fs.readFileSync('./DataFeed/BTC-1H-2019.json');

// 转为json格式
data = JSON.parse(data)
// 新建连接
connection.connect();
// 插入数据
var  addSql = 'INSERT INTO bitstamp_candles(exchange,start_at,end_at,price_open,price_high,price_low,price_close,volume_traded,trades_count,interval_at)' +
  'VALUES("BitStamp",?,?,?,?,?,?,?,?,"'+ time +'")';
//执行
var l = data.length
for (var i = 0; i < l; ++i){
  var  addSqlParams = [
      data[i].time_period_start,
      data[i].time_period_end,
      data[i].price_open,
      data[i].price_high,
      data[i].price_low,
      data[i].price_close,
      data[i].volume_traded,
      data[i].trades_count
    ]
  
  connection.query(addSql,addSqlParams,function (err, result) {
    if(err){
      console.log('[INSERT ERROR] - ',err.message);
      execute(WirteLog, '[INSERT ERROR] - ',err.message)
      return;
    }
    // 写入历史文件
    // execute(WirteLog, JSON.stringify(result)+"\n")
  });
  console.log('写入成功')
}
connection.end();

function execute (someFunction, value) {
  someFunction(value);
}

function WirteLog (result) {
  var fs = require("fs");
  result.WriteTime = new Date()
  fs.appendFile('insert.log', result,  function(err) {
    if (err) {
        return console.error(err);
    }
  })
}

