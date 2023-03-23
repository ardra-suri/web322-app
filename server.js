/*********************************************************************************
 *  WEB322 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Ardra Surendran Student ID: 112886213 Date: 2023-02-05
 *
 *  Cyclic Web App URL: https://repulsive-pink-adder.cyclic.app/
 *
 *  GitHub Repository URL: https://github.com/ardra-suri/web322-app
 *
 ********************************************************************************/

var server = require("./blog-service");
var express = require("express");
var path = require("path");
var app = express();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
cloudinary.config({
  cloud_name: "drh5zh6nv",
  api_key: "845322727774918",
  api_secret: "Y7UDXe0yaXG7exIutmxphN09jgM",
  secure: true,
});

const upload = multer();

var HTTP_PORT = process.env.PORT || 8080;

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public')); 

//GET POST DELETE UPDATE
app.get("/", function(req,res){
    res.redirect('/about');
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/posts/add", function (req, res) {
  res.render("addPost");
});

app.get("/categories",function(req,res){
    server.getCategories()
    .then((data)=>res.send(data))
    .catch((err)=>res.send(err))
});

app.get("/posts", function (req, res) {
  const category = req.query.category;
  const minDateStr = req.query.minDate;

    if(category)
    {
server.getPostsByCategory(category)
.then((data)=>res.send(data))
        .catch((err)=>res.send(err))
    }
    else if(minDateStr)
    {
server.getPostsByMinDate(minDateStr)
.then((data)=>res.send(data))
        .catch((err)=>res.send(err))
    }
    else
    {
        server.getAllPosts()
        .then((data)=>res.send(data))
        .catch((err)=>res.send(err))
    }
    
});

app.get("/posts/:value", function (req, res) {
  const temp = req.params.value;
  server
    .getPostById(temp)
    .then((data) => res.send(data))
    .catch((err) => res.send(err));
});


app.get("/blog",function(req,res){
    server.getPublishedPosts()
    .then((data)=>res.send(data))
    .catch((err)=>res.send(err))
});
app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await server.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await server.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the post by "id"
      viewData.post = await server.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await server.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

app.post("/posts/add",upload.single("featureImage"),function(req,res){
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processPost(uploaded.url);
        });
    }else{
        processPost("");
    }
     
    function processPost(imageUrl){
        req.body.featureImage = imageUrl;
    
        server.addPost(req.body)
        .then(res.redirect("/posts"))
        .catch((err)=>console.log(err))
    } 
})

// setup http server to listen on HTTP_PORT
server
  .initialize()
  .then(app.listen(HTTP_PORT, onHttpStart()))
  .catch((err) => console.log(err));
