const { User, Cloud } = require('../utils/av-core-min');
const config = require('../config.js');
const login = require('../login/login');
const env = require('./env')
let platform = null;

/**
 * 请求API接口
 * @param  {String} path   请求路径
 * @param  {Objece} params 参数
 * @return {Promise}       包含抓取任务的Promise
 */
module.exports = async function (path, params) {
  if (!params) params = {};
  params.version = config.version;
  params.versionCode = config.versionCode;
  if (platform == null) {
    var res = wx.getSystemInfoSync()
    if (res && res.AppPlatform) {
      platform = res.AppPlatform;
    } else {
      platform = 'wechat';
    }
  }
  let scene = env.scene()
  let simplifyMode = env.simplifyMode()
  params.platform = platform;
  params.scene = scene
  var user = User.current();
  if (!user && !simplifyMode) {
    await login();
  } 
  return request(path, params);
}

function request(path, params) {
  return new Promise((resolve, reject) => {
    Cloud.run(path, JSON.stringify(params)).then(result=>{
      resolve(result);
    }).catch(e=>{
      reject(e);
    });
  });
}

