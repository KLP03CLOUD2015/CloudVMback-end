var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    mysql = require('mysql'),
    crypto = require('crypto'),
    cors = require('cors'),
    uuid = require('node-uuid'),
    rexec = require('remote-exec'),
	fs = require('fs'),
	async = require('async'),
	bridge = require("./rexec.js");




var ssh_options = {
    port: 2222,
    username: 'root',
    password:'cloudvm',
    stdout: fs.createWriteStream('out.txt')
};

var hosts = [
    'cloudvm.ddns.net'
];
 
 


var connectionpool = mysql.createPool({
    connectionLimit: 1000,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cloudVM'
});

app.listen(8183);


/*router.use(function(req,res,next){
	console.log(req.method,req.url);
	next();

});*/
app.use(bodyParser.urlencoded({
    extended: true
})); //support x-www-form-urlencoded
app.use(bodyParser.json());
app.use(expressValidator());
app.use(cors());



var user_router = express.Router();
var user_list = user_router.route('/list');
var user_register = user_router.route('/register');
var user_login = user_router.route('/login');
var user_edit = user_router.route('/edit');
var user_delete = user_router.route('/delete');
var user_profile = user_router.route('/profile');
var user_instances = user_router.route('/instances');
var management_router = express.Router();
var instance_router = express.Router();
var instance_create = instance_router.route('/create');
var instance_delete = instance_router.route('/delete');
var instance_list = instance_router.route('/list');
var instance_info = instance_router.route('/info');
var instance_edit = instance_router.route('/edit');


app.use('/user', user_router);
app.use('/instance', instance_router);




user_list.get(function(req, res, next) {

    connectionpool.getConnection(function(err, connection) {

        if (err) {
            console.error('CONNECTION ERROR:', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            var sql = 'SELECT * FROM user ORDER BY id_user';
            console.log(sql)
            connection.query(sql, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statuscode = 500;
                    res.send({
                        result: 'error',
                        err: err.code
                    });
                }
                res.send({
                    result: 'success',
                    err: '',
                    fields: fields,
                    json: rows,
                    length: rows.length
                });
                connection.release();
            });

        }

    });
});



user_register.post(function(req, res, next) {

    /*lengkapin validasinya lagi */
    req.assert('nama', 'Nama harus diisi').notEmpty();
    req.assert('email', 'Alamat email harus valid').isEmail();
    req.assert('password', 'Password harus karakter atau angka dengan panjang 6-20').len(6, 20);
    req.assert('no_telp', 'Nomor telepon harus diisi dan berisi angka saja').notEmpty();
    req.assert('nama_perusahaan', 'Nama perusahaan harus diisi dan berisikan angka atau huruf saja').notEmpty();
    req.assert('alamat', 'Alamat harus diisi').notEmpty();
    req.assert('nama_cc', 'Nama pada Kartu Kredit harus diisi').notEmpty().isAlpha();
    req.assert('alamat_cc', 'Alamat pada Kartu harus Kredit diisi').notEmpty();
    req.assert('nomor_cc', 'Nomor Kartu harus Kredit diisi').notEmpty().isNumeric();
    req.assert('nomor_vcv', 'Nomor VCV harus diisi').notEmpty().isNumeric().len(3);
    req.assert('bulan_expire', 'Bulan expire kartu kredit harus diisi').notEmpty().isInt({
        min: 1,
        max: 12
    });
    req.assert('tahun_expire', 'Tahun expire kartu kredit harus diisi').notEmpty().isInt();

    var errors = req.validationErrors();
    if (errors) {
        res.status(200);
        res.send(errors);
        console.log(errors);
        return;
    }
    var data = {
        nama_user: req.body.nama,
        email_user: req.body.email,
        password_user: req.body.password,
        no_telp_user: req.body.no_telp,
        nama_perusahaan_user: req.body.nama_perusahaan,
        alamat_user: req.body.alamat,
        nama_cc_user: req.body.nama_cc,
        alamat_cc_user: req.body.alamat_cc,
        nomor_cc_user: req.body.nomor_cc,
        nomor_vcv_user: req.body.nomor_vcv,
        expire_month_cc_user: req.body.bulan_expire,
        expire_year_cc_user: req.body.tahun_expire
    };

    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION ERROR:', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            var sql = 'INSERT INTO user SET ?';
            console.log(sql)
            connection.query(sql, data, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statuscode = 500;
                    res.send({
                        result: 'error',
                        err: err.code
                    });
                }
                res.send([{
                    msg: "registrasi berhasil"
                }]);
                connection.release();
            });

        }

    });
});




