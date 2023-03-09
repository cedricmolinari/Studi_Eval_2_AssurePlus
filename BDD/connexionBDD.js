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



export default pgsql