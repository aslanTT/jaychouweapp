var app;
var _ = {};
var env = {};

_.info = {
  properties: {
    scene: 0
  }
};

env.scene = function() {
  return this._.info.properties.scene;
}

env.simplifyMode = function() {
  return this._.info.properties.scene == 1154
}

function e(t, n, o) {
  if (t[n]) {
    var e = t[n];
    t[n] = function (t) {
      o.call(this, t, n);
      e.call(this, t);
    };
  } else {
    t[n] = function (t) {
      o.call(this, t, n);
    };
  }
}

var p = App;
App = function (t) {
  e(t, 'onLaunch', appLaunch);
  p(t);
};

function appLaunch(options) {
  app = this;
  env._.info.properties.scene = options.scene
  console.log(env._.info.properties.scene)
}

env._ = _;

module.exports = env;