user_edit.post(function(req, res, next) {

    var id_user = req.body.id_user;
    var token = req.body.token;

    /*lengkapin validasinya lagi */
    req.assert('nama', 'Nama harus diisi').notEmpty();
    req.assert('email', 'Alamat email harus valid').isEmail();
    req.assert('password', 'Password harus karakter atau angka dengan panjang 6-20').len(6, 20);
    req.assert('no_telp', 'Nomor telepon harus diisi dan berisi angka saja').notEmpty();
    req.assert('nama_perusahaan', 'Nama perusahaan harus diisi dan berisikan angka atau huruf saja').notEmpty();
    req.assert('alamat', 'Alamat harus diisi').notEmpty();
    req.assert('nama_cc', 'Nama pada Kartu Kredit harus diisi').notEmpty().isAlpha();
    req.assert('alamat_cc', 'Alamat pada Kartu harus Kredit diisi').notEmpty();
    req.assert('nomor_cc', 'Nomor Kartu harus Kredit diisi').notEmpty().isNumeric();
    req.assert('nomor_vcv', 'Nomor VCV harus diisi').notEmpty().isNumeric().len(3);
    req.assert('bulan_expire', 'Bulan expire kartu kredit harus diisi').notEmpty().isInt({
        min: 1,
        max: 12
    });
    req.assert('tahun_expire', 'Tahun expire kartu kredit harus diisi').notEmpty().isInt();

    var errors = req.validationErrors();
    if (errors) {
        res.status(200);
        res.send(errors);
        return;
    }
    var data = {
        nama_user: req.body.nama,
        email_user: req.body.email,
        password_user: req.body.password,
        no_telp_user: req.body.no_telp,
        nama_perusahaan_user: req.body.nama_perusahaan,
        alamat_user: req.body.alamat,
        nama_cc_user: req.body.nama_cc,
        alamat_cc_user: req.body.alamat_cc,
        nomor_cc_user: req.body.nomor_cc,
        nomor_vcv_user: req.body.nomor_vcv,
        expire_month_cc_user: req.body.bulan_expire,
        expire_year_cc_user: req.body.tahun_expire
    };
    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION ERROR:', err);
            res.statusCode = 504;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {

            var validate_sql = 'SELECT email_user , password_user from user where id_user = ' + id_user;
            var validate_result;

            connection.query(validate_sql, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statuscode = 500;
                    res.send({
                        result: 'error',
                        err: err.code
                    });
                }
                if (rows.length > 0) {
                    hmac = crypto.createHmac('sha256', '12jh34k1wgh5w4g3hg243g423jjh4k324c2g3g4c');
                    hmac.update(rows[0].email_user);
                    hmac.update(rows[0].password_user);
                    var _token = hmac.digest('hex');
                    if (_token == token) {
                        var sql = 'UPDATE  user set ? WHERE ?';
                        connection.query(sql, [data, {
                            id_user: id_user
                        }], function(err, rows, fields) {
                            if (err) {
                                console.error(err);
                                res.statuscode = 500;
                                res.send({
                                    result: 'error',
                                    err: err.code
                                });
                            }
                            res.send({
                                result: 'success',
                                msg: 'update data berhasil',
                                err: '',
                                fields: fields,
                                json: rows,
                                length: rows.length
                            });
                        });
                    } else {
                        res.send({
                            result: 'failed',
                            msg: 'autentikasi gagal',
                            err: 'token error',
                        });
                    }

                }
                connection.release();
            });


        }

    });

});


