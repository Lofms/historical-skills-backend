// ./src/index.js

// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');var fs = require('fs');
var jsonl = require("jsonl");
const { stringify } = require('querystring');
const axios = require('axios');
require('dotenv').config()

var mysql = require('mysql');
const { log } = require('console');

var con = mysql.createConnection({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_password,
  database: process.env.database
});
console.log(con)

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  
});


// defining the Express app
const app = express();


// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests

app.use(morgan('combined'));



// defining an endpoint to return all ads




app.get('/summary/', async (req, res) => {
  var sqlFilter = [];
  var sqlFilterValues = [];

  if(req.query.from && req.query.to){
    sqlFilter.push(`(((? between publication_date AND last_publication_date) OR (? between publication_date AND last_publication_date)) OR ? <= publication_date AND ? >= last_publication_date)`);
    sqlFilterValues.push(req.query.from)
    sqlFilterValues.push(req.query.to)
    sqlFilterValues.push(req.query.from)
    sqlFilterValues.push(req.query.to)
  }

  if(req.query.municipality_concept_id){
    sqlFilter.push(`municipality_concept_id = ?`);
    sqlFilterValues.push(req.query.municipality_concept_id);
  }
  if(req.query.occupation_field_concept_id){
    sqlFilter.push(`occupation_field_concept_id = ?`);
    sqlFilterValues.push(req.query.occupation_field_concept_id)
  }
  if(req.query.occupation_group_concept_id){
    sqlFilter.push(`occupation_group_concept_id = ?`);
    sqlFilterValues.push(req.query.occupation_group_concept_id)
  }



  var sql = "SELECT skill,SUM(vacancies) as total_vacancies FROM historical.ads2 WHERE " + sqlFilter.join(" AND ")+" group by skill order by total_vacancies DESC LIMIT 10";
  console.log(sqlFilterValues)
  sql = mysql.format(sql, sqlFilterValues);
 




  
  con.query(sql, function (err, result) {
    if (err) throw err;
    
    res.json(result)
  });
 


});


app.get('/list/', async (req, res) => {
  var sqlFilter = [];
  var sqlFilterValues = [];
  console.log(req.query.skill)

  if(req.query.from && req.query.to){
    sqlFilter.push(`(((? between publication_date AND last_publication_date) OR (? between publication_date AND last_publication_date)) OR ? <= publication_date AND ? >= last_publication_date)`);
    sqlFilterValues.push(req.query.from)
    sqlFilterValues.push(req.query.to)
    sqlFilterValues.push(req.query.from)
    sqlFilterValues.push(req.query.to)
  }

  if(req.query.municipality_concept_id){
    sqlFilter.push(`municipality_concept_id = ?`);
    sqlFilterValues.push(req.query.municipality_concept_id);
  }
  if(req.query.occupation_field_concept_id){
    sqlFilter.push(`occupation_field_concept_id = ?`);
    sqlFilterValues.push(req.query.occupation_field_concept_id)
  }
  if(req.query.occupation_group_concept_id){
    sqlFilter.push(`occupation_group_concept_id = ?`);
    sqlFilterValues.push(req.query.occupation_group_concept_id)
  }
  if(req.query.skill){
    sqlFilter.push(`skill = ?`);
    sqlFilterValues.push(decodeURIComponent(req.query.skill))
  }



  var sql = "SELECT skill,SUM(vacancies) as total_vacancies FROM db_historicalskills.db_historicalskills WHERE " + sqlFilter.join(" AND ")+" group by skill order by total_vacancies DESC LIMIT 10";

  sql = mysql.format(sql, sqlFilterValues);






  
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(JSON.parse(result.length))
    if (JSON.parse(result.length) <= 0){
      res.json(
        [{"total_vacancies":0,"skill":req.query.skill}]
      )
    }else{
    res.json(result)
    }
  });
 


});

// starting the server
app.listen(3005, () => {
  console.log('listening on port 3005');
});