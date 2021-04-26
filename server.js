'use strict';

const express=require('express');
require('dotenv').config();
const server=express();

const pg=require('pg');
const superagent=require('superagent');
const methodOverride=require('method-override');
const cors=require('cors');
server.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);

server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));
server.use(express.static('./public'));
server.set('view engine', 'ejs');

const PORT=process.env.PORT || 5000;

server.get('/' , homehandler)
function homehandler(req ,res)
{
    let URL=`https://thesimpsonsquoteapi.glitch.me/quotes?count=10`;
    superagent.get(URL).set('User-Agent', '1.0')
    .then(result => {
        let data= result.body.map(element => {
        return new Simpson(element)
         });
         res.render('pages/index' ,{sipson:data} );
    });
}
///////////////////////////////////////////////////////////////////////////////
server.get('/save' , savehandler)
function savehandler(req ,res)
{
    let {quote ,character , image ,characterDirection}=req.query;
    let SQL=`INSERT INTO smson (quote,character,image,characterDirection) 
    VALUES($1,$2,$3,$4) RETURNING * ;`;

    let savadata=[quote ,character , image ,characterDirection];
    client.query(SQL ,savadata)
    .then(result => {
        res.redirect('/favorite-quotes');
    });
}
/////////////////////////////////////////////////////////////////DATABASE/////

server.get('/favorite-quotes' , favhandled)
function favhandled(req ,res)
{
    
    let SQL =`SELECT * FROM smson ;`;
    client.query(SQL)
    .then(result => {
        // console.log(result);
        // console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',result.rows , '000000000000000000000000000000000000');
        res.render('pages/savedQuotes' , {data :result.rows});
    });
}
///////////////////////////////////////////////////////////////////////////
server.get('/sewar/:id' , saveid)
function saveid(req ,res)
{
    let sql=`SELECT * FROM smson WHERE id=$1;`;
    let savadata=[req.params.id];
    client.query(sql ,savadata)
    .then(result => {
        // console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',result.rows[0] , '000000000000000000000000000000000000');
        
        res.render('pages/details' ,{data :result.rows[0]});
    });


}
///////////////////////////////////////
server.get('/updata/:id' ,updata)
function updata(req ,res )
{
    let{quote ,character , image ,characterDirection}=req.query;
    let sql=`UPDATE smson SET  quote=$1 WHERE id=$2;`;
    let sava=[quote ,req.params.id];
    client.query(sql ,sava)
    .then(result => {
        res.redirect(`/sewar/${req.params.id}`);
    });
}



server.get('/delet/:id' , delet)
function delet(req ,res)
{
    let sql=`ALTER TABLE smson
    DROP COLUMN  quote ;`;
    let save=[req.params.id];
    client.query(sql ,save)
    .then(result => {
        res.redirect(`/sewar/${req.params.id}`);
    });
}

//////////////////////////////////cosntructors/////////////
 function Simpson(data)
 {
     this.quote=data.quote;
     this.character=data.character;
     this.image=data.image;
     this.characterDirection=data.characterDirection;
   
 }


///////////////////////////////////////////////////////////////////////////////
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