user_login.post(function(req, res, next) {
    req.assert('email', 'Username tidak boleh kosong').notEmpty();
    req.assert('password', 'Password tidak boleh kosong').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.status(422).json(errors);
        return;
    }

    var email = req.body.email;
    var password = req.body.password;


    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION ERROR:', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            var sql = 'SELECT id_user,email_user,password_user FROM user where email_user= "' + email + '"and password_user = "' + password + '"';
            console.log(sql)
            connection.query(sql, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statuscode = 500;
                    res.send({
                        result: 'error',
                        err: err.code
                    });
                }
                if (rows.length > 0) {
                    console.log(rows[0]);
                    hmac = crypto.createHmac('sha256', '12jh34k1wgh5w4g3hg243g423jjh4k324c2g3g4c');
                    hmac.update(rows[0].email_user);
                    hmac.update(rows[0].password_user);
                    var token = hmac.digest('hex');
                    res.send({
                        result: 'success',
                        err: '',
                        token: token,
                        id_user: rows[0].id_user
                    });
                } else {
                    res.send({
                        result: 'failed',
                        err: 'email tidak ditemukan',
                    });
                }

                connection.release();
            });

        }

    });
});


user_delete.delete(function(req, res, next) {

    var id_user = req.id_user;


    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION ERROR:', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            var sql = 'delete from user where id_user= "' + id_user + '"';
            console.log(sql)
            connection.query(sql, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statuscode = 500;
                    res.send({
                        result: 'error',
                        err: err.code
                    });
                } else {
                    res.send({
                        result: 'success',
                        err: '',
                        msg: 'user telah di hapus'
                    });
                }

                connection.release();
            });

        }

    });
});

user_profile.post(function(req, res, next) {

    var id_user = req.body.id_user;
    var token = req.body.token


    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION ERROR:', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            var validate_sql = 'SELECT email_user , password_user from user where id_user = ' + id_user;
            var validate_result;

            connection.query(validate_sql, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statuscode = 500;
                    res.send({
                        result: 'error',
                        err: err.code
                    });
                }
                if (rows.length > 0) {
                    hmac = crypto.createHmac('sha256', '12jh34k1wgh5w4g3hg243g423jjh4k324c2g3g4c');
                    hmac.update(rows[0].email_user);
                    hmac.update(rows[0].password_user);
                    var _token = hmac.digest('hex');
                    if (_token == token) {
                        var sql = 'select id_user,nama_user,email_user,no_telp_user,nama_perusahaan_user,alamat_user,nama_cc_user,alamat_cc_user,nomor_cc_user,nomor_vcv_user,expire_month_cc_user,expire_year_cc_user from user where id_user= "' + id_user + '"';
                        console.log(sql)
                        connection.query(sql, function(err, rows, fields) {
                            if (err) {
                                console.error(err);
                                res.statuscode = 500;
                                res.send({
                                    result: 'error',
                                    err: err.code
                                });
                            } else {
                                res.send({
                                    result: 'success',
                                    err: '',
                                    json: rows
                                });
                            }

                            connection.release();
                        });
                    } else {
                        res.send({
                            result: 'failed',
                            msg: 'autentikasi gagal',
                            err: 'token error',
                        });
                    }
                }

            });
        }

    });
});


