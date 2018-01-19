(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("initialize.js", function(exports, require, module) {
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  require('./main');
});
});

;require.register("main.js", function(exports, require, module) {
'use strict';

require('whatwg-fetch'); // Monkey-patch global environment with fetch

var baseUrl = 'https://joeinn.es/';
window.fetch('projects.json').then(function (data) {
  return data.json();
}).then(function (data) {
  Promise.all(data.map(function (item) {
    return new Promise(function (resolve, reject) {
      window.fetch('https://joeinn.es/' + item + '/project.json').then(function (data) {
        if (data.status === 200) {
          return data.json();
        } else {
          return null;
        }
      }).then(function (data) {
        if (data) {
          var newStory = createCard(data, baseUrl + item);
          resolve(newStory);
        } else {
          resolve();
        }
      }).catch(function (err) {
        console.error(err);
        resolve();
      });
    });
  })).then(function (data) {
    var projects = data.filter(function (item) {
      return item !== undefined;
    });
    projects.forEach(function (item) {
      document.getElementById('portfolio').appendChild(item);
    });
    document.getElementById('loading').style.display = 'none';
  }).catch(function (err) {
    console.error('Something went terribly wrong: ' + err);
  });
}).catch(function (err) {
  console.error('Something went terribly wrong: ' + err);
});

function createCard(data, url) {
  var card = document.createElement('div');
  card.classList.add('fl', 'w-100', 'w-50-ns');

  var article = document.createElement('article');
  article.classList.add('pa1', 'pa3-ns', 'f5', 'f4-ns');

  var title = document.createElement('h2');
  title.classList.add('f2');
  title.innerText = data.title;

  var link = document.createElement('a');
  link.classList.add('link');
  link.href = url;

  var img = document.createElement('img');
  img.classList.add('w-100', 'f5', 'f4-ns', 'measure', 'grow');
  img.src = url + '/' + data.image;
  img.alt = 'Screenshot of ' + data.title;

  link.appendChild(img);

  var summary = document.createElement('p');
  summary.classList.add('measure', 'lh-copy');
  summary.innerText = data.summary;

  var techSection = document.createElement('section');
  var techSectionHeader = document.createElement('h3');
  techSectionHeader.innerText = 'Built using:';

  var techList = document.createElement('ul');
  techList.classList.add('list', 'pl0');
  var techStack = data.technologies_used.sort(function (a, b) {
    return a > b;
  });
  techStack.forEach(function (tech) {
    var thisTech = document.createElement('li');
    thisTech.innerHTML = tech;
    techList.appendChild(thisTech);
  });

  techSection.appendChild(techSectionHeader);
  techSection.appendChild(techList);

  var creditSection = document.createElement('section');
  var creditSectionHeader = document.createElement('h3');
  creditSectionHeader.innerText = 'With thanks to';
  var creditsList = document.createElement('section');
  var creds = data.credits.sort(function (a, b) {
    return a.name > b.name;
  });
  creds.forEach(function (credit) {
    var link = document.createElement('a');
    link.classList.add('link', 'b', 'no-underline', 'black', 'dib', 'pr3', 'hover-' + randomColour());
    link.href = credit.link;
    link.innerText = credit.name;
    creditsList.appendChild(link);
  });

  creditSection.appendChild(creditSectionHeader);
  creditSection.appendChild(creditsList);

  article.appendChild(title);
  article.appendChild(link);
  article.appendChild(summary);
  article.appendChild(techSection);
  article.appendChild(creditSection);
  card.appendChild(article);

  return card;
}

function randomColour() {
  var colours = ['dark-red', 'red', 'orange', 'gold', 'yellow', 'purple', 'light-purple', 'hot-pink', 'dark-pink', 'pink', 'dark-green', 'green', 'navy', 'dark-blue', 'blue', 'light-blue'];
  return colours[Math.floor(Math.random() * colours.length)];
}
});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map