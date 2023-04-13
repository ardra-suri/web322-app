var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var userSchema = new Schema({
  userName: {
    type: String,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(
      "mongodb+srv://asurendran3:ZdxwAtdpcNG256YM@senecalab.oavp3mc.mongodb.net/?retryWrites=true&w=majority"
    );

    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = function (userData) {
  return new Promise(function (resolve, reject) {
    if (userData.password == userData.password2) {
      let newUser = new User(userData);
      bcrypt
        .hash(newUser.password, 10)
        .then((hash) => {
          newUser.password = hash;
          return newUser.save();
        })
        .then(() => {
          resolve();
        })
        .catch((err) => {
          if (err.code == 11000) {
            reject("User name already taken");
          } else {
            reject("There was an error creating the user: " + err);
          }
        });
    } else {
      reject("Passwords do not match");
    }
  });
};

// module.exports.checkUser = function (userData) {
//   return new Promise(function (resolve, reject) {
//     User.find({ userName: userData.userName })
//       .then((users) => {
//         if (users.length == 0) {
//           reject("Unable to find user: " + userData.userName);
//         } else {
//           if (userData.password == users[0].password) {
//             users[0].loginHistory.push({
//               dateTime: new Date().toString(),
//               userAgent: userData.userAgent,
//             });

//             User.updateOne(
//               { userName: userData.userName },
//               { $set: { loginHistory: users[0].loginHistory } }
//             )
//               .exec()
//               .then(() => {
//                 resolve(users[0]);
//               })
//               .catch((err) => {
//                 reject(
//                   "There was an error updating the user's login history: " + err
//                 );
//               });
//           } else {
//             reject("Incorrect Password for user:" + userData.userName);
//           }
//         }
//       })
//       .catch((err) => {
//         reject("An error occured: " + err);
//       });
//   }).catch((err) => {
//     reject("Unable to find user: " + userData.userName);
//   });
// };
exports.checkUser = function (userData) {
  return new Promise(function (resolve, reject) {
    User.find({ userName: userData.userName })
      .then((users) => {
        if (users.length == 0) {
          reject("Unable to find user: " + userData.userName);
        } else {
          bcrypt
            .compare(userData.password, users[0].password)
            .then((result) => {
              if (result === true) {
                users[0].loginHistory.push({
                  dateTime: new Date().toString(),
                  userAgent: userData.userAgent,
                });

                User.updateOne(
                  { userName: userData.userName },
                  { $set: { loginHistory: users[0].loginHistory } }
                )
                  .exec()
                  .then(() => {
                    resolve(users[0]);
                  })
                  .catch((err) => {
                    reject(
                      "There was an error updating the user's login history: " +
                        err
                    );
                  });
              } else {
                reject("Incorrect Password for user:" + userData.userName);
              }
            })
            .catch((err) => {
              reject("An error occured: " + err);
            });
        }
      })
      .catch((err) => {
        reject("Unable to find user: " + userData.userName);
      });
  });
};