user_instances.post(function(req, res, next) {

    var id_user = req.body.id_user;
    var token = req.body.token


    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION ERROR:', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            var validate_sql = 'SELECT email_user , password_user from user where id_user = ' + id_user;
            var validate_result;

            connection.query(validate_sql, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statuscode = 500;
                    res.send({
                        result: 'error',
                        err: err.code
                    });
                }
                if (rows.length > 0) {
                    hmac = crypto.createHmac('sha256', '12jh34k1wgh5w4g3hg243g423jjh4k324c2g3g4c');
                    hmac.update(rows[0].email_user);
                    hmac.update(rows[0].password_user);
                    var _token = hmac.digest('hex');
                    if (_token == token) {
                        var sql = 'select * from instances where id_user= "' + id_user + '"';
                        console.log(sql)
                        connection.query(sql, function(err, rows, fields) {
                            if (err) {
                                console.error(err);
                                res.statuscode = 500;
                                res.send({
                                    result: 'error',
                                    err: err.code
                                });
                            } else {
                                res.send({
                                    result: 'success',
                                    err: '',
                                    json: rows
                                });
                            }

                            connection.release();
                        });
                    } else {
                        res.send({
                            result: 'failed',
                            msg: 'autentikasi gagal',
                            err: 'token error',
                        });
                    }
                }

            });
        }

    });
});


instance_create.post(function(req, res, next) {

    req.assert('nama_instance', 'Nama node harus diisi').notEmpty();
    req.assert('id_plan', 'Pilih plan yang ingin digunakan').notEmpty();


    var errors = req.validationErrors();
    if (errors) {
        res.status(200);
        res.send(errors);
        return;
    }
    //var vm_id = uuid.v1();
    id_user = req.body.id_user,
        token = req.body.token,
        nama_instance = req.body.nama_instance,
        id_plan = req.body.id_plan,
        connectionpool.getConnection(function(err, connection) {
            if (err) {
                console.error('CONNECTION ERROR:', err);
                res.statusCode = 503;
                res.send({
                    result: 'error',
                    err: err.code
                });
            } else {
                var validate_sql = 'SELECT email_user , password_user from user where id_user = ' + id_user;
                var validate_result;

                connection.query(validate_sql, function(err, rows, fields) {
                    if (err) {
                        console.error(err);
                        res.statuscode = 500;
                        res.send({
                            result: 'error',
                            err: err.code
                        });
                    }
                    if (rows.length > 0) {
                        hmac = crypto.createHmac('sha256', '12jh34k1wgh5w4g3hg243g423jjh4k324c2g3g4c');
                        hmac.update(rows[0].email_user);
                        hmac.update(rows[0].password_user);
                        var _token = hmac.digest('hex');
                        if (_token == token) {
                        	async.waterfall([
	  							function(callback)
	  							{
		                        	var os = ""
		                        	if(req.body.os == 'ubuntu')
		                        	{
		                        		os = 'ubuntu-template';
		                        	}
		                        	else if(req.body.os == 'debian')
		                        	{
		                        		os = 'debian-template';
		                        	}
		                        	else if(req.body.os == 'centos')
		                        	{
		                        		os = 'centos-template';
		                        	}
		                        	bridge.createInstance(os,nama_instance,callback);

		                        },


                        		function(arg0,callback){
		                    		var uuid_vm = bridge.getInstanceUUID(nama_instance,callback);
							     },
							     function(arg0,callback)
							     {
 	 									var spec_sql = 'select jumlah_cpu , jumlah_memori , jumlah_storage from pricing where id_plan ='+id_plan;
			                            connection.query(spec_sql, function(err, rows, fields) {
			                                if (err) {
			                                    console.error(err);
			                                    res.statuscode = 500;
			                                    res.send({
			                                        result: 'error',
			                                        err: err.code
			                                    });
			                                } 
			                                else 
			                                {
	    										bridge.scaleInstance(rows[0].jumlah_cpu,rows[0].jumlah_memori,rows[0].jumlah_storage,arg0,nama_instance,callback);
			                                }

			                            });
							     },
							     function(arg1,callback)
							     {
							     	 	var sql = 'INSERT INTO INSTANCES  (id_user,nama_instance,uuid_vm,id_plan,status_pembayaran,deleted,tanggal) values("' + id_user + '","' + nama_instance + '","' + arg1+ '",' + id_plan + ',1,0,NOW())';
			                            connection.query(sql, function(err, rows, fields) {
			                                if (err) {
			                                    console.error(err);
			                                    res.statuscode = 500;
			                                    res.send({
			                                        result: 'error',
			                                        err: err.code
			                                    });
			                                } else {
			                                    res.send({
			                                        result: 'success',
			                                        err: '',
			                                        json: rows
			                                    });
			                                }

			                                connection.release();
			                            });
			                            callback(null);
							     }]);   


                        } else {
                            res.send({
                                result: 'failed',
                                msg: 'autentikasi gagal',
                                err: 'token error',
                            });
                        }

                    }
                });
            }
        });
});

