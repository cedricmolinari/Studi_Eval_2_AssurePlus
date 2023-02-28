
//connexion à la BDD pgsql
import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;
const pgsql = new Client({
  user: 'doadmin',
  host: 'app-27a8f32e-6c33-4e20-a7b5-f5b159af7b48-do-user-13582571-0.b.db.ondigitalocean.com',
  database: 'AssurePlus',
  password: 'AVNS_aTgfOfY41WZsV5L5Ktu',
  port: '25060',
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync('root.crt').toString()
  },
});
pgsql.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//requête BDD
/* connection.query('select * from clients', function(err, rows, fields) {
  if (err) throw err;
  clients = JSON.stringify(rows)
  console.log('The result is: ' + JSON.stringify(rows));
}); */

// connection.end();

//création du serveur localhost
import express from 'express'
const app = express()
const port = 8080
app.use(express.json())

app.get("https://goldfish-app-2-2cozk.ondigitalocean.app/", (req, res) => {
  res.send(index.html);
});

app.get("https://goldfish-app-2-2cozk.ondigitalocean.app/messages", (req, res) => {
  res.send("Hello");
});

app.get("https://goldfish-app-2-2cozk.ondigitalocean.app/:universalURL", (req, res) => {
  res.send("404 URL NOT FOUND");
});


/* app.get('/clients', (req, res)  => {
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
}) */

/* create PROCEDURE public.clientsAdd(
IN _num_clt INT,
IN _mdp_clt VARCHAR(250),
IN _nom_clt VARCHAR(100),
IN _prenom_clt VARCHAR(100),
IN _rue_clt VARCHAR(100),
IN _ville_clt VARCHAR(100),
IN _cp_clt VARCHAR(5),
IN _mail_clt VARCHAR(100),
IN _tel_clt VARCHAR(20)
)
LANGUAGE 'plpgsql'
AS $BODY$

BEGIN
	INSERT INTO clients (num_clt, mdp_clt, nom_clt, prenom_clt, rue_clt, ville_clt, cp_clt, mail_clt, tel_clt) VALUES (_num_clt, _mdp_clt, _nom_clt, _prenom_clt, _rue_clt, _ville_clt, _cp_clt, _mail_clt, _tel_clt);
END;
$BODY$; */

/* app.post('/clients', (req, res) => {
  let clt = req.body;
  var sql = "SET @num_clt = ?, @mdp_clt = ?, @nom_clt = ?, @prenom_clt = ?, @rue_clt = ?, @ville_clt = ?, @cp_clt = ?, @mail_clt = ?, @tel_clt = ?; \
  CALL clientsAdd(@num_clt, @mdp_clt, @nom_clt, @prenom_clt, @rue_clt, @ville_clt, @cp_clt, @mail_clt, @tel_clt);";
  connection.query(sql, [clt.num_clt, clt.mdp_clt, clt.nom_clt, clt.prenom_clt, clt.rue_clt, clt.ville_clt, clt.cp_clt, clt.mail_clt, clt.tel_clt], (err, rows, fields) => {
    if (!err)
    res.send(rows);
    else
    console.log(err);
  })

}) */

app.listen(port, () => {
  console.log(`Serveur démarré`)
})