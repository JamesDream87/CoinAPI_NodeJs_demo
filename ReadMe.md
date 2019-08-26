# isntall
  ```
  npm install mysql
  ```

# write yourself config.js
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