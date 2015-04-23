# CloudVMback-end
Back end untuk CloudVM, sebuah Infrastructure as a Service untuk Final Project mata kuliah Komputasi Awan 2015.



CloudVM API
CloudVM API yang diimplementasikan pada server.js dijalankan pada node js dengan beberapa dependensi module seperti berikut

	- express (untuk koneksi ke mysql)
    - bodyParser (parsing data POST)
    - expressValidator (validasi input form)
	- mysql (koneksi ke mysql dan kueri)
	- md5  (hashing password)
	- crypto  (generate token untuk api call)
	- cors (untuk enable cross domain call) (hanya sementara nanti kemungkinan tidak dipakai)
	- uuid-node (generate uuid instances)

pemanggilan API adalah sebagai berikut , semua API call akan dikembalikan dengna bentuk JSON

USER


List User

Metode : GET

URL 

	<url>/user/list

Data yang harus dikirm : - 

Fungsi : Untuk menampilkan list dari semua user


Registrasi User

Metode : POST

URL 

	<url>/user/register

Data yang harus dikirm :

	nama_user:<nama asli user>

	email_user:<email user>

	password_user:<pasword user>

	no_telp_user:<nomor telepon user>

	nama_perusahaan_user:<nama perusahaan user>

	alamat_user:<alamat user>

	nama_cc_user:<nama pada credit card user>

	alamat_cc_user:<alamat pada credit card user>

	nomor_cc_user:<nomor credit card user>

	nomor_vcv_user:<3 digit nomor cvc pada credit card user>

	expire_month_cc_user:<bulan habisnya masa berlaku credit card user>

	expire_year_cc_user:<tahun habisnya masa berlaku credit card user>


Fungsi : Untuk registrasi user baru


Edit Data User

Metode : POST

URL 

	<url>/user/edit

Data yang harus dikirm : 

	id_user:<id unik user>

	nama_user:<nama asli user>

	email_user:<email user>

	password_user:<pasword user>

	no_telp_user:<nomor telepon user>

	nama_perusahaan_user:<nama perusahaan user>

	alamat_user:<alamat user>

	nama_cc_user:<nama pada credit card user>

	alamat_cc_user:<alamat pada credit card user>

	nomor_cc_user:<nomor credit card user>

	nomor_vcv_user:<3 digit nomor cvc pada credit card user>

	expire_month_cc_user:<bulan habisnya masa berlaku credit card user>

	expire_year_cc_user:<tahun habisnya masa berlaku credit card user>


Fungsi : Untuk edit/update data user 

Delete User

Metode : DELETE

URL 

	<url>/user/delete

Data yang harus dikirm : 

	id_user:<id unik user>

Fungsi : Untuk menghapus user dari DB


Info User

Metode : POST

URL 

	<url>/user/info

Data yang harus dikirm : 

	id_user:<id unik user>

Fungsi : Menampilkan info user tertentu

Login User

Metode : POST

URL 

	<url>/user/register

Data yang harus dikirm : 

	username:<nama asli user>

	password:<pasword user>


Fungsi : Untuk login user, server akan mengembalikan token yang akan digunakan setiap kali api call yang memodifikasi data sensitif user
NOTE:token belum di implementasikan , jadi API call masih bebas , belum ada pengecekan token #TODO



INSTANCE

List Instance

Metode : GET

URL 

	<url>/instance/list

Data yang harus dikirm : - 

Fungsi : Untuk menampilkan list dari semua instance


Create Instance

Metode : POST

URL 

	<url>/instance/create

Data yang harus dikirm : 

	id_user:<id unik user>

	nama_instance:<nama dari instance yang akan dibuat>

	id_plan:<plan yang digunakan pada instance>

Fungsi : Untuk membuat instance baru

NOTE: 
	  - uuid instance akan digenerate otomatis
	  - default value untuk deleted adalah 0 dan status_pembayaran adalah 1 (asumsi sudah di bayarkan)
	  - default tanggal adahal tanggal sekarang (NOW())


Delete Instance

Metode : DELETE

URL 

	<url>/instance/delete

Data yang harus dikirm : 

	id_instances:<id unik instances>

Fungsi : Untuk menghapus instance

NOTE: instance dihapus secara soft delete saja (hanya mengupdate kolom deleted dari 0 menjadi 1)

Info Instance

Metode : POST

URL 

	<url>/instance/info

Data yang harus dikirm : 

	id_instances:<id unik instances>

Fungsi : Untuk menampilkan info suatu instance





