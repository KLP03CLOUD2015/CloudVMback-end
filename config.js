var fs = require('fs'),
    mysql = require('mysql');

var ssh_options = {
    port: 2222,
    username: 'root',
    password:'cloudvm',
    stdout: fs.createWriteStream('./out.txt')
};


var hosts = [
    'cloudvm2.ddns.net'
];

var connectionpool = mysql.createPool({
    connectionLimit: 1000,
    host: 'cloudvm.ddns.net',
    user: 'root',
    password: '',
    database: 'cloudVM'
});

module.exports.ssh_options = ssh_options;
module.exports.hosts = hosts;
module.exports.connectionpool = connectionpool;