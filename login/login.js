const AV = require('../utils/av-core-min');
const { User } = require('../utils/av-core-min');

let logining = false;
module.exports = async function() {
  if (logining) {
    while (logining) {
      await delay(500)
    }
    return User.current();
  }
  logining = true;
  var user = await AV.User.loginWithWeapp();
  logining = false;
  return user;
}

function delay(milSec) {
  return new Promise(resolve => {
    setTimeout(resolve, milSec)
  })
}
