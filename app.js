import express from 'express'
import path from 'path'
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import pkg from 'pg';

// installer les librairies jsonwebtoken et express-jwt dans le projet pour gérer les accès à l'API en fonction du profil utilisateur
// cours STUDI/Accueil/Médiathèque/Développement d'une solution digitale avec Java/Concevoir une API/Gérer les accès à une API

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

import { success, error } from './functions.js';

 pgsql.connect((err) => {
  if (err) {
    
    console.log(err.message);

  } else {

    console.log("Connected!");

    let TestRouter = express.Router()

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    TestRouter.route('/')

      //affiche la page d'accueil
      .get((req, res) => {
        res.sendFile(__dirname + "/Accueil/accueil.html");
      });
    
    TestRouter.route('/Accueil/accueil.html')

      //affiche la page d'accueil
      .get((req, res) => {
        res.sendFile(__dirname + "/Accueil/accueil.html");
      });
    
    TestRouter.route('/Inscription/inscription.html')
      //affiche la page d'inscription
      .get((req, res) => {
        res.sendFile(__dirname + "/Inscription/inscription.html");
      });

    TestRouter.route('/Connexion/connexion.html')
      //affiche la page de connexion
      .get((req, res) => {
        res.sendFile(__dirname + "/Connexion/connexion.html");
      });
      

    TestRouter.route('/api/clients')

      // Récupère tous les clients
      .get((req, res) => {
        pgsql.query("SELECT * FROM \"Clients\";", (err, result) => {
          if (err) {
            res.json(error(err.message))
          } else {
            res.json(result.rows)
          }
        })
      })

    TestRouter.route('/api/clients/:id')
      // Récupère un client d'après l'id
      .get((req, res) => {
        pgsql.query('SELECT * FROM \"Clients\" WHERE id_clt = $1;', [req.params.id], (err, result) => {
          if (err) {
            res.json(error(err.message))
          } else {
            res.status(200).json(result.rows)
          }
        })
      })

    TestRouter.route('/api/test')
      // Récupère tous les tests
      .get((req, res) => {
        pgsql.query("SELECT * FROM \"test\";", (err, result) => {
          if (err) {
            res.json(error(err.message))
          } else {
            res.status(200).json(result.rows)
          }
        })
      })

    TestRouter.route('/api/test/:id')
      // Récupère un test d'après l'id
      .get((req, res) => {
        pgsql.query('SELECT * FROM \"test\" WHERE id = $1;', [req.params.id], (err, result) => {
          if (err) {
            res.json(error(err.message))
          } else {
            res.status(200).json(result.rows)
          }
        })
      })

      // Modifie un membre avec ID
      .put((req, res) => {
          pgsql.query('update "test" set nom_test = $1 where id = $2;', [req.body.nom_test, req.params.id], (err, result) => {
            if (err) {
              res.json(functions.error(err.message))
            } else {         
              res.status(200).json({"message":"Modification effectuée !"})
            }
          })
      })

    TestRouter.route('/api/test/')

      // Ajoute un membre avec son nom
      .post((req, res) => {
        if (req.body.nom_test) {
          pgsql.query('SELECT * FROM "test" WHERE nom_test = $1', [req.body.nom_test], (err, result) => {
            if (err) {
              res.json(error(err.message))
            } else {
              if (result.rows[0] != undefined) {
                res.send({"message":"name already taken"})
              } else {
                pgsql.query('INSERT INTO test(nom_test) VALUES($1)', [req.body.nom_test], (err, result) => {
                  if (err) {
                    res.json(error(err.message))
                  } else {
                    pgsql.query('SELECT * FROM "test" WHERE nom_test = $1', [req.body.nom_test], (err, result) => {
                      if (err) {
                        res.json(error(err.message))
                      } else {
                        res.json(success(
                          {id: result.rows[0].id,
                          name: result.rows[0].nom_test}
                        ))
                      }
                    })
                  }
                })
              }
            }
          })
        } else {
          res.status(200).json({"message":"no name value"})
        }
      })

    app.use(TestRouter)
    app.listen(3000, 'localhost', () => console.log('Started on port ' + 3000))
  }
});

/* app.use((req, res, next) => {
  console.log('URL : ' + req.url)
  next()
})


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

/* app.get('/index.html', function(req, res) {
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
) */



/* app.get('/get/clients/:id', (req, res)  => {
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
) */

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

}) 

https.createServer(options, app).listen(443)

/* app.listen(port, () => {
  console.log(`Serveur démarré sur le port : ${port}`)
}) */