var posts= []
var categories = []
const fs = require("fs"); 

function readCategories()
{
    return new Promise(function (resolve, reject){
        fs.readFile("./data/categories.json", "utf-8", (err, data) => {
            if (err) {
              reject("File is not readable");
            }
              categories = JSON.parse(data);
              resolve("Posts loaded")
          })
      });
}
exports.initialize = function(){
    return new Promise(function(resolve,reject)
    {
        fs.readFile("./data/posts.json","utf-8",(err,data)=>{
            if(err){
                reject("no results returned")
            }
            posts= JSON.parse(data)
        })
        resolve("Loaded")
    })
    .then(readCategories)
    .catch((err)=>console.log(err))
}
            
exports.getAllPosts = function() {
    return new Promise(function(resolve,reject)
    {
        if(posts.length==0)
        {
            reject("no results returned")
        }
        resolve(posts)
    })
}

exports.getPublishedPosts = function() {
    return new Promise(function(resolve,reject)
    {
        if(posts.length==0)
        {
            reject("no results returned")
        }
        var temp = []

        for(var i=0;i<posts.length;i++)
        {
            if(posts[i].published==true)
            {
                temp.push(posts[i])
            }
        }
        resolve(temp)
    })
}

exports.getCategories = function() {
    return new Promise(function(resolve,reject)
    {
        if(categories.length==0)
        {
            reject("no results returned")
        }
        resolve(categories)
    })
}
