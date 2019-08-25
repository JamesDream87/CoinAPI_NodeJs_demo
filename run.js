function RunInit () {
  const https = require('https');
  var config = require('./config.js')
  var base = '/v1/ohlcv/BITSTAMP_SPOT_BTC_USD/history?'
  var period = '1Day'
  // var start = getDay(-1, '-')
  // var end = new Date().toLocaleDateString()
  var limit = 1
  var split = ''

  if(limit = '' || limit === 0 || limit === null) {
    split = base + 'period_id=' + period + '&time_start=' + start + '&time_end=' + end
  } else {
    split = ''
  }

  var options = {
    "method": "GET",
    "hostname": "rest.coinapi.io",
    "path": split || '/v1/ohlcv/BITSTAMP_SPOT_BTC_USD/history?period_id=1Day&time_start=2013-03-04T00:00:00&time_end=2013-03-24T00:00:00&limit=2500',
    // "path": '/v1/ohlcv/BITSTAMP_SPOT_BTC_USD/history?period_id=1Day&time_start=2013-02-24T00:00:00&time_end=2019-08-24T00:00:00&limit=2500',
    "headers": {'X-CoinAPI-Key': config.config[0].key}
  };

  var request = https.request(options, function (response) {
    var chunks = [];
    // 获得数据
    response.on("data", function (chunk) {
      chunks.push(chunk);

      var data = chunks
      // 转化data，不然全是Buffer
      data = data.toString()
      /**
       * 此处必须使用replace,CoinAPI的数据很多会在里面警察出现00,000的情况，
       * 由于此接口的数据经常出现多余的逗号导致无法转化，只能载入test.json后清洗完毕再处理，处理方法在test.js */ 
      // data = data.replace("0,0","00");
      // 写入json方法
      execute(writeJson, data);
      // 写入数据库
      // execute(WriteSQL, chunks);
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

function WriteSQL (data) {
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
  var  addSql = 'INSERT INTO bitstamp_candles(exchange,start_at,end_at,price_open,price_high,price_low,price_close,volume_traded,trades_count,interval_at) VALUES("BitStamp",?,?,?,?,?,?,?,?,"1D")';
  //执行
  var l = data.length
  for (var i = 0; i < l; ++i){
    var  addSqlParams = [data[i].time_period_start,data[i].time_period_end, data[i].price_open, data[i].price_high, data[i].price_low, data[i].price_close, data[i].volume_traded, data[i].trades_count]
    connection.query(addSql,addSqlParams,function (err, result) {
      if(err){
        console.log('[INSERT ERROR] - ',err.message);
        execute(WirteLog, '[INSERT ERROR] - ',err.message)
        return;
      }
      // 写入历史文件
      execute(WirteLog, JSON.stringify(result)+"\n")
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
  return oYear + str + oMoth + str + oDay;
}

execute(RunInit)