const Sequelize = require("sequelize");
const { gte } = Sequelize.Op;

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

var Post = sequelize.define("Post", {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
});

var Category = sequelize.define("Category", {
  category: Sequelize.STRING,
});

Post.belongsTo(Category, { foreignKey: "category" });

const fs = require("fs");

exports.getAllPosts = function () {
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then((msg) => {
        console.log(msg);
        resolve(msg);
      })
      .catch((msg) => reject(msg));
  });
};

exports.getPublishedPosts = function () {
  return new Promise((resolve, reject) => {
    Post.findAll({ where: { published: true } })
      .then((msg) => resolve(msg))
      .catch((msg) => reject(msg));
  });
};

exports.getPublishedPostsByCategory = function (value) {
  return new Promise((resolve, reject) => {
    Post.findAll({ where: { published: true, category: value } })
      .then((msg) => resolve(msg))
      .catch((msg) => reject(msg));
  });
};

exports.getCategories = function () {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((msg) => resolve(msg))
      .catch((msg) => reject(msg));
  });
};

exports.getPostsByCategory = function (value) {
  return new Promise((resolve, reject) => {
    Posts.findAll({ where: { category: value } })
      .then((msg) => resolve(msg))
      .catch((msg) => reject(msg));
  });
};

exports.getPostsByMinDate = function (minDateStr) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        postDate: {
          [gte]: new Date(minDateStr),
        },
      }
        .then((msg) => resolve(msg))
        .catch((msg) => reject(msg)),
    });
  });
};

exports.getPostById = function (value) {
  return new Promise((resolve, reject) => {
    Posts.findOne({ where: { id: value } })
      .then((msg) => resolve(msg))
      .catch((msg) => reject(msg));
  });
};

exports.addPost = function (postData) {
  return new Promise((resolve, reject) => {
    postData.published = postData.published ? true : false;
    for (data in postData) {
      if (data == "") {
        data = null;
      }
    }
    postData.postDate = new Date();
    Post.create({
      body: postData.body,
      title: postData.title,
      postDate: postData.postDate,
      feautureImage: postData.featureImage,
      published: postData.published,
    })
      .then((msg) => resolve(msg))
      .catch((msg) => reject(msg));
  });
};

exports.addCategory = function (categoryData) {
  return new Promise((resolve, reject) => {
    for (data in categoryData) {
      if (data == "") {
        data = null;
      }
    }
    Category.create({
      category: categoryData.category,
    })
      .then((msg) => resolve(msg))
      .catch((msg) => reject(msg));
  });
};

exports.deleteCategoryById = function (value) {
  return new Promise((resolve, reject) => {
    Category.destroy({ where: { id: value } })
      .then((msg) => resolve(msg))
      .catch((msg) => reject(msg));
  });
};

exports.deletePostById = function (value) {
  return new Promise((resolve, reject) => {
    Post.destroy({ where: { id: value } })
      .then((msg) => resolve(msg))
      .catch((msg) => reject(msg));
  });
};

exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then((msg) => resolve(msg))
      .catch((msg) => reject(msg));
  });
};
