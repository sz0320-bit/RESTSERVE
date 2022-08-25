const express = require('express');
const app = express();
const PORT = 8080;

const {Client} = require('pg');

require('dotenv/config');

const client = new Client({
   host:process.env.HOST,
   user:process.env.USER_NAME,
   password:process.env.PASS,
   database:process.env.DB,
   port:process.env.DB_PORT
});

client.connect();

app.use(express.json());

app.listen(PORT, () => {
   console.log('Server Up and Running!!!');
});

app.get('/getAllDB',async (req,res) => {

   const result = await client.query('SELECT * FROM todos ORDER BY createdat');
   const retResult =  result.rows;
   res.status(200).send(retResult);
});

app.get('/getFromAcc/:uuid',async (req,res) => {
   const {uuid} = req.params;

   if(!uuid){
      return res.status(401).json({
         "error": "no UID mentioned"
      })
   }

   const result = await client.query('SELECT * FROM todos WHERE uuid = $1 ORDER BY createdat', [uuid]);
   const retResult =  result.rows;
   res.status(200).send(retResult);
});

app.post('/addTask/:uuid',async (req,res) => {
   const {uuid} = req.params;
   const {payload} = req.body;
   const text = payload.text;
   const desc = payload.desc;

   if(!text || !desc){
      return res.status(401).json({
         error: "missing items from body, recheck post"
      });
   }

   const timestamp = new Date().toISOString();

   const response = await client.query('INSERT INTO todos ("desc",uuid,text,createdat,updatedat) VALUES ($1,$2,$3,$4,$5) RETURNING *', [desc,uuid,text,timestamp,timestamp]);
   const rows = response.rows;

   res.status(200).send({rows});
});

app.delete('/deleteTask/:uuid/:id',async (req,res) => {
   const {uuid,id} = req.params;

   const response = await client.query('DELETE FROM todos WHERE id = $1 AND uuid = $2 RETURNING *', [id,uuid]);
   const rows = response.rows;

   res.status(200).send({rows});

});

app.patch('/updateTask/:uuid/:id',async (req,res) => {
   const {uuid,id} = req.params;
   const {text,desc} = req.body;


   if(!text || !desc){
      return res.status(401).json({
         error: "missing items from body, recheck post"
      });
   }

   const response = await client.query('UPDATE todos SET text = $1, "desc" = $2, updatedat = $3 WHERE id = $4 AND uuid = $5 RETURNING *', [text,desc,new Date().toISOString(),id,uuid]);
   const rows = response.rows;



   res.status(200).send({rows});

});