var child_process = require('child_process');

function escape(s) {
  if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
    s = "'"+s.replace(/'/g,"'\\''")+"'";
    s = s.replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
      .replace(/\\'''/g, "\\'" ); // remove non-escaped single-quote if there are enclosed between 2 escaped
  }
  return s;
}

function argFromKeyVal(key, val, opts) {
  opts = opts || {};
  var prefix = '--';
  if (key.length === 1) {
    prefix = '-';
  }

  if ((val === true) || (val == null)) {
    return prefix + key;
  }  else if (val === false) {
    return prefix + 'no' + key;
  } else if (typeof(val) === 'object') {
    var a = [];
    for (var j = 0; j < val.length; j++) {
      a.push(argFromKeyVal(key, val[j]));
    }
    return a.join(' ');
  } else {
    if ((key.length === 1) || opts.__spaceForLongArgs___) {
      return prefix + key + ' ' + escape(val);
    } else {
      return prefix + key + '=' + escape(val);
    }
  }

}

function argsListFromObject(args) {
  if (!args) {
    return [];
  }
  var a = [];
  var keys = Object.keys(args);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key[0] === '_') {
      continue;
    }
    var val = args[key];
    a.push(argFromKeyVal(key, val, args));
  }

  if (args._) {
    for (var i = 0; i < args._.length; i++) {
      a.push('' + args._[i]);
    }
  }
  return a;
}

function shellExecAsync(cmd, args, opts) {
  return new Promise(function (fulfill, reject) {
    child_process.execFile(cmd, argsListFromObject(args), opts, function (err, result) {
      if (err) {
        reject(err);
      } else {
        fulfill(result);
      }
    });
  });
}

module.exports = shellExecAsync;
module.exports.argsListFromObject = argsListFromObject;
