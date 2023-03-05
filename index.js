
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

/* //requête BDD
pgsql.query('select id_clt from \"Clients\"', function(err, rows, fields) {
  if (err) throw err;
  //clients = JSON.stringify(rows)
  console.log('The result is: ' + JSON.stringify(rows));
}); */

// connection.end();

//création du serveur localhost
import express from 'express'
import path from 'path'

import { fileURLToPath } from 'url';
import { dirname } from 'path';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
const port = 8080
app.use(express.json());     
app.use(express.urlencoded({extended: true})); 


app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post("/", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log("Username: " + username);
  console.log("Password: " + password);
  res.send("Data received");
});

app.get('/index.html', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get("/Connexion/connexion.html", (req, res) => {
  res.sendFile(path.join(__dirname, '/Connexion/connexion.html'));
});

app.get("/Inscription/inscription.html", (req, res) => {
  res.sendFile(path.join(__dirname, '/Inscription/inscription.html'));
});


app.get('/get/clients', (req, res)  => {
  var sql = "select * from public.\"Clients\";"
  pgsql.query(sql,function(err, rows, fields) {
    if (err) throw err;
    res.send(JSON.stringify(rows))
  })
})


app.get('/get/clients/:id', (req, res)  => {
  var sql = "SELECT * FROM public.\"Clients\" WHERE id_clt = ?;"
  pgsql.query(sql, [req.params.id], (err, rows, fields) => {
    if (err) throw err;
    res.send(JSON.stringify(rows))
  })
})

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
$BODY$; 

sql request :
SET num_clt = 567, nom_clt = 'MARTIN', prenom_clt = 'Alexandre', rue_clt ='61 rue principale', ville_clt = 'Aix', cp_clt = '54150', mail_clt = 'c.molinari0@laposte.net', tel_clt = '0781383427', mdp_clt = 'mdp'; \
  CALL clientsAdd(@num_clt, @mdp_clt, @nom_clt, @prenom_clt, @rue_clt, @ville_clt, @cp_clt, @mail_clt, @tel_clt);
  */

/* app.post('/get/clients', (req, res) => {
  let clt = req.body;
  var sql = "SET @num_clt = ?, @nom_clt = ?, @prenom_clt = ?, @rue_clt = ?, @ville_clt = ?, @cp_clt = ?, @mail_clt = ?, @tel_clt = ?, @mdp_clt = ?; \
  CALL clientsadd(@num_clt, @mdp_clt, @nom_clt, @prenom_clt, @rue_clt, @ville_clt, @cp_clt, @mail_clt, @tel_clt);";
  pgsql.query(sql, [clt.num_clt, clt.nom_clt, clt.prenom_clt, clt.rue_clt, clt.ville_clt, clt.cp_clt, clt.mail_clt, clt.tel_clt, clt.mdp_clt], (err, rows, fields) => {
    if (!err)
    res.send(rows);
    else
    console.log(err);
  })

}) */

app.listen(port, () => {
  console.log(`Serveur démarré`)
})