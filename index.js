const express = require('express');
const app = express();
const pg = require('pg');

const client = new pg.Client({
    host:'localhost',
    port:5432,
    user:'postgres',
    password:'root',
    database:'postgres'
});

app.listen(3000, function() { 
    console.log("listening on port 3000")
})
