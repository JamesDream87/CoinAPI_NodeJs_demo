# isntall
  ```
  npm install mysql
  ```

# write yourself config.js
  new a file in root folder,named it config.js and wirte your config like this:
  ```
    var config =[{     
    host: 'localhost',       
    user: 'username',              
    password: 'password',       
    port: '3306',                   
    database: 'db',
    key: 'your CoinAPI's key'
  }]

  module.exports.config = config;
  ```

# run function
  write this in the shell
  ```
    node run.js
  ```

# The End

 the DataFeed folder have lots of BTC history data,its cleaned data.
 When did you using the CoinAPI's data,you must very careful the data had many errors.
 Because the returned data have lots of commas was redundance.