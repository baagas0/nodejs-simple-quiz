const config = require('../configs/database');
const mysql = require('mysql');
const pool = mysql.createPool(config);
const jwt = require('jsonwebtoken');

pool.on('error',(err)=> {
    console.error(err);
});

const secret_key = "ksagdiyhjUYGJHGjfsadyugjHGSjkafdu91263&^%&^%(%&^"

module.exports ={
    // Fungsi untuk menyimpan data
    register(req,res){
        // Tampung inputan user kedalam varibel username, email dan password
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;
        console.log(req.body)
        // Pastikan semua varibel terisi
        if (username && email && password) {
            // Panggil koneksi dan eksekusi query
            pool.getConnection(function(err, connection) {
                if (err) throw err;
                connection.query(
                    `INSERT INTO table_user (user_name,user_email,user_password) VALUES (?,?,SHA2(?,512));`
                , [username, email, password],function (error, results) {
                    if (error) throw error;
                    // Jika tidak ada error, set library flash untuk menampilkan pesan sukses
                    res.status(200).send({ 
                        success: true, 
                        message: 'Registrasi berhasil',
                    });
                });
                // Koneksi selesai
                connection.release();
            })
        } else {
            // Kondisi apabila variabel username, email dan password tidak terisi
            res.status(403).send({ 
                success: false, 
                message: 'Isi email dan kata sandi!',
            });
        }
    },

    // Post / kirim data yang diinput user
    login(req,res){
        let email = req.body.email;
        let password = req.body.password;
        if (email && password) {
            pool.getConnection(function(err, connection) {
                if (err) throw err;
                connection.query(
                    `SELECT * FROM table_user WHERE user_email = ? AND user_password = SHA2(?,512)`
                , [email, password],function (error, results) {
                    if (error) throw error;  
                    if (results.length > 0) {
                        // Jika data ditemukan, set sesi user tersebut menjadi true
                        // req.session.loggedin = true;
                        // req.session.userid = results[0].user_id;
                        // req.session.username = results[0].user_name;
                        var user = {
                            user_id: results[0].user_id,
                            user_name: results[0].user_name
                        }
                        const token = jwt.sign(user, secret_key);

                        res.status(200).send({ 
                            success: true, 
                            message: 'Berhasil',
                            token: token
                        });
                    } else {
                        // Jika data tidak ditemukan, set library flash dengan pesan error yang diinginkan
                        res.status(403).send({ 
                            success: false, 
                            message: 'Akun tidak ditemukan',
                        });
                    }
                });
                connection.release();
            })
        } else {
            res.status(403).send({ 
                success: false, 
                message: 'Isi email dan kata sandi!',
            });
        }
    },
}