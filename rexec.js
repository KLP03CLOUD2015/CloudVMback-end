//backend_bridge.js
var rexec = require('remote-exec');
var fs = require('fs');
var async = require('async');

 
// see documentation for the ssh2 npm package for a list of all options  
var ssh_options = {
    port: 2222,
    username: 'root',
    password:'cloudvm',
    stdout: fs.createWriteStream('out.txt')
};
 
var hosts = [
    'cloudvm.ddns.net'
];
 
var cmds = [
    'xe vm-list name-label=centos-template --minimal'
];

module.exports.createInstance = function(os,nama_instance,callback)
{
    cmds=['xe vm-clone vm='+os+' new-name-label='+nama_instance];
    rexec(hosts, cmds, ssh_options, function(err){
        if (err) {
            console.log(err);
            callback(err);
        } else {
            console.log('a vm has been created');
            callback(null,0);

        }
    });
};



module.exports.getInstanceUUID = function(nama_instance,callback)
{
    cmds=['xe vm-list name-label='+nama_instance+' --minimal'];
    rexec(hosts, cmds, ssh_options, function(err){
        if (err) {
            console.log(err);
            callback(err);
        } else {
            var uuid_vm = fs.readFileSync('out.txt','utf8');
            callback(null,uuid_vm);
        }
     });
};

module.exports.scaleInstance = function(cpu,memori,storage,uuid,nama_instance,callback)
{
    cmds=[   
            'xe vm-param-set VCPUs-max='+cpu+' uuid='+uuid,
            'xe vm-param-set VCPUs-at-startup='+cpu+' uuid='+uuid,
            'xe vm-param-set memory-static-min=0 uuid='+uuid,
            'xe vm-param-set memory-dynamic-min=1024 uuid='+uuid,
            'xe vm-param-set memory-static-max='+memori+'GiB uuid='+uuid,
            'xe vm-param-set memory-dynamic-max='+memori+'GiB uuid='+uuid,
            'resize_vm_disk '+nama_instance+' '+storage
        ];
        rexec(hosts, cmds, ssh_options, function(err){
        if (err) {
            console.log(err);
            callback(err);
        } else {
            console.log("new vm configured successfully..");
            callback(null,uuid);
        }
     });
};

module.exports.getInstanceIP = function(uuid,callback)
{
    cmds=[   
            'xe vm-param-get uuid='+uuid+'  param-name=networks'
        ];
        rexec(hosts, cmds, ssh_options, function(err){
        if (err) {
            console.log(err);
            callback(err);
        } else {
            var ipstring = fs.readFileSync('out.txt','utf8');
            var ip = ipstring.split(";");
            var ip2 = ip[0].split(":");
            console.log(ip2[1]);
            callback(null,ip2[1]);
        }
     });
};

module.exports.deleteInstance = function(uuid,callback)
{
    cmds=[   
            'xe vm-uninstall uuid='+uuid+'  force=true'
        ];
        rexec(hosts, cmds, ssh_options, function(err){
        if (err) {
            console.log(err);
            callback(err);
        } else {
            console.log("vm is deleted..")
            callback(null,uuid);

        }
     });
};

