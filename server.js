var express = require('express'),
	app = express(),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
	mysql = require('mysql'),
	md5 = require('MD5');
	crypto = require('crypto');
	cors = require('cors');


var connectionpool = mysql.createPool
	(
		{
			connectionLimit: 1000,
			host:'localhost',
			user:'root',
			password:'',
			database:'cloudVM'
		}
	);
	
app.listen(8183);


/*router.use(function(req,res,next){
	console.log(req.method,req.url);
	next();

});*/
app.use(bodyParser.urlencoded({ extended: true })); //support x-www-form-urlencoded
app.use(bodyParser.json());
app.use(expressValidator());
app.use(cors());

var user_router = express.Router();
var user_list = user_router.route('/list');
var user_register = user_router.route('/register');
var user_login = user_router.route('/login');
app.use('/user',user_router);



user_list.get(function(req,res,next){

	connectionpool.getConnection(function(err,connection)
	{

		if(err)
		{
			console.error('CONNECTION ERROR:',err);
			res.statusCode=503;
			res.send({
				result:'error',
				err:err.code
			});
		}

		else
		{
			var sql = 'SELECT * FROM user ORDER BY id_user';
			console.log(sql)
			connection.query(sql,function(err,rows,fields)
			{
				if(err){
					console.error(err);
					res.statuscode = 500;
					res.send({result:'error',err:err.code});
				}
				res.send({
					result:'success',
					err:'',
					fields:fields,
					json:rows,
					length:rows.length
				});
				connection.release();
			});

			}

	});
});

user_register.post(function(req,res,next){

	/*lengkapin validasinya lagi */
	req.assert('nama','Nama harus diisi').notEmpty();
	req.assert('email','Alamat email harus valid').isEmail();
	req.assert('password','Password harus karakter atau angka dengan panjang 6-20').len(6,20);
	req.assert('no_telp','Nomor telepon harus diisi dan berisi angka saja').notEmpty();
	req.assert('nama_perusahaan','Nama perusahaan harus diisi dan berisikan angka atau huruf saja').notEmpty();
	req.assert('alamat','Alamat harus diisi').notEmpty();
	req.assert('nama_cc','Nama pada Kartu Kredit harus diisi').notEmpty().isAlpha();
	req.assert('alamat_cc','Alamat pada Kartu harus Kredit diisi').notEmpty();
	req.assert('nomor_cc','Nomor Kartu harus Kredit diisi').notEmpty().isNumeric();
	req.assert('nomor_vcv','Nomor VCV harus diisi').notEmpty().isNumeric().len(3);
	req.assert('bulan_expire','Bulan expire kartu kredit harus diisi').notEmpty().isInt({min:1,max:12});
	req.assert('tahun_expire','Tahun expire kartu kredit harus diisi').notEmpty().isInt();

	var errors = req.validationErrors();
	if(errors){
		res.status(200);
		res.send(errors);
		return;
	}
	var data = {
		nama_user:req.body.nama,
		email_user:req.body.email,
		password_user:md5(req.body.password),
		no_telp_user:req.body.no_telp,
		nama_perusahaan_user:req.body.nama_perusahaan,
		alamat_user:req.body.alamat,
		nama_cc_user:req.body.nama_cc,
		alamat_cc_user:req.body.alamat_cc,
		nomor_cc_user:req.body.nomor_cc,
		nomor_vcv_user:req.body.nomor_vcv,
		expire_month_cc_user:req.body.bulan_expire,
		expire_year_cc_user:req.body.tahun_expire
	};
	connectionpool.getConnection(function(err,connection)
	{
		if(err)
		{
			console.error('CONNECTION ERROR:',err);
			res.statusCode=503;
			res.send({
				result:'error',
				err:err.code
			});
		}
		
		else
		{
			var sql = 'INSERT INTO user set ?';
			console.log(sql)
			connection.query(sql,data,function(err,rows,fields)
			{
				if(err){
					console.error(err);
					res.statuscode = 500;
					res.send({result:'error',err:err.code});
				}
				res.send({
					result:'success',
					msg:'registrasi telah berhasil',
					err:'',
					fields:fields,
					json:rows,
					length:rows.length
				});
				connection.release();
			});

			}

	});
});


user_login.post(function(req,res,next){
	req.assert('username','Username tidak boleh kosong').notEmpty();
	req.assert('password','Password tidak boleh kosong').notEmpty();

	var errors = req.validationErrors();
	if(errors){
		res.status(422).json(errors);
		return;
	}

	var username =req.body.username;
	var password =md5(req.body.password);


	connectionpool.getConnection(function(err,connection)
	{
		if(err)
		{
			console.error('CONNECTION ERROR:',err);
			res.statusCode=503;
			res.send({
				result:'error',
				err:err.code
			});
		}

		else
		{
			var sql = 'SELECT id_user,nama_user,password_user FROM user where nama_user= "'+username+'"and password_user = "'+password+'"';
			console.log(sql)
			connection.query(sql,function(err,rows,fields)
			{
				if(err){
					console.error(err);
					res.statuscode = 500;
					res.send({result:'error',err:err.code});
				}
				if(rows.length>0)
				{
					console.log(rows[0]);
					hmac = crypto.createHmac('sha256','12jh34k1wgh5w4g3hg243g423jjh4k324c2g3g4c');
					hmac.update(rows[0].nama_user);
					hmac.update(rows[0].password_user);
					var token = hmac.digest('hex');
					res.send({
						result:'success',
						err:'',
						token:token,
					});
				}
				else
				{
					res.send({
						result:'failed',
						err:'username tidak ditemukan',
					});
				}
				
				connection.release();
			});

			}

	});
});



