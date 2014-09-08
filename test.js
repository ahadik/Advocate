var bcrypt = require('bcrypt-nodejs');

var hash1 = bcrypt.hashSync("alexhadik");
var hash2 = bcrypt.hashSync("alexhadik");

console.log(hash1);
console.log(hash2);

bcrypt.compare("alexhadik", hash1, function(err, res){console.log(res);});
bcrypt.compare("alexhadik", hash2, function(err, res){console.log(res);});