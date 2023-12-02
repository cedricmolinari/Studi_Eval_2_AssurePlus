import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
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
import bodyParser from 'body-parser';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
dotenv.config()

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

app.use(express.static(__dirname));

const s3Client = new S3Client({
    region: "eu-west-3", // Région du bucket
    //endpoint: 'https://img-assureplus.s3.eu-west-3.amazonaws.com',
  credentials: {

    accessKeyId: process.env.AccessKeyId,
    secretAccessKey: process.env.secretAccessKey
  }
});


var upload = multer({
  storage: multerS3({
      s3: s3Client,
      bucket: 'img-assureplus',
      acl: 'public-read',
      metadata: function (request, file, cb) {
          cb(null, { fieldName: file.fieldname });
      },
      key: function (request, file, cb) {
          var temp_file_arr = file.originalname.split(".");
          var temp_file_name = temp_file_arr[0];
          var temp_file_extension = temp_file_arr[1];
          var filename = temp_file_name + '-' + Date.now() + '.' + temp_file_extension;
          cb(null, filename);
      }
  })
});


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
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

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

      (async () => {
        try {
          const user = await findUserByUsername(req.body.utilisateur_ut);
          console.log(user)
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
      usernameField: 'utilisateur_ut',
      passwordField: 'password_ut'
    }, customLocalStrategy));
  
    
    TestRouter.route('/api/referents/connexion').post((req, res, next) => {
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          return next(err);
        }
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
    
    app.use(passport.initialize());
    app.use(passport.session());

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
      next();
    });
          
    TestRouter.route('/')
      
      //affiche la page d'accueil
      .get((req, res) => {
          res.sendFile(__dirname + "/Accueil/accueil.html");
      });
    
    TestRouter.route('/Accueil/accueil.html')

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
    
    TestRouter.route('/Sinistre/sinistre.html')
      //affiche la page de connexion
      .get((req, res) => {
        res.sendFile(__dirname + `/Sinistre/sinistre.html`);
      });
    
    TestRouter.route('/api/numero-clt/clients/:num_clt')

    // Récupère un client via son num_clt
    .get((req, res) => {
      pgsql.query('SELECT * FROM "Clients" WHERE num_clt = $1', [req.params.num_clt], (err, result) => {
        if (err) {
        res.json(error(err.message))
        } else {
        res.json(result.rows)
        }
    })
    })

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
              res.json(success(
                {num_clt: result.rows[0].num_clt,
                mdp_clt: decryptPassword(obj, 'Plouf@54150?')}));
          }
        })
      })

      TestRouter.route('/api/clients/num/')
  .post((req, res) => {
    pgsql.query(`SELECT num_clt, mdp_clt FROM \"Clients\" WHERE num_clt = $1;`, [req.body.num_clt], (err, result) => {
      if (err) {
        res.json(error(err.message))
      } else {
        if (result.rows[0]) {  // Vérifie que result.rows[0] existe
          const json = result.rows[0].mdp_clt;
          const obj = JSON.parse(json);
          const isPasswordCorrect = decryptPassword(obj, req.body.mdp_clt);
          if (isPasswordCorrect) {
            res.status(200).json(success({
              num_clt: result.rows[0].num_clt,
              mdp_clt: isPasswordCorrect
            }));
          } else {
            res.status(401).json({ message: 'Mot de passe incorrect' });
          }
        } else {
          res.status(404).json({ message: 'Ce numéro client est non trouvé' });  // Si result.rows[0] n'existe pas, renvoie une erreur
        }
      }
    });
  });


    TestRouter.route('/api/declaration/:client_id')
      //enregistre la déclaration de sinistre d'un client
      .post((req, res) => {
        var sql = 'INSERT INTO "Sinistres"(reference_sin, date_sin, immat_sin, dommage_corporel_sin, responsable_sin, rue_sin, ville_sin, cp_sin, commentaire_sin, client_id, etat_sin) \
                            SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, \'En cours\';';
        pgsql.query(sql, [req.body.reference_sin, req.body.date_sin, req.body.immat_sin, req.body.dommage_corporel_sin, req.body.responsable_sin, req.body.rue_sin, req.body.ville_sin, req.body.cp_sin, req.body.commentaire_sin, req.params.client_id])
          if (err) {
            res.json(error(err.message))
          } else {
            res.json(success('Déclaration réussie !'))
          }
      })
    
      TestRouter.route('/api/declarations/single-formulaire/')
      .post(function(request, response, next) {
          upload.single('document_form')(request, response, function(error) {
              if (error) {
                  return response.status(500).json({error: 'Error Uploading File'});
              } else {
                  var filename = request.file.key;
                  var sqlInsertForm =
                  `INSERT INTO "Formulaires" (document_form, date_ajout_form, sinistre_id, libelle_form) \
                      SELECT '${filename}', current_date, id_sin, '${filename}' FROM "Sinistres" AS sin \
                      WHERE sin.id_sin = (SELECT id_sin FROM "Sinistres" ORDER BY id_sin DESC limit 1)`;                 
                  pgsql.query(sqlInsertForm, (err, result) => {
                      if (err) {
                          return response.status(500).json({error: err.message});
                      } else {
                        response.json(success(`Ajout de formulaire réussi`))
                      }
                  });
              } 
          });
      });

      TestRouter.route('/api/declarations/single-formulaire/post/:sinistre_id')
      .post(function(request, response, next) {       
        upload.single('document_form')(request, response, function(error) {
            if (error) {
              return response.status(500).json({error: 'Error Uploading File'});
            } else {
                var file = request.file;
                var filename = file.key;
                
                var sqlNbForm = 
                `SELECT COUNT(*) FROM "Formulaires" WHERE sinistre_id = $1;`
                pgsql.query(sqlNbForm, [request.params.sinistre_id], (err, result) => {
                    if ((((file.size/1024)/1024).toFixed(4) > 2)) {
                        response.json({error: `Le formulaire ${filename} est trop volumineux (limite : 2 mo)`})
                    } else {

                        if (result.rows[0].count > 0) {
                            response.json({error: 'limite du nombre de formulaire dépassée (1)'})
                        } else {
  
                            var sqlForm =
                            `INSERT INTO "Formulaires" (libelle_form, date_ajout_form, sinistre_id, document_form) \
                                VALUES ('${filename}', current_date, $1, '${filename}')`;                 
                            pgsql.query(sqlForm, [request.params.sinistre_id], (err, result) => {
                                if (err) {
                                    response.json({error: err.message})
                                } else {
                                    response.json({success: `Ajout de formulaire réussi`})
                                }
                            })
                        }
                    }
                });              
            } 
        })
      });
  
      TestRouter.route('/api/declarations/multiple-images/')
    .post(function(request, response, next) {
        upload.array('image_pho', 5)(request, response, function(error) {
            if (error) {
                return response.status(500).json({error: 'Error Uploading Files'});
            } else {
                let files = request.files;
                let arrError = [];
                for(let i=0; i<files.length; i++) {
                    if ((files[i].size / 1024 / 1024) > 2) {
                        arrError.push({
                            message: `La photo ${files[i].key} est trop volumineuse (supérieure à 2 mo)`
                        });
                    } else {
                        let filename = files[i].key;
                        var sqlPho =
                        `INSERT INTO "Photos" (image_pho, date_ajout_pho, sinistre_id, libelle_pho) \
                          SELECT '${filename}', current_date, id_sin, '${filename}' FROM "Sinistres" AS sin \
                          WHERE sin.id_sin = (SELECT id_sin FROM "Sinistres" ORDER BY id_sin DESC limit 1)`;                 
                                        
                        pgsql.query(sqlPho, (err, result) => {
                            if (err) {
                                return response.status(500).json({error: err.message});
                            }
                        });
                    }
                }
                return response.json({success: `Ajout de photo(s) réussi`, arrError: arrError});
            } 
        });
    });

    TestRouter.route('/api/declarations/single-image/:sinistre_id')
    .post(function(request, response, next) {       
        upload.single('image_pho')(request, response, function(error) {
            console.log(error)
            if (error) {
              return response.status(500).json({error: 'Error Uploading File'});
            } else {
                var file = request.file;
                var filename = file.key;
                
                var sqlNbPho = 
                `SELECT COUNT(*) FROM "Photos" WHERE sinistre_id = $1;`
                pgsql.query(sqlNbPho, [request.params.sinistre_id], (err, result) => {
                    if ((((file.size/1024)/1024).toFixed(4) > 2)) {
                        response.json({error: `La photo ${filename} trop volumineuse (limite : 2 mo)`})
                    } else {

                        if (result.rows[0].count > 4) {
                            response.json({error: 'limite du nombre de photos dépassée (5)'})
                        } else {
  
                            var sqlPho =
                            `INSERT INTO "Photos" (image_pho, date_ajout_pho, sinistre_id, libelle_pho) \
                                VALUES ('${filename}', current_date, $1, '${filename}')`;                 
                            pgsql.query(sqlPho, [request.params.sinistre_id], (err, result) => {
                                if (err) {
                                    response.json({error: err.message})
                                } else {
                                    response.json({success: `Ajout de photo réussi`})
                                }
                            })
                        }
                    }
                });              
            } 
        })
    })

    
    
    TestRouter.route('/api/declarations/single-formulaire/get/:sinistre_id')
    // Récupère les formulaires d'un sinistre d'après son ID
    .get((req, res) => {
      pgsql.query(`SELECT * FROM \"Formulaires\" WHERE sinistre_id = $1::INTEGER;`, [req.params.sinistre_id], (err, result) => {
        if (err) {
          res.json(error(err.message))
        } else {
          res.json(success(result.rows));
        }
      })
    })

    TestRouter.route('/api/modif-declaration/single-formulaire/post/:sinistre_id')
    // Supprime le formulaire d'un sinistre d'après son ID
    .post((req, res) => {
      pgsql.query(`DELETE FROM \"Formulaires\" WHERE sinistre_id = $1::INTEGER AND id_form = $2::INTEGER;`, [req.body.sinistre_id, req.body.id_form], (err, result) => {
        if (err) {
          res.json(error(err.message))
        } else {
          res.json(success(result));
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
    // Supprime les photos d'un sinistre d'après son ID
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



      const PORT = process.env.PORT || 8080;

      app.use(TestRouter);
      app.listen(PORT, () => console.log('Started on port ' + PORT));
  }
});