import express from 'express'
import path from 'path'
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import pkg from 'pg';
import { encryptPassword } from './encryptPassword.js';
import * as dotenv from 'dotenv';
dotenv.config()
console.log(process.env.user);
// installer les librairies jsonwebtoken et express-jwt dans le projet pour gérer les accès à l'API en fonction du profil utilisateur
// cours STUDI/Accueil/Médiathèque/Développement d'une solution digitale avec Java/Concevoir une API/Gérer les accès à une API

const { Client } = pkg;
const pgsql = new Client({
  user: process.env.user,
  host: process.env.host,
  database: process.env.database,
  password: process.env.password,
  port: process.env.port,
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
        
        // création d'un client avec contrôle doublon num_clt/mail_clt
        .post((req, res) => {
            pgsql.query('SELECT * FROM "Clients" WHERE num_clt = $1 OR mail_clt = $2', [req.body.num_clt, req.body.mail_clt], (err, result) => {
                if (err) {
                    res.json(error(err.message))
                } else {
                    if (result.rows[0] != undefined) {
                        res.json(error('Numéro client et/ou adresse mail déjà enregistrée, merci de vous connecter'))
                    } else {
                        var sql = 'INSERT INTO "Clients"(num_clt, mdp_clt, nom_clt, prenom_clt, rue_clt, ville_clt, cp_clt, mail_clt, tel_clt) \
                        SELECT $1::VARCHAR, $2, $3, $4, $5, $6, $7, $8, $9 \
                        WHERE (NOT EXISTS (SELECT * FROM "Clients" WHERE mail_clt = $8) AND NOT EXISTS (SELECT * FROM "Clients" WHERE num_clt = $1));';
                        pgsql.query(sql, [req.body.num_clt, encryptPassword(req.body.mdp_clt), req.body.nom_clt, req.body.prenom_clt, req.body.rue_clt, req.body.ville_clt, req.body.cp_clt, req.body.mail_clt, req.body.tel_clt], (err, result, fields) => {
                            if (err) {
                                res.json(error(err.message))
                            } else {
                                pgsql.query('SELECT * FROM "Clients" WHERE num_clt = $1', [req.body.num_clt], (err, result) => {
                                    if (err) {
                                        res.json(error(err.message))
                                    } else {
                                        if (result.rows[0] != undefined) {
                                            res.json(success('Inscription réussie, vous pouvez maintenant vous connecter'))
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            })
        });

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
    
    TestRouter.route('/api/clients/num/:num_clt')
      // Récupère un client d'après le numéro client
      .get((req, res) => {
        let mdp_clt = 'mdp_clt'
        // SELECT CONCAT(mdp_clt::json->'token', mdp_clt::json->'salt', mdp_clt::json->'hash') FROM "Clients" where num_clt = '001';
        pgsql.query(`SELECT num_clt, ${mdp_clt} FROM \"Clients\" WHERE num_clt = $1;`, [req.params.num_clt], (err, result) => {
          if (err) {
            res.json(error(err.message))
          } else {
            const json = result.rows[0].mdp_clt;
            const obj = JSON.parse(json);

            console.log(obj);
            res.json(success(
              {num_clt: result.rows[0].num_clt,
              mdp_clt: result.rows[0].mdp_clt}));
              /* '{"token":"u7PtZuv0hyWYyUzE","salt":"ui-FoSZDG_uXAiE1","hash":"832cac5f95fa7aefb68454b660bbc05b0302c744f12b043e70d3a00b2ec40f17"}' */
              /* res.json(success(
                {num_clt: result.rows[0].num_clt,
                mdp_clt: decryptPassword(obj, 'Plouf@54150?')})); */
          }
        })
      })

    TestRouter.route('/api/clients')
    

 
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