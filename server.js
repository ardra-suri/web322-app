/*********************************************************************************
 *  WEB322 – Assignment 06
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
var authData = require("./auth-service");
var clientSessions = require("client-sessions");
var express = require("express");
var exphbs = require("express-handlebars");
const stripJs = require("strip-js");
var path = require("path");
var app = express();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const Sequelize = require("sequelize");

// set up sequelize to point to our postgres database
var sequelize = new Sequelize(
  "rtbkqckn",
  "rtbkqckn",
  "JZtFZ-WdXEG-OLw2L1FDoG1_mNy6fC7a",
  {
    host: "peanut.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

sequelize
  .authenticate()
  .then(function () {
    console.log("Connection has been established successfully.");
  })
  .catch(function (err) {
    console.log("Unable to connect to the database:", err);
  });

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

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? "" : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
    },
  })
);

app.use(
  clientSessions({
    cookieName: "session",
    secret: "Assignment_6_Web322",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

//GET POST DELETE UPDATE
app.get("/", function (req, res) {
  res.redirect("/blog");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/posts/add", ensureLogin, function (req, res) {
  res.render("addPost");
});

app.get("/categories", ensureLogin, function (req, res) {
  server
    .getCategories()
    .then((data) => {
      if (data.length > 0) {
        res.render("categories", { categories: data });
      } else {
        res.render("categories", { message: "no results" });
      }
    })
    .catch((err) => res.render("categories", { message: "no results" }));
});

app.get("/posts", ensureLogin, function (req, res) {
  const category = req.query.category;
  const minDateStr = req.query.minDate;

  if (category) {
    server
      .getPostsByCategory(category)
      .then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch((err) => res.render("posts", { message: "no results" }));
  } else if (minDateStr) {
    server
      .getPostsByMinDate(minDateStr)
      .then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch((err) => res.render("posts", { message: "no results" }));
  } else {
    server
      .getAllPosts()
      .then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch((err) => res.render("posts", { message: "no results" }));
  }
});

app.get("/posts/:value", ensureLogin, function (req, res) {
  const temp = req.params.value;
  server
    .getPostById(temp)
    .then((data) => res.send(data))
    .catch((err) => res.send(err));
});

app.get("/blog", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await server.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await server.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await server.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

app.get("/blog/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await server.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await server.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the post by "id"
    viewData.post = await server.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await server.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

app.get("/categories/add", ensureLogin, function (req, res) {
  res.render("addCategory");
});

app.get("/posts/delete/:id", ensureLogin, function (req, res) {
  const value = req.params.id;
  server
    .deletePostById(value)
    .then(() => res.redirect("/posts"))
    .catch(() => res.status(500).send("Unable to Remove Post/Post not found)"));
});

app.get("/categories/delete/:id", ensureLogin, function (req, res) {
  const value = req.params.id;
  server
    .deleteCategoryById(value)
    .then(() => res.redirect("/categories"))
    .catch(() =>
      res.status(500).send("Unable to Remove Category/Category not found)")
    );
});

app.get("/posts/add", ensureLogin, function (req, res) {
  server.getCategories
    .then((data) => res.render("addPost", { categories: data }))
    .catch(() => res.render("addPost", { categories: [] }));
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/logout", function (req, res) {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, function (req, res) {
  res.render("userHistory");
});

app.post("/register", function (req, res) {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

app.post("/login", function (req, res) {
  req.body.userAgent = req.get("User-Agent");
  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/posts");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.post(
  "/posts/add",
  ensureLogin,
  upload.single("featureImage"),
  function (req, res) {
    if (req.file) {
      let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          });

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
      }

      upload(req).then((uploaded) => {
        processPost(uploaded.url);
      });
    } else {
      processPost("");
    }

    function processPost(imageUrl) {
      req.body.featureImage = imageUrl;

      server
        .addPost(req.body)
        .then(() => res.redirect("/posts"))
        .catch((err) => console.log(err));
    }
  }
);

app.post("/categories/add", ensureLogin, function (req, res) {
  server
    .addCategory(req.body)
    .then(() => res.redirect("/categories"))
    .catch((err) => console.log(err));
});

// setup http server to listen on HTTP_PORT
server
  .initialize()
  .then(authData.initialize)
  .then(() => app.listen(HTTP_PORT, onHttpStart()))
  .catch((err) => console.log(err));