instance_edit.post(function(req, res, next) {

    req.assert('nama_instance', 'Nama node harus diisi').notEmpty();
    req.assert('id_plan', 'Pilih plan yang ingin digunakan').notEmpty();


    var errors = req.validationErrors();
    if (errors) {
        res.status(200);
        res.send(errors);
        return;
    }
    var uuid_vm = req.body.uuid_vm;
    var id_user = req.body.id_user;
    var nama_instance = req.body.nama_instance;
    var nama_instance_baru = req.body.nama_instance;
    var id_plan = req.body.id_plan;
    var tanggal = req.body.tanggal;
    var deleted = req.body.deleted;
    var status_pembayaran = req.body.status_pembayaran;
    var token = req.body.token;
    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION ERROR:', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            var validate_sql = 'SELECT email_user , password_user from user where id_user = ' + id_user;
            var validate_result;
            connection.query(validate_sql, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statuscode = 500;
                    res.send({
                        result: 'error',
                        err: err.code
                    });
                }
                if (rows.length > 0) {
                    hmac = crypto.createHmac('sha256', '12jh34k1wgh5w4g3hg243g423jjh4k324c2g3g4c');
                    hmac.update(rows[0].email_user);
                    hmac.update(rows[0].password_user);
                    var _token = hmac.digest('hex');
                    if (_token == token) {
                        connectionpool.getConnection(function(err, connection) {
                            if (err) {
                                console.error('CONNECTION ERROR:', err);
                                res.statusCode = 503;
                                res.send({
                                    result: 'error',
                                    err: err.code
                                });
                            } else 
                            {
                            	async.waterfall
                            	([
                            		 function(callback)
							     	 {
 	 									var spec_sql = 'select jumlah_cpu , jumlah_memori , jumlah_storage from pricing where id_plan ='+id_plan;
			                            connection.query(spec_sql, function(err, rows, fields) {
			                                if (err) {
			                                    console.error(err);
			                                    res.statuscode = 500;
			                                    res.send({
			                                        result: 'error',
			                                        err: err.code
			                                    });
			                                } 
			                                else 
			                                {
	    										bridge.scaleInstance(rows[0].jumlah_cpu,rows[0].jumlah_memori,rows[0].jumlah_storage,uuid_vm,nama_instance,callback);
			                                }

			                            });
							     	},
                            		function(arg0,callback)
                            		{
	                            		var sql = 'UPDATE INSTANCES SET id_user = "' + id_user + '",nama_instance = "' + nama_instance_baru + '",id_plan = ' + id_plan + ' , tanggal ="' + tanggal + '",status_pembayaran =' + status_pembayaran + ',deleted=' + deleted + ' where uuid_vm = "' + arg0 +'"';
		                                console.log(sql)
		                                connection.query(sql, function(err, rows, fields) {
		                                    if (err) {
		                                        console.error(err);
		                                        res.statuscode = 500;
		                                        res.send({
		                                            result: 'error',
		                                            err: err.code
		                                        });
		                                    } else {
		                                        res.send({
		                                            result: 'success',
		                                            err: '',
		                                            json: rows
		                                        });
		                                    }

		                                    connection.release();
		                                });
		                                	callback(null)
		                            }
                        		]);
                                

                            }

                        });
                    } else {
                        res.send({
                            result: 'failed',
                            msg: 'autentikasi gagal',
                            err: 'token error',
                        });
                    }
                }
            });


        }

    });
});


