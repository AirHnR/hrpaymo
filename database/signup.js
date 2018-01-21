const pg = require('./index.js').pg;
const bcrypt = require('bcrypt');
const saltRounds = 10;

const newUserSignup = function(user, cb) {
  return new Promise ((resolve, reject) => {
    bcrypt.hash(user.password, saltRounds, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    })
  }).then(result => {
    let userId;
    let balanceInserts = [];
  
    let userInfo = {
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      password: result,
      phone: user.phone,
      email: user.email,
      avatar_url: user.avatarUrl ? signupData.avatarUrl : null
    }
    return pg.insert(userInfo, 'id').into('users')
    .then(id => {
      userId = id[0];
      for(let i = 0; i < user.wallets.length; i++) {
        balanceInserts.push({
          user_id: userId,
          amount: 100,
          currency_type: user.wallets[i]
        });
      }
      pg.batchInsert('balance', balanceInserts, user.wallets.length);
      return userId;
    }).then((userId) => {
      return userId;
    });
  }).catch (err => err);
}


module.exports = {
  newUserSignup: newUserSignup
}