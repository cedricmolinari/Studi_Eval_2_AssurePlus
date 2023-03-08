//création du serveur localhost
import pgsql from './BDD/connexionBDD.js'
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

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

/* app.post("/", (req, res) => {
  const test = req.body;
  var sql = "CALL testadd(2, @nom_test);"
  pgsql.query(sql, [test.nom_test], (err, rows, fields) => {
    if (!err)
    res.send(rows);
    else
    console.log(err);
  })
}); */

app.get('/index.html', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/Connexion/connexion.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/Connexion/connexion.html'));
});

app.get('/Inscription/inscription.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/Inscription/inscription.html'));
});

app.get('/get/clients', (request, response) => {
    pgsql.query('SELECT * FROM test', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
)



app.get('/get/clients/:id', (req, res)  => {
  var sql = "SELECT * FROM public.\"Clients\" WHERE id_clt = ?;"
  pgsql.query(sql, [req.params.id], (err, rows, fields) => {
    if (err) throw err;
    res.send(JSON.stringify(rows))
  })
})

app.post('/', (request, response) => {
    const { inscription } = request.body

    pgsql.query('INSERT INTO test (nom_test) VALUES (${inscription.name})', [inscription.name], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`User added with ID: ${results.rows[0].nom_test}`)
    })
  }
)

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
  console.log(`Serveur démarré sur le port : ${port}`)
})