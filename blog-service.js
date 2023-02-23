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

exports.getPostsByCategory = function(category) {
    return new Promise(function(resolve,reject)
    {
        let tempArr=[]
        for(let key in posts)
        {
            const post = posts[key]
            if(post.category==category)
            {
                tempArr.push(post)
            }
        }
        if(tempArr.length==0)
        {
            reject("no results returned")
        }
        resolve(tempArr)
    })
}
exports.getPostsByMinDate=function (minDateStr) {
    return new Promise(function(resolve,reject)
    {
        let tempArr=[]
        for(let key in posts)
        {
            const post = posts[key]
            if(new Date(post.postDate) >= new Date(minDateStr))
            {
                tempArr.push(post)
            }
        }
        if(tempArr.length==0)
        {
            reject("no results returned")
        }
        resolve(tempArr)
    })
}

exports.getPostById=function (id) {
    return new Promise(function(resolve,reject)
    {
        let temp={}
        for(let key in posts)
        {
            const post = posts[key]
            if(post.id==id)
            {
                temp=post
            }
        }
        if(Object.keys(temp).length==0)
        {
            reject("no results returned")
        }
        resolve(temp)
    })
}
exports.addPost=function(postData)
{
    return new Promise(function (resolve, reject)
    {
        if(postData.published == undefined)
        {
            postData.published=false;
        }
        else
        {
            postData.publised=true;
        }

        postData.id=posts.length+1;
        const newval = {
            id: postData.id,
            body: postData.body,
            title: postData.title,
            category: postData.category,
            featureImage: postData.featureImage,
            published: postData.published
        }
        console.log(newval)
        posts.push(newval)
        resolve(newval)
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