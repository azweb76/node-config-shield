var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

module.exports = cliMain;

var instance = require('../lib/index.js');

var commands = {
  'get': cmdGet,
  'set': cmdSet,
  'remove': cmdRemove,
  'keys': cmdKeys,
  'save': cmdSave,
  'load': cmdLoad,
  'convert': cmdConvert,
  'help': cmdHelp,
  'exit': cmdExit
};

function cliMain() {
  rl.resume();
  cmdLoad([]);
}

cliMain();

function cmdHelp() {
  rl.write(': Available commands:\r\n');
  Object.keys(commands).forEach(function(cmdName) {
    rl.write(': * ' + cmdName + '\r\n');
  });
  enterCommand();
}

function enterCommand() {
  rl.write('\r\n');
  rl.question('> ', onCommand);
}

function onCommand(lineInput) {
  lineInput = lineInput.replace(/[\r\n]/g, "");
  var parts = lineInput.split(' ');

  var cmd = commands[parts[0]];
  if (!cmd) {
    rl.write(': Command "' + parts[0] + '" not found.\r\n');
    cmdHelp();
    return;
  }

  var partOne = parts[1] || 'null';
  var partTwo = parts.splice(2).join(' ');

  cmd.call(null, partOne, partTwo);
}

function cmdGet(key) {
  var val = instance.getProp(key);
  if (!val) {
    rl.write(': "' + key + '" not found');
  } else {
    rl.write(': ' + JSON.stringify(val, null, 2));
  }

  enterCommand();
}

function cmdSet(key, val) {
  var objVal = val;

  try {
    if (/^[\'\"]/.test(val) === false) { // do not parse if explicitly a string
      objVal = eval('(' + val + ')'); // attempt to parse
    }
  } catch(ex) {
    // store as string
    rl.write(': Error: ' + ex);

    enterCommand();
  }

  instance.setProp(key, objVal);
  rl.write(': stored as type ' + typeof objVal);

  enterCommand();
}

function cmdRemove(key) {
  instance.removeProp(key);

  enterCommand();
}

function cmdKeys() {
  rl.write(': Keys: ' + instance.getKeys());

  enterCommand();
}

function cmdSave() {
  rl.question('enter path of config (enter to use secure-config.json)> ', function (configPath) {
    if (configPath.length === 0) {
      configPath = './secure-config.json';
    }
    rl.write(': saving... ');
    instance.save(configPath);
    rl.write('done');

    enterCommand();
  });

}

function cmdLoad() {
  rl.question('enter path of config (enter to use secure-config.json)> ', function (configPath) {
    if (configPath.length === 0) {
      configPath = './secure-config.json';
    }
    rl.question('enter path of private key (press enter to use private key path in config)> ', function (privateKeyPath) {
      if (privateKeyPath.length === 0) {
        privateKeyPath = null; // use private key in config by default
      }
      rl.write(': loading...');
      instance.load({ configPath: configPath, privateKeyPath: privateKeyPath });
      rl.write('done');

      enterCommand();
    });
  });
}

function cmdConvert() {
  rl.question('enter path of new private key> ', function (privateKeyPath) {
    rl.write(': converting...');
    instance.convert({ privateKeyPath: privateKeyPath });
    rl.write('done. Type `save` to persist to disk');

    enterCommand();
  });
}

function cmdExit() {
  // todo: prompt if change not saved

  rl.write(': Exiting...');
  rl.close();
  process.exit(0);
}