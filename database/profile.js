const pg = require('./index.js').pg;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

let randomEmail = () => {
  let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
  let email = '';
  for(var i = 0; i < 6; i++) {
    email += letters[getRandomInt(0, letters.length)];
  }
  email += '@';
  for(var i = 0; i < 6; i++) {
    email += letters[getRandomInt(0, letters.length)];
  }
  email += '.com';
  return email;
}

let randomPhoneNumber = () => {
  let numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let phone = '';
  for(var i = 0; i < 11; i++) {
    phone += numbers[getRandomInt(0, numbers.length)];
  }
  return phone;
}

let createRandomUser = () => {
  let names = ['John', 'Mike', 'Cody', 'Jarrod', 'Santiago', 'Aaron', 'Ginger', 'Larry', 'Albert'];
  let lastNames = ['Adamas', 'Xu', 'Iraola', 'Schnidler', 'Powell', 'Gimenez', 'Catania'];
  let phoneNumber = randomPhoneNumber();
  let password = '11111111';
  let email = 'sass@sass.com';
  let avatar_url = ['https://static.pexels.com/photos/20787/pexels-photo.jpg', 'http://r.ddmcdn.com/s_f/o_1/cx_0/cy_0/cw_300/ch_300/w_300/APL/uploads/2014/10/kitten-cuteness300.jpg',
    'https://www.nationalgeographic.com/content/dam/animals/thumbs/rights-exempt/mammals/d/domestic-dog_thumb.jpg',
    'https://i.ytimg.com/vi/SfLV8hD7zX4/maxresdefault.jpg'
  ];
  let user = {}
  user.username = names[getRandomInt(0, names.length)];
  user.first_name = user.username;
  user.last_name = lastNames[getRandomInt(0, lastNames.length)];
  user.phone = phoneNumber;
  user.password = password;
  user.email = randomEmail();
  user.avatar_url = avatar_url[getRandomInt(0, avatar_url.length)];

  return user;
}

let insertRandomUsersInDB = () => {
  for(var i = 0; i < 30; i++) {
    let user = createRandomUser();
    pg('users').insert(user).then((res) => {
      console.log('knex res', res);
    }).catch((err) => {
      console.log('knex ERROR', err);
    });
  }
}


module.exports = {
  insertRandomUsersInDB: insertRandomUsersInDB,

  getUserInfo: (userId, callback) => {
    pg.table('users')
      .where({id: userId})
      .select('id', 'username', 'email', 'phone', 'first_name', 'last_name', 'created_at', 'verified', 'avatar_url')
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error, null);
      });
  },

  getBalance: (userId, callback) => {
    pg.table('balance')
      .where({user_id: userId})
      .select('*')
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error, null);
      });
  },

  getPayeeWallets: (username, callback) => {
    pg.table('users')
      .where({username: username})
      .select('*')
      .then(result => {
        console.log(result);
        console.log(result[0].id)
        return result[0].id;
      }).then(id => {
        pg.table('balance')
        .where({user_id: id})
        .select('*')
        .then(result => {
          callback(null, result);
        })
        .catch(error => {
          callback(error, null);
        });
      })
      .catch((error) => {
        return error;
      });
  },

  getProfileDataByUsername: (username) => {
    return pg.table('users')
      .where({username: username})
      .select('id', 'username', 'first_name', 'last_name', 'created_at', 'avatar_url')
      .limit(1)
  },

  getUserPhoneNumber: (userId) => {
    return pg.table('users')
      .where({ id: userId })
      .select('phone', 'verified')
      .then(row => row[0])
  },

  updatePhoneNumber: (phoneNumber, userId) => {
    return pg.table('users')
      .where('id', userId)
      .returning(['phone', 'id', 'verified'])
      .update({ phone: phoneNumber })
  },

  verifyUserPhone: (userId) => {
    return pg.table('users')
      .where('id', userId)
      .returning(['id', 'verified'])
      .update({ verified: true })
  }
};