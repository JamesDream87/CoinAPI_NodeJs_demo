function RunInit () {
  const https = require('https');
  var config = require('./config.js')
  var base = '/v1/ohlcv/BITSTAMP_SPOT_BTC_USD/history?'
  var period = '1HRS'
  // 前期导入历史数据可以使用
  // var start = '2018-12-28T06:00:00'
  // var end = '2019-01-01T00:00:00'
  var start = getDay(-1, '-')
  var end = getDay(0, '-')
  var limit = 1

  var request = https.request({
    "method": "GET",
    "hostname": "rest.coinapi.io",
    "path": base + 'period_id='+ period + '&time_start=' + start + '&time_end=' + end + '&limit=' + limit,
    "headers": {'X-CoinAPI-Key': config.config[0].key}
  }, function (response) {
      var chunks = [];
      // 获得数据
      response.on("data", function (chunk) {
        // 插入数据到数组
        chunks.push(chunk);
        // 写入json方法
        execute(WriteJson, chunks);
        // 写入数据库
        // WriteSQL(chunks, period);
      });
    });
    request.end();
}

function execute (someFunction, value) {
  someFunction(value);
}

function writeJson (data) {
  var fs = require("fs");
  // 写入json文件
  fs.writeFile('test.json', data,  function(err) {
    if (err) {
        return console.error(err);
    }
  })
  console.log('写入成功')
}

function WriteSQL (data ,time) {
  var mysql  = require('mysql');
  var config = require('./config.js')
  // mysql 参数 
  var connection = mysql.createConnection({     
    host     : config.config[0].host,       
    user     : config.config[0].user,              
    password : config.config[0].password,       
    port: config.config[0].port,                   
    database: config.config[0].database 
  });
  
  // 转为json格式
  data = JSON.parse(data)
  // 新建连接
  connection.connect();
  // 插入数据
  var  addSql = 'INSERT INTO bitstamp_candles(exchange,start_at,end_at,price_open,price_high,price_low,price_close,volume_traded,trades_count,interval_at)' +
  'VALUES("BitStamp",?,?,?,?,?,?,?,?,"'+ time +'")';
  console.log(addSql)
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
      execute(WirteLog, JSON.stringify(result)+"\n")
      console.log('插入成功')
    });
  }
  connection.end();
}
// 写入记录
function WirteLog (result) {
  var fs = require("fs");
  result.WriteTime = new Date()
  fs.appendFile('insert.log', result,  function(err) {
    if (err) {
        return console.error(err);
    }
  })
}
// 获取日期
function getDay(num, str) {
  var today = new Date();
  var nowTime = today.getTime();
  var ms = 24*3600*1000*num;
  today.setTime(parseInt(nowTime + ms));
  var oYear = today.getFullYear();
  var oMoth = (today.getMonth() + 1).toString();
  if (oMoth.length <= 1) oMoth = '0' + oMoth;
  var oDay = today.getDate().toString();
  if (oDay.length <= 1) oDay = '0' + oDay;
  return oYear + str + oMoth + str + oDay + 'T00:00:00';
}

execute(RunInit)