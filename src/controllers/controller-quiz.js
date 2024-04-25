const config = require('../configs/database');
const mysql = require('mysql');
const pool = mysql.createPool(config);

pool.on('error',(err)=> {
    console.error(err);
});


module.exports ={

    list(req,res){
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(
                `
                select
                    q.id as quiz_id,
                    q.user_id,
                    q.question_count,
                    q.score,
                    q.date,
                    q.status,
                    concat(
                        '[',
                        GROUP_CONCAT(
                            concat('{',
                                '"question_id":', qa.question_id, ', ',
                                '"status":', '"', qa.status, '"',
                            '}')
                        ),
                        ']'
                    ) as answers
                from quiz q
                left join quiz_answer qa on qa.quiz_id = q.id

                where q.user_id = ?
                group by q.id
                `
            , [req.user.user_id],function (error, results) {
                if(error) throw error;  
                
                results = results.map((x) => {
                    return {
                        ...x,
                        answers: JSON.parse(x.answers)
                    }
                })
                res.send({ 
                    success: true, 
                    message: 'Berhasil ambil data!',
                    data: results 
                });
            });
            connection.release();
        })
    },

    start(req,res){
        let data = {
            user_id : req.user.user_id,
        }

        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(
                `
                INSERT INTO quiz SET ?;
                `
            , [data],
            function (error, results) {
                if(error) throw error;  
                console.log(results)
                connection.query(
                    `
                    SELECT * FROM question;
                    `
                , function (error, question) {
                    if(error) throw error;  
                    
                    question = question.map((x) => {
                        return {
                            id: x.id,
                            question: x.question,
                            answers: JSON.parse(x.answers)
                        }
                    })
                    res.send({ 
                        success: true, 
                        message: 'Berhasil memulai quiz!',
                        data: {
                            quiz_id: results.insertId,
                            question: question 
                        }
                    });
                });
            });
            connection.release();
        })
    },

    async answer(req,res){
        pool.getConnection(function(err, connection) {
            if (err) throw err;

            pool.getConnection(function(err, connection) {
                if (err) throw err;
                connection.query(`SELECT * FROM quiz WHERE id = ?;`, [req.body.quiz_id], function (error, results) {
                    if(error) throw error;  
                    if (results.length === 0) {
                        // quiz tidak ditemukan
                        res.status(500).send({ 
                            success: true, 
                            message: 'Quiz tidak ditemukan',
                        });
                    }
                    if (results[0].user_id !== req.user.user_id) {
                        // user tidak sesuai
                        res.status(500).send({ 
                            success: true, 
                            message: 'Anda tidak berhak menjawab quiz',
                        });
                    }
                    if (results[0].status !== 'mulai') {
                        // quiz selesai
                        res.status(500).send({ 
                            success: true, 
                            message: 'Quiz telah selesai',
                        });
                    }

                    // start answer
                    connection.query(`select * from question` , [], function (error, question) {
        
                        let answers = []
                        let status = []
                        let score = 0
                        for (const item of req.body.answers) {
                            let q = []
                            q = question.filter((x) => x.id == item.question_id)
                            let benarsalah = q.length && q[0].index_answer == item.index_answer ? 'benar' : 'salah'
                            answers.push([
                                req.body.quiz_id,
                                item.question_id,
                                item.index_answer,
                                benarsalah
                            ])
                            status.push(benarsalah)
                        }
        
                        let benar = status.filter((x) => { return x == 'benar'})
                        score = (benar.length / question.length) * 100
            
                        connection.query(`INSERT INTO quiz_answer (quiz_id, question_id, index_answer, status) values ?;` , [answers], function (error, results) {
                            if(error) throw error;  
        
                            connection.query(`UPDATE quiz SET ? WHERE id = ?;`, [{ question_count: question.length, score: score, status: 'selesai' }, req.body.quiz_id], function(error, results) {
        
                                res.send({ 
                                    success: true, 
                                    message: 'Berhasil menjawab quiz!',
                                    data: {
                                        score: score,
                                        status: 'selesai'
                                    }
                                });
        
                            })
            
                        });
        
                    })
                });
                connection.release();
            })

        })
    }
}