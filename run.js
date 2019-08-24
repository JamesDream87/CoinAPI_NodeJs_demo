function RunInit () {
  const https = require('https');

  var base = '/v1/ohlcv/BITSTAMP_SPOT_BTC_USD/history?'
  var period = '1Day'
  var start = '2013-02-24T00:00:00'
  var end = '2013-02-25T00:00:00'
  var limit = 0
  var split = ''

  if(limit = '' || limit === 0 || limit === null) {
    split = base + 'period_id=' + period + '&time_start=' + start + '&time_end=' + end
  } else {
    split = ''
  }

  var options = {
    "method": "GET",
    "hostname": "rest.coinapi.io",
    "path": split || '/v1/ohlcv/BITSTAMP_SPOT_BTC_USD/history?period_id=1Day&time_start=2013-02-24T00:00:00&time_end=2019-08-24T00:00:00&limit=2500',
    // "path": '/v1/ohlcv/BITSTAMP_SPOT_BTC_USD/history?period_id=1Day&time_start=2013-02-24T00:00:00&time_end=2019-08-24T00:00:00&limit=2500',
    "headers": {'X-CoinAPI-Key': '73034021-0EBC-493D-8A00-E0F138111F41'}
  };

  var request = https.request(options, function (response) {
    var chunks = [];
    // 获得数据
    response.on("data", function (chunk) {
      chunks.push(chunk);
      // 写入json方法
      execute(writeJson, chunks);
      // 写入数据库
      execute(WriteSQL, chunks);
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
  fs.writeFile('test.json', data.toString(),  function(err) {
    if (err) {
        return console.error(err);
    }
  })
  console.log('写入成功')
}

function WriteSQL (data) {
  var mysql  = require('mysql');
  var config = require('./config.js')
  console.log(config.config[0].user)
  // mysql 参数 
  var connection = mysql.createConnection({     
    host     : config.config[0].host,       
    user     : config.config[0].user,              
    password : config.config[0].password,       
    port: config.config[0].port,                   
    database: config.config[0].database 
  });
  // 转化data
  data = data.toString()
  data = JSON.parse(data)
  // 转化日期
  var l = data.length
  for (var i = 0; i < l; i++) {
    data[i].time_period_start = new Date(data[i].time_period_start)
    data[i].time_period_end = new Date(data[i].time_period_end)
  }
  
  // 新建连接
  connection.connect();
  // 插入数据
  var  addSql = 'INSERT INTO bitstamp_candles(exchange,start_at,end_at,price_open,price_high,price_low,price_close,volume_traded,trades_count,interval_at) VALUES("BitStamp",?,?,?,?,?,?,?,?,"1D")';
  var  addSqlParams = [data[0].time_period_start,data[0].time_period_end, data[0].price_open, data[0].price_high, data[0].price_low, data[0].price_close, data[0].volume_traded, data[0].trades_count]
  //执行
  connection.query(addSql,addSqlParams,function (err, result) {
    if(err){
      console.log('[INSERT ERROR] - ',err.message);
      return;
    }
  });
  
  connection.end();
}

execute(RunInit)