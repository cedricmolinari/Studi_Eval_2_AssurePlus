//connexion à la BDD MySQL
//var mysql      = require('mysql2');
import mysql from './node_modules/mysql2'
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Plouf@54150?',
  database : 'AssurePlus',
  multipleStatements:true
});

connection.connect();

//requête BDD
/* connection.query('select * from clients', function(err, rows, fields) {
  if (err) throw err;
  clients = JSON.stringify(rows)
  console.log('The result is: ' + JSON.stringify(rows));
}); */

// connection.end();

//création du serveur localhost
//const express = require('express')
import express from './node_modules/express'
const app = express()
const port = 3000
app.use(express.json())

app.get('/clients', (req, res)  => {
  var sql = "SELECT * FROM clients;"
  connection.query(sql,function(err, rows, fields) {
    if (err) throw err;
    res.send(rows)
  })
})

app.get('/clients/:id', (req, res)  => {
  var sql = "SELECT * FROM clients WHERE id_clt = ?;"
  connection.query(sql, [req.params.id], (err, rows, fields) => {
    if (err) throw err;
    res.send(rows)
  })
})

app.post('/clients', (req, res) => {
  let clt = req.body;
  var sql = "SET @num_clt = ?, @mdp_clt = ?, @nom_clt = ?, @prenom_clt = ?, @rue_clt = ?, @ville_clt = ?, @cp_clt = ?, @mail_clt = ?, @tel_clt = ?; \
  CALL clientsAdd(@num_clt, @mdp_clt, @nom_clt, @prenom_clt, @rue_clt, @ville_clt, @cp_clt, @mail_clt, @tel_clt);";
  connection.query(sql, [clt.num_clt, clt.mdp_clt, clt.nom_clt, clt.prenom_clt, clt.rue_clt, clt.ville_clt, clt.cp_clt, clt.mail_clt, clt.tel_clt], (err, rows, fields) => {
    if (!err)
    res.send(rows);
    else
    console.log(err);
  })

})

app.listen(port, () => {
  console.log(`Serveur démarré`)
})