instance_delete.delete(function(req, res, next) {

    var id_instances = req.body.id_instances;
    var id_user = req.body.id_instances;
    var token = req.body.token;

    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION ERROR:', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            var validate_sql = 'SELECT email_user , password_user from user where id_user = ' + id_user;
            var validate_result;
            connection.query(validate_sql, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statuscode = 500;
                    res.send({
                        result: 'error',
                        err: err.code
                    });
                }
                if (rows.length > 0) {
                    hmac = crypto.createHmac('sha256', '12jh34k1wgh5w4g3hg243g423jjh4k324c2g3g4c');
                    hmac.update(rows[0].email_user);
                    hmac.update(rows[0].password_user);
                    var _token = hmac.digest('hex');
                    if (_token == token) {
                        connectionpool.getConnection(function(err, connection) {
                            if (err) {
                                console.error('CONNECTION ERROR:', err);
                                res.statusCode = 503;
                                res.send({
                                    result: 'error',
                                    err: err.code
                                });
                            }
                            var sql = 'update instances set deleted = 1 where id_instances= ' + id_instances;
                            console.log(sql)
                            connection.query(sql, function(err, rows, fields) {
                                if (err) {
                                    console.error(err);
                                    res.statuscode = 500;
                                    res.send({
                                        result: 'error',
                                        err: err.code
                                    });
                                } else {
                                    res.send({
                                        result: 'success',
                                        err: '',
                                        msg: 'instance telah di hapus'
                                    });
                                }
                                connection.release();
                            });
                        });

                    } else {
                        res.send({
                            result: 'failed',
                            msg: 'autentikasi gagal',
                            err: 'token error',
                        });
                    }
                }
            });
        }
    });

});




instance_list.get(function(req, res, next) {
    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION ERROR:', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            var sql = 'select * from instances';
            console.log(sql)
            connection.query(sql, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statuscode = 500;
                    res.send({
                        result: 'error',
                        err: err.code
                    });
                } else {
                    res.send({
                        result: 'success',
                        err: '',
                        json: rows
                    });
                }

                connection.release();
            });

        }

    });
});

instance_info.post(function(req, res, next) {


    var id_instances = req.body.id_instances;
    var id_user = req.body.id_instances;
    var token = req.body.token;

    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION ERROR:', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            var validate_sql = 'SELECT email_user , password_user from user where id_user = ' + id_user;
            var validate_result;

            connection.query(validate_sql, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statuscode = 500;
                    res.send({
                        result: 'error',
                        err: err.code
                    });
                }

                if (rows.length > 0) {
                    hmac = crypto.createHmac('sha256', '12jh34k1wgh5w4g3hg243g423jjh4k324c2g3g4c');
                    hmac.update(rows[0].email_user);
                    hmac.update(rows[0].password_user);
                    var _token = hmac.digest('hex');
                    if (_token == token) {
                        connectionpool.getConnection(function(err, connection) {

                            var id_instances = req.body.id_instances;
                            if (err) {
                                console.error('CONNECTION ERROR:', err);
                                res.statusCode = 503;
                                res.send({
                                    result: 'error',
                                    err: err.code
                                });
                            } else {
                                var sql = 'select * from instances where id_instances = ' + id_instances;
                                console.log(sql)
                                connection.query(sql, function(err, rows, fields) {
                                    if (err) {
                                        console.error(err);
                                        res.statuscode = 500;
                                        res.send({
                                            result: 'error',
                                            err: err.code
                                        });
                                    } else {
                                        res.send({
                                            result: 'success',
                                            err: '',
                                            json: rows
                                        });
                                    }

                                    connection.release();
                                });

                            }
                        });
                    } else {
                        res.send({
                            result: 'failed',
                            msg: 'autentikasi gagal',
                            err: 'token error',
                        });
                    }
                }

            });
        }


    });
});