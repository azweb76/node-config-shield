var crypto = require('crypto');

module.exports = setProp;

function setProp (key, val, alg, pwd) {
  // create or update
  var item = this.config.properties[key] || { };

  // if provided, override
  // otherwise use instance option
  // default if not specified
  item.alg = alg || this.options.alg || 'aes-256-ctr';

  if (this.options.noCache !== true) {
    // update cache
    this.cache[key] = val;
  }

  var cipher = crypto.createCipher(item.alg, pwd || this.pwd);

  // serialize as JSON to retain type
  var json = JSON.stringify({ value: val });

  var enc = cipher.update(json, 'utf8', 'hex');
  enc += cipher.final('hex');

  item.value = enc;

  // insert if doesn't exist
  this.config.properties[key] = item;

  return item;
}