import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import pkg from 'pg';
import * as dotenv from 'dotenv';
import { encryptPassword } from './encryptPassword.js';
import { decryptPassword } from './decryptPassword.js';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
dotenv.config()
console.log(process.env.user);
// installer les librairies jsonwebtoken et express-jwt dans le projet pour gérer les accès à l'API en fonction du profil utilisateur
// cours STUDI/Accueil/Médiathèque/Développement d'une solution digitale avec Java/Concevoir une API/Gérer les accès à une API

// protéger la BDD des injections SQL avec le package node-pg-format



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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* app.use(express.static('public')); // Serveur de fichiers statiques

app.get('/Sinistre/sinistre.html', (req, res) => {
  const num_clt = req.query.num_clt;
  res.send(`<h1>Bienvenue, ${num_clt} !</h1>`);
}); */

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

    // <--- mise en place d'un profil admin --->
    // Ajoutez le middleware bodyParser pour traiter le corps de la requête
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Utiliser les sessions Express
    app.use(
      session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
      })
    );

    // Stratégie d'authentification locale pour Passport.js
    async function findUserByUsername(username) {
      return new Promise((resolve, reject) => {
        pgsql.query(`SELECT utilisateur_ut, password_ut FROM \"Utilisateurs\" WHERE utilisateur_ut = $1;`, [username], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result.rows[0]);
            }
          }
        );
      });
    }

    const customLocalStrategy = (req, username, password, done) => {
      //console.log(customLocalStrategy);
      (async () => {
        try {
          const user = await findUserByUsername(req.body.utilisateur_ut);
    
          if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
          }
    
          const isValidPassword = password === user.password_ut;
          if (!isValidPassword) {
            return done(null, false, { message: 'Incorrect password.' });
          }
    
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      })();
    };
    
    passport.use(new LocalStrategy({
      passReqToCallback: true,
      usernameField: 'utilisateur_ut', // Assurez-vous d'utiliser le bon nom de champ pour l'identifiant
      passwordField: 'password_ut' // Assurez-vous d'utiliser le bon nom de champ pour le mot de passe
    }, customLocalStrategy));   
        
    
    TestRouter.route('/api/referents/connexion').post((req, res, next) => {
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          return next(err);
        }
        //console.log(user);
        //console.log(info);
        if (!user) {
          return res.status(401).json({ message: info.message });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.status(200).json({ utilisateur_ut: user.utilisateur_ut, password_ut: user.password_ut });
        });
      })(req, res, next);
    });
    
    // Configurer Passport.js
    app.use(passport.initialize());
    app.use(passport.session());

    // Ajoutez les fonctions de sérialisation et de désérialisation de Passport
    passport.serializeUser((user, done) => {
      done(null, user.utilisateur_ut);
    });

    passport.deserializeUser(async (username, done) => {
      try {
        const user = await findUserByUsername(username);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });
    app.use((req, res, next) => {
      console.log('Session data:', req.session);
      next();
    });
          
    TestRouter.route('/')
      
      //affiche la page d'accueil
      .get((req, res) => {
          console.log('pas referent');
          res.sendFile(__dirname + "/Accueil/accueil.html");
      });
    
    TestRouter.route('/Accueil/accueil.html')

      .get((req, res) => {
        console.log('pas referent');
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
    
    TestRouter.route('/Sinistre/sinistre.html')
      //affiche la page de connexion
      .get((req, res) => {
        res.sendFile(__dirname + `/Sinistre/sinistre.html`);
      });

    /* TestRouter.route('/Sinistre/sinistre.html')
      //affiche la page de connexion
      .post((req, res) => {
        const num_clt = req.query.num_clt;
        res.sendFile(__dirname + `/Sinistre/sinistre.html?num_clt=${num_clt}`);
      }); */
      

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
                      pgsql.query('SELECT * FROM "Clients" WHERE num_clt = $1', [req.body.num_clt], (err, result) => {
                        if (err) {
                            res.json(error(err.message))
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
        pgsql.query(`SELECT num_clt, mdp_clt FROM \"Clients\" WHERE num_clt = $1;`, [req.params.num_clt], (err, result) => {
          if (err) {
            res.json(error(err.message))
          } else {
            const json = result.rows[0].mdp_clt;
            const obj = JSON.parse(json);
            console.log(obj);
              res.json(success(
                {num_clt: result.rows[0].num_clt,
                mdp_clt: decryptPassword(obj, 'Plouf@54150?')}));
          }
        })
      })

    TestRouter.route('/api/clients/num/')
      //compare le hash du mdp saisi lors d'une connexion d'un client
      .post((req, res) => {
        
        pgsql.query(`SELECT num_clt, mdp_clt FROM \"Clients\" WHERE num_clt = $1;`, [req.body.num_clt], (err, result) => {
          const json = result.rows[0].mdp_clt;
          const obj = JSON.parse(json);
          console.log(obj);
          
          console.log(decryptPassword(obj, req.body.mdp_clt))
          if (err) {
            res.json(error(err.message))
          } else {
            //console.log(result);
            res.status(200).json(success(
              {num_clt: result.rows[0].num_clt,
                mdp_clt : decryptPassword(obj, req.body.mdp_clt)}));
          }
      })})

    TestRouter.route('/api/declaration/:client_id')
      //enregistre la déclaration de sinistre d'un client
      .post((req, res) => {
        var sql = 'INSERT INTO "Sinistres"(reference_sin, date_sin, immat_sin, dommage_corporel_sin, responsable_sin, rue_sin, ville_sin, cp_sin, commentaire_sin, client_id, etat_sin) \
                            SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, \'en cours\';';
        pgsql.query(sql, [req.body.reference_sin, req.body.date_sin, req.body.immat_sin, req.body.dommage_corporel_sin, req.body.responsable_sin, req.body.rue_sin, req.body.ville_sin, req.body.cp_sin, req.body.commentaire_sin, req.params.client_id])
          if (err) {
            res.json(error(err.message))
          } else {
            res.json(success('Déclaration réussie !'))
          }
      })
    
    TestRouter.route('/api/declarations/single-formulaire/')
    .post(function(request, response, next) {
        console.log('coucou');
        var filename;
        var storage = multer.diskStorage({
            destination: function(request, file, callback) {
                callback(null, './upload');
            },
            filename: function(request, file, callback) {
                var temp_file_arr = file.originalname.split(".");
                var temp_file_name = temp_file_arr[0];
                var temp_file_extension = temp_file_arr[1];
                filename = temp_file_name + '-' + Date.now() + '.' + temp_file_extension
                callback(null, temp_file_name + '-' + Date.now() + '.' + temp_file_extension);
            }
          });
          var upload = multer({storage:storage}).single('document_form');
          upload(request, response, function(error) {
            if (error) {
                console.log(error);
                return response.end('Error Uploading File');
            } else {
              //let dateNow = new Date(Date.now()).toLocaleString().split(',')[0]
              var sqlInsertForm =
              `INSERT INTO "Formulaires" (document_form, date_ajout_form, sinistre_id, libelle_form) \
                SELECT bytea('/upload/${filename}'), current_date, id_sin, '${filename}' FROM "Sinistres" AS sin \
                WHERE sin.id_sin = (SELECT id_sin FROM "Sinistres" ORDER BY id_sin DESC limit 1)`;                 
              pgsql.query(sqlInsertForm)
            } 
          })
      });
    
    TestRouter.route('/api/declarations/multiple-images/')
    .post(function(request, response, next) {
      var filename;
      var storage = multer.diskStorage({
        destination: function(request, file, callback) {
          callback(null, './upload');
        },
        filename: function(request, file, callback) {
          var temp_file_arr = file.originalname.split(".");
          var temp_file_name = temp_file_arr[0];
          var temp_file_extension = temp_file_arr[1];
          filename = temp_file_name + '-' + Date.now() + '.' + temp_file_extension
          callback(null, temp_file_name + '-' + Date.now() + '.' + temp_file_extension);
        }
        });
        var upload = multer({storage:storage}).array('image_pho', 5);
        
        upload(request, response, function(err) {
            if (err) {
                return response.end('Error Uploading File');
            } else {
                var file = request.files;
                var arrError = [];
                //response.end();
                for (let i = 0 ; i < file.length ; i++) {
                  if (((file[i].size/1024)/1024).toFixed(4) < 2) {
                    var sqlPho =
                    `INSERT INTO "Photos" (image_pho, date_ajout_pho, sinistre_id, libelle_pho) \
                      SELECT bytea('/upload/${file[i].filename}'), current_date, id_sin, '${file[i].filename}' FROM "Sinistres" AS sin \
                      WHERE sin.id_sin = (SELECT id_sin FROM "Sinistres" ORDER BY id_sin DESC limit 1)`;                 
                    pgsql.query(sqlPho)
                  } else {
                    //return response.end(`Photo ${file[i].filename} trop volumineuse (limite : 2 mo)`);
                    arrError.push({"message":`${file[i].filename}`})
                  }
                }
                response.send({
                  arrError
                })
              } 
        })
    })

    TestRouter.route('/api/declarations/single-image/:sinistre_id')
    .post(function(request, response, next) {
      var filename;
      var storage = multer.diskStorage({
        destination: function(request, file, callback) {
          callback(null, './upload');
        },
        filename: function(request, file, callback) {
          var temp_file_arr = file.originalname.split(".");
          var temp_file_name = temp_file_arr[0];
          var temp_file_extension = temp_file_arr[1];
          filename = temp_file_name + '-' + Date.now() + '.' + temp_file_extension
          callback(null, temp_file_name + '-' + Date.now() + '.' + temp_file_extension);
        }
        });
        var upload = multer({storage:storage}).array('image_pho', 5);
        
        upload(request, response, function(err) {
            if (err) {
                return response.end('Error Uploading File');
            } else {
                var file = request.files;
                var arrError = [];
                //response.end();
                for (let i = 0 ; i < file.length ; i++) {
                    var sqlNbPho = 
                    `SELECT COUNT(*) FROM "Photos" WHERE sinistre_id = $1;`
                    pgsql.query(sqlNbPho, [request.params.sinistre_id], (err, result) => {
                      console.log(result.rows[0].count);
                      if ((((file[i].size/1024)/1024).toFixed(4) > 2)) {
                        response.json(error(`La photo ${file[i].filename} trop volumineuse (limite : 2 mo)`))
/*                         arrError.push({"message":`${file[i].filename}`})
                        response.send({
                          arrError
                        }) */
                      } else {

                        if (result.rows[0].count > 4) {
                          response.json(error('limite du nombre de photos dépassée (5)'))
                        } else {
  
                          var sqlPho =
                          `INSERT INTO "Photos" (image_pho, date_ajout_pho, sinistre_id, libelle_pho) \
                            VALUES (bytea('/upload/${file[i].filename}'), current_date, $1, '${file[i].filename}')`;                 
                          pgsql.query(sqlPho, [request.params.sinistre_id], (err, result) => {
                            if (err) {
                              response.json(error(err.message))
                            } else {
                              response.json(success(`Ajout de photo réussi`))
                            }
                          })
                        }}})
                }
                
              } 
        })
    })

    TestRouter.route('/api/declarations/multiple-images/get/:sinistre_id')
    // Récupère les photos d'un sinistre d'après son ID
    .get((req, res) => {
      pgsql.query(`SELECT * FROM \"Photos\" WHERE sinistre_id = $1::INTEGER;`, [req.params.sinistre_id], (err, result) => {
        if (err) {
          res.json(error(err.message))
        } else {
          res.json(success(result.rows));
        }
      })
    })

    TestRouter.route('/api/modif-declaration/multiple-images/post/:sinistre_id')
    // Poste les photos d'un sinistre d'après son ID
    .post((req, res) => {
      pgsql.query(`DELETE FROM \"Photos\" WHERE sinistre_id = $1::INTEGER AND id_pho = $2::INTEGER;`, [req.body.sinistre_id, req.body.id_pho], (err, result) => {
        if (err) {
          res.json(error(err.message))
        } else {
          res.json(success(result));
        }
      })
    }) 
    TestRouter.route('/api/modif-declaration/put/dommage-corp/:id_sin')
    // Modifie le dommage corporel d'un sinistre d'après son ID
    .put((req, res) => {
      pgsql.query(`UPDATE \"Sinistres\" SET dommage_corporel_sin = $2 WHERE id_sin = $1::INTEGER;`, [req.body.id_sin, req.body.dommage_corporel_sin], (err, result) => {
        if (err) {
          res.json(error(err.message))
        } else {
          res.json(success(result));
        }
      })
    })
    TestRouter.route('/api/modif-declaration/put/commentaire/:id_sin')
    // Modifie le commentaire d'un sinistre d'après son ID
    .put((req, res) => {
      pgsql.query(`UPDATE \"Sinistres\" SET commentaire_sin = $2 WHERE id_sin = $1::INTEGER;`, [req.body.id_sin, req.body.commentaire_sin], (err, result) => {
        if (err) {
          res.json(error(err.message))
        } else {
          res.json(success(result));
        }
      })
    })
    TestRouter.route('/api/modif-declaration/put/responsabilite/:id_sin')
    // Modifie la responsabilité d'un sinistre d'après son ID
    .put((req, res) => {
      pgsql.query(`UPDATE \"Sinistres\" SET responsable_sin = $2 WHERE id_sin = $1::INTEGER;`, [req.body.id_sin, req.body.responsable_sin], (err, result) => {
        if (err) {
          res.json(error(err.message))
        } else {
          res.json(success(result));
        }
      })
    })
    TestRouter.route('/api/modif-declaration/put/rue/:id_sin')
    // Modifie la rue d'un sinistre d'après son ID
    .put((req, res) => {
      pgsql.query(`UPDATE \"Sinistres\" SET rue_sin = $2 WHERE id_sin = $1::INTEGER;`, [req.body.id_sin, req.body.rue_sin], (err, result) => {
        if (err) {
          res.json(error(err.message))
        } else {
          res.json(success(result));
        }
      })
    })
    TestRouter.route('/api/modif-declaration/put/code-postal/:id_sin')
    // Modifie le code postal d'un sinistre d'après son ID
    .put((req, res) => {
      pgsql.query(`UPDATE \"Sinistres\" SET cp_sin = $2 WHERE id_sin = $1::INTEGER;`, [req.body.id_sin, req.body.cp_sin], (err, result) => {
        if (err) {
          res.json(error(err.message))
        } else {
          res.json(success(result));
        }
      })
    })
    TestRouter.route('/api/modif-declaration/put/ville/:id_sin')
    // Modifie la ville d'un sinistre d'après son ID
    .put((req, res) => {
      pgsql.query(`UPDATE \"Sinistres\" SET ville_sin = $2 WHERE id_sin = $1::INTEGER;`, [req.body.id_sin, req.body.ville_sin], (err, result) => {
        if (err) {
          res.json(error(err.message))
        } else {
          res.json(success(result));
        }
      })
    })

    TestRouter.route('/api/referent/put/com-referent/:id_sin')
    // Modifie la ville d'un sinistre d'après son ID
    .put((req, res) => {
      pgsql.query(`UPDATE \"Sinistres\" SET commentaire_referent_sin = $2 WHERE id_sin = $1::INTEGER;`, [req.params.id_sin, req.body.commentaire_referent_sin], (err, result) => {
        if (err) {
          res.json(error(err.message))
        } else {
          res.json(success(result));
        }
      })
    })

    TestRouter.route('/api/referent/put/etat-sinistre/:id_sin')
    // Modifie la ville d'un sinistre d'après son ID
    .put((req, res) => {
      pgsql.query(`UPDATE \"Sinistres\" SET etat_sin = $2 WHERE id_sin = $1::INTEGER;`, [req.params.id_sin, req.body.etat_sin], (err, result) => {
        if (err) {
          res.json(error(err.message))
        } else {
          res.json(success(result));
        }
      })
    })
    
    TestRouter.route('/api/sinistres/consultation/:client_id')
      // Récupère les sinistres d'un client d'après son ID
      .get((req, res) => {
        pgsql.query(`SELECT * FROM \"Sinistres\" WHERE client_id = $1::INTEGER;`, [req.params.client_id], (err, result) => {
          if (err) {
            res.json(error(err.message))
          } else {
              res.json(success(result.rows));
          }
        })
      })
      TestRouter.route('/api/sinistres/consultation/commentaire/:sinistre_id')
      // Récupère les commentaires d'un sinistre d'après son ID
      .get((req, res) => {
        pgsql.query(`SELECT * FROM \"Photos\" WHERE sinistre_id = $1::INTEGER;`, [req.params.sinistre_id], (err, result) => {
          if (err) {
            res.json(error(err.message))
          } else {
              res.json(success(result.rows));
          }
        })
      })
    
    TestRouter.route('/api/sinistres/consultation/encours/:id_sin')
    // Récupère les sinistres d'un client d'après son ID
    .get((req, res) => {
      pgsql.query(`SELECT * FROM \"Sinistres\" WHERE id_sin = $1;`, [req.params.id_sin], (err, result) => {
        if (err) {
          res.json(error(err.message))
        } else {
            res.json(success(result.rows[0]));
        }
      })
    })

    

    app.use(TestRouter)
    app.listen(3000, 'localhost', () => console.log('Started on port ' + 3000))
  }
});