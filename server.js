'use strict';

const express=require('express');
require('dotenv').config();
const server=express();

const pg=require('pg');
const superagent=require('superagent');
const methodOverride=require('method-override');
const cors=require('cors');
server.use(cors());

// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });


server.use(methodOverride('_method'));
server.use(express.static('./public'));
server.set('view engine', 'ejs');

server.use(express.urlencoded({ extended: true }));

const PORT=process.env.PORT || 5000;

//////////////////////////////////////////////////////////////////////////

server.get('/' ,homehandeld)
function homehandeld(req ,res)
{
    let URL =`https://thesimpsonsquoteapi.glitch.me/quotes?count=10`;
    superagent.get(URL).set('User-Agent', '1.0')
    .then(result => {
         res.render('pages/index',{data :  result.body});
        // res.send(result.body);
        });
      
    
}
////////////////////////////////////

server.post('/save' , savehandled)
function savehandled (req ,res)
{
    let{quote ,character , image ,characterDirection}=req.body;
    let SQL=`INSERT INTO smson (quote ,character , image ,characterDirection)
    VALUES($1,$2, $3, $4 ) RETURNING *`;
    let savedata=[quote ,character , image ,characterDirection];
    client.query(SQL ,savedata)
    .then(result => {
        res.redirect('/favorite-quotes');
    });
}
//////////////////////////////

server.get('/favorite-quotes' , favourthandled)
function favourthandled(req ,res)
{
    let SQL=`SELECT * FROM smson;`;
    client.query(SQL)
    .then(result => {
        res.render('pages/savedQuotes',{data: result.rows});
        //because all data insert the rows;
       
    });
}

///////////////////////////////////

server.get('/favorite-quotes/:id' , detailshandled)
function detailshandled (req ,res)
{
    let SQL=`SELECT * FROM smson WHERE id=$1;`;
    let save=[req.params.id];
    client.query(SQL ,save)
    .then( result => {
        res.render('pages/details' ,{data :result.rows[0]});
    });

}

//////////////////
server.put('/updata/:id' , updatehandled)
function updatehandled(req ,res)
{
   let{quote ,character ,image ,characterDirection}=req.body;
   let SQL=`UPDATE  smson SET quote=$1 WHERE id=$2;`;
   let save=[quote ,req.params.id];
   client.query(SQL,save)
   .then(result => {
    res.redirect(`/favorite-quotes/${req.params.id}`);
   });
}

server.delete('/delet/:id' , delethandled)
function delethandled(req ,res )
{
    let sql=`UPDATE smson SET quote= null WHERE id=$1;`;
    let save=[req.params.id];
    client.query(sql ,save)
    .then(result => {
        res.redirect(`/favorite-quotes/${req.params.id}`);
    });
}



// server.get('/delet/:id' , delet)
// function delet(req ,res)
// { 
   
//     let sql=`DROP COLUMN quote FROM smson;`;
//     let save=[req.params.id];
//     client.query(sql ,save)
//     .then(result => {
//         res.redirect(`/sewar/${req.params.id}`);
//     });
// }



// ///////////////////////////////////////////////////////////////////////////////
server.get('*' ,errorhandler)

function errorhandler(req ,res)
{
    res.send('THERE SOMTHING ERROR');
}

client.connect()
.then(  () => {
    server.listen( PORT ,() => {
        console.log( `listiing on your port ${PORT}`);
    })
});