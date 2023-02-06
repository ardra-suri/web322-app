/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Ardra Surendran Student ID: 112886213 Date: 2023-02-05
*
*  Cyclic Web App URL: ________________________________________________________
*
*  GitHub Repository URL: ______________________________________________________
*
********************************************************************************/ 

var server = require("./blog-service");
var express = require("express");
var path = require("path");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public')); 

//GET POST DELETE UPDATE
app.get("/", function(req,res){
    res.redirect('/about');
});

app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/categories",function(req,res){
    server.getCategories()
    .then((data)=>res.send(data))
    .catch((err)=>res.send(err))
});

app.get("/posts",function(req,res){
    server.getAllPosts()
    .then((data)=>res.send(data))
    .catch((err)=>res.send(err))
});

app.get("/blog",function(req,res){
    server.getPublishedPosts()
    .then((data)=>res.send(data))
    .catch((err)=>res.send(err))
});

// setup http server to listen on HTTP_PORT
server.initialize()
.then(app.listen(HTTP_PORT, onHttpStart()))
.catch((err)=>console.log(err));