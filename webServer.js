"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

let {makePasswordEntry, doesPasswordMatch} = require("./cs142password.js")

var mongoose = require("mongoose");

mongoose.Promise = require("bluebird");
var fs = require("fs");

var async = require("async");

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require("./schema/user.js");
var Photo = require("./schema/photo.js");
var SchemaInfo = require("./schema/schemaInfo.js");
var session = require("express-session");
var MongoStore = require('connect-mongo')(session);
var bodyParser = require("body-parser");
var multer = require("multer");
var processFormBody = multer({ storage: multer.memoryStorage() }).single(
  "uploadedphoto"
);

var express = require("express");
var app = express();

app.use(
    session({
        secret: "secretKey", 
        resave: false, 
        saveUninitialized: false, 
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
);

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
//var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect("mongodb+srv://tma:931207abc@cluster0.gfaob.mongodb.net/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not login!!!");
        return
    }
    User.find({}, function(err, foundUsers) {
        if (err) {
            console.log(err);
            return;
        }
        let newUsers = [];
        async.each(foundUsers, function(user, callback) {
            let {_id, first_name, last_name} = user;
            newUsers.push({
                _id: _id,
                first_name: first_name,
                last_name: last_name
            });
            callback();
        }, function(error) {
            if (error) {
                console.log(error);
            } else {
                response.status(200).send(JSON.stringify(newUsers));
            }
        });
    });
});

// return all the user object beyond the current user
app.get("/user/others", function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not login!!!");
        return
    }
    User.find({}, function(err, foundUsers) {
        if (err) {
            console.log(err);
            return;
        }
        let newUsers = [];
        async.each(foundUsers, function(user, callback) {
            let {_id, first_name, last_name} = user;
            if (String(_id) !== String(request.session.user_id)) {
                newUsers.push({
                    _id: _id,
                    first_name: first_name,
                    last_name: last_name
                });
            }
            callback();
        }, function(error) {
            if (error) {
                console.log(error);
            } else {
                response.status(200).send(JSON.stringify(newUsers));
            }
        });
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not login!!!");
        return
    }
    var id = request.params.id;
    User.findOne({_id: id}, function(err, foundUser) {
        if (err) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let {_id, first_name, last_name, location, description, occupation, mentioned, favoritePhotos} = foundUser;
        let newUser = {
            _id: _id,
            first_name: first_name,
            last_name: last_name,
            location: location,
            description: description,
            occupation: occupation,
            mentioned: mentioned,
            favoritePhotos: favoritePhotos
        }
        response.status(200).send(newUser); 
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not login!!!");
        return
    }
    var id = request.params.id;
    Photo.find({user_id: id}, function(err, foundPhotos) {
        if (err) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let newPhotos = JSON.parse(JSON.stringify(foundPhotos));
        async.each(newPhotos, function(photo, callback) {
            delete photo.__v;
            async.each(photo.comments, function(comment, callback1) {
                let theUser = User.findOne({_id: comment.user_id}, function(errMessage) {
                    if (errMessage) {
                        console.log(errMessage);
                    }
                });
                theUser.then((user) => {
                    let {_id, first_name, last_name} = user;
                    comment.user = {
                        _id: _id,
                        first_name: first_name,
                        last_name: last_name
                    }
                    delete comment.user_id;
                    callback1();
                });
            }, function(error) {
                if (error) {
                    console.log(error);
                } else {
                    callback();
                }
            });
        }, function(err) {
            if (!err) {
                // sort the photos based on 1.likeUsers length, 2.date(most recent first)
                newPhotos.sort(function(photo1, photo2) {
                    if (photo1.date_time > photo2.date_time) {
                        return -1
                    } else if (photo1.date_time === photo2.date_time) {
                        return 0
                    } else {
                        return 1
                    }
                });
                response.status(200).send(newPhotos); 
            }
        });
    });
});

// handle the post request from register
app.post("/user", function(req, res) {
    let {login_name, password, first_name, last_name, location, description, occupation} = req.body;
    User.findOne({login_name: login_name}, function(err, foundUser) {
        if (foundUser) {
            res.status(400).send("User already exists");
        } else {
            let {salt, hash} = makePasswordEntry(password);
            let newUser = new User({
                login_name: login_name,
                password_digest: hash,
                salt: salt,
                first_name: first_name,
                last_name: last_name,
                location: location,
                description: description,
                occupation: occupation
            });
            newUser.save(error => {
                if (!error) {
                    req.session.user_id = newUser._id;
                    req.session.cookie.originalMaxAge = 1000000000000000;
                    req.session.cookie.reSave = true;
                    res.status(200).send(newUser);
                } else {
                    console.log(error);
                }
            });
        }
    });
});

// handle the post request from login
app.post("/admin/login", function(req, res) {
    let {login_name, password} = req.body;
    User.findOne({login_name: login_name}, function(err, foundUser) {
        if (err || !foundUser) {
            res.status(400).send("User doesn't exist!!!");
            return
        } else if (!doesPasswordMatch(foundUser.password_digest, foundUser.salt, password)) {
            res.status(400).send("User password doesn't match");
        } else {
            let { _id, first_name, last_name, login_name } = foundUser;
            let newUser = { _id, first_name, last_name, login_name };
            req.session.user_id = newUser._id;
            req.session.cookie.originalMaxAge = 1000000000000000;
            req.session.cookie.reSave = true;
            res.status(200).send(newUser);
        }
    });
});

// handle the logout request
app.post("/admin/logout", function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            res.status(400).send("Unable to logout");
        } else {
            res.status(200).send();
        }
    });
});

app.post("/commentsOfPhoto/:photoId", function(req, res) {
    if (!req.session.user_id) {
        res.status(401).send("Not login!!!");
        return
    }
    let userId = req.session.user_id;
    let photoId = req.params.photoId;
    let comment = req.body.comment;
    let mentionUsers = req.body.mentionUsers;
    if (comment === "") {
        res.status(400).send("Invalid comment");
        return
    }
    Photo.findOne({_id: photoId}, function(err, foundPhoto) {
        if (err) {
            res.status(400).send("Invalid photo ID");
            return
        }
        let now = new Date();
        foundPhoto.comments.push({
            user_id: userId,
            photo_id: photoId,
            date_time: now,
            comment: comment
        });
        foundPhoto.save();
        async.each(mentionUsers, function(user, callback) {
            User.findOne({_id: user}, function(error, foundUser) {
                if (error) {
                    res.status(400).send("Invalid user mentioned");
                    return
                }
                if (comment.includes("@" + foundUser.first_name + " " + foundUser.last_name)) {
                    foundUser.mentioned.push(photoId);
                    foundUser.save();
                }
                callback();
            });
        }, function(err) {
            if (err) {
                res.status(400).send("Can't save to the user");
            } else {
                res.status(200).send();
            }
        });
    });
});

app.post("/photos/new", function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not login!!!");
        return
    }
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send("File not valid!");
            return;
        }
        let specifyPermit = JSON.parse(request.body.specifyPermit);
        let permitUsers = JSON.parse(request.body.permitUsers);
        permitUsers.push(request.session.user_id);
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes
    
        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;
    
        fs.writeFile("./images/" + filename, request.file.buffer, function (error) {
          // XXX - Once you have the file written into your images directory under the name
          // filename you can create the Photo object in the database
          if (error) {
              response.status(400).send("Can't write the file");
              return
          }
          let newPhoto = new Photo({
              user_id: request.session.user_id,
              date_time: timestamp,
              file_name: filename,
              comments: [],
              specifyPermit: specifyPermit,
              permission: permitUsers
          });
          newPhoto.save(errMessage => {
              if (errMessage) {
                  response.status(400).send("Can't create the photo");
                  return
              }
              response.status(200).send("Successfully create the new photo");
          });
        });
    });
});

// get a list of users to be mentioned
app.get("/users/mention", function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not login!!!");
        return
    }
    User.find({}, function(err, foundUsers) {
        if (err) {
            console.log(err);
            return;
        }
        let newUsers = [];
        async.each(foundUsers, function(user, callback) {
            let {_id, first_name, last_name} = user;
            newUsers.push({
                id: _id,
                display: first_name + " " + last_name
            });
            callback();
        }, function(error) {
            if (error) {
                console.log(error);
            } else {
                response.status(200).send(JSON.stringify(newUsers));
            }
        });
    });
});

// get photo's info based on the photo id
app.get("/photo/:id", function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not login!!!");
        return
    }
    var id = request.params.id;
    Photo.findOne({_id: id}, function(err, foundPhoto) {
        if (err) {
            response.status(400).send("Invalid photo id");
            return
        }
        User.findOne({_id: foundPhoto.user_id}, function(error, foundUser) {
            if (error) {
                response.status(400).send("Photo has an invalid user id");
                return
            }
            let newPhoto = {
                userId: foundUser._id,
                file_name: foundPhoto.file_name,
                userName: foundUser.first_name + " " + foundUser.last_name,
                specifyPermit: foundPhoto.specifyPermit,
                permission: foundPhoto.permission,
                likeUsers: foundPhoto.likeUsers
            }
            response.status(200).send(newPhoto);
        });
    });
});

// delete comment based on comment id
app.post("/comment/delete/:commentId", function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not login!!!");
        return
    }
    let commentId = request.params.commentId;
    let photoId = request.body.photoId;
    let content = undefined;
    Photo.findOne({_id: photoId}, function(err, foundPhoto) {
        if (err) {
            response.status(400).send("Invalid photo id");
            return
        }
        foundPhoto.comments = foundPhoto.comments.filter(comment => {
            if (String(comment._id) === String(commentId)) {
                content = comment.comment;
            }
            return String(comment._id) !== String(commentId);
        });
        foundPhoto.save();

        User.find({}, function(err1, foundUsers) {
            if (err1) {
                response.status(400).send("Can't find users");
                return
            }
            async.each(foundUsers, function(user, callback) {
                let temp = "@" + user.first_name + " " + user.last_name;
                if (content.includes(temp)) {
                    let firstOccur = user.mentioned.indexOf(photoId);
                    let newList = [];
                    for (var i = 0; i < user.mentioned.length; i++) {
                        if (i !== firstOccur) {
                            newList.push(user.mentioned[i]);
                        }
                    }
                    user.mentioned = newList;
                    user.save();
                }
                callback();
            }, function(error) {
                if (error) {
                    response.status(400).send("Something wnet wrong when updating user mentioned");
                } else {
                    response.status(200).send();
                }
            });
        });
    });
});

// delete photo based on photo id
app.post("/photo/delete/:photoId", function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not login!!!");
        return
    }
    let photoId = request.params.photoId;
    Photo.deleteOne({_id: photoId}, function(err) {
        if (err) {
            response.status(400).send("Invalid photo id");
            return
        }
        User.find({}, function(err1, foundUsers) {
            if (err1) {
                response.status(400).send("Can't find users");
                return
            }
            async.each(foundUsers, function(user, callback) {
                user.mentioned = user.mentioned.filter(id => {
                    return String(id) !== String(photoId);
                });
                user.favoritePhotos = user.favoritePhotos.filter(id => {
                    return String(id) !== String(photoId);
                }); 
                user.save();
                callback()
            }, function(error) {
                if (error) {
                    response.status(400).send("Something wnet wrong when updating user mentioned");
                } else {
                    response.status(200).send();
                }
            });
        });
    });
});

// delete the user based on user id
app.post("/user/delete/:userId", function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not login!!!");
        return
    }
    let userId = request.params.userId;
    User.deleteOne({_id: userId}, function(err1) {
        if (err1) {
            response.status(400).send("Invalid user id");
            return
        }
        Photo.deleteMany({user_id: userId}, function(err2) {
            if (err2) {
                response.status(400).send("Can't delete the photos of the user");
                return  
            }
            Photo.find({}, function(err3, foundPhotos) {
                if (err3) {
                    response.status(400).send("Can't find photos");
                    return 
                }
                async.each(foundPhotos, function(photo, callback) {
                    photo.comments = photo.comments.filter(comment => {
                        return String(userId) !== String(comment.user_id);
                    });
                    photo.permission = photo.permission.filter(id => {
                        return String(id) !== String(userId);
                    });
                    photo.likeUsers = photo.likeUsers.filter(id => {
                        return String(id) !== String(userId);
                    });
                    photo.save();
                    callback();
                }, function(error) {
                    if (error) {
                        response.status(400).send("Something went wrong when updating photo info");
                    } else {
                        response.status(200).send();
                    }
                });
            });
        });
    });
});

// handle like or dislike the photo
app.post("/photo/like/:photoId", function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not login!!!");
        return
    }
    let photoId = request.params.photoId;
    let userId = request.session.user_id;
    let liked = !request.body.liked;
    Photo.findOne({_id: photoId}, function(err, foundPhoto) {
        if (err) {
            response.status(400).send("Invalid photo id");
            return
        }
        if (liked) {
            foundPhoto.likeUsers.push(userId);
        } else {
            foundPhoto.likeUsers = foundPhoto.likeUsers.filter(id => {
                return String(id) !== String(userId);
            });
        }
        foundPhoto.save();
        response.status(200).send();
    });
});

// handle favorite or dis-favorite the photo
app.post("/handleFavorite/:userId", function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not login!!!");
        return
    }
    let userId = request.params.userId;
    let photoId = request.body.photoId;
    let favorited = request.body.favorited;
    User.findOne({_id: userId}, function(err, foundUser) {
        if (err) {
            response.status(400).send("Invalid user id");
            return 
        }
        if (favorited) {
            foundUser.favoritePhotos.push(photoId);
        } else {
            foundUser.favoritePhotos = foundUser.favoritePhotos.filter(id => {
                return String(id) !== String(photoId);
            });
        }
        foundUser.save();
        response.status(200).send();
    });
});

// get an array of photo objects that user favorited
app.get("/getFavorites/:userId", function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("Not login!!!");
        return
    }
    let userId = request.params.userId;
    User.findOne({_id: userId}, function(err, foundUser) {
        if (err) {
            response.status(400).send("Invalid user id");
            return 
        }
        let result = [];
        async.each(foundUser.favoritePhotos, function(photoId, callback) {
            Photo.findOne({_id: photoId}, function(err1, foundPhoto) {
                if (err1) {
                    response.status(400).send("Invalid photo id");
                    return 
                }
                let {date_time, file_name} = foundPhoto;
                result.push({
                    _id: photoId,
                    date_time: date_time,
                    file_name: file_name
                });
                callback();
            });
        }, function(error) {
            if (error) {
                response.status(400).send("Can't return the valid photos");
            } else {
                response.status(200).send(result);
            }
        });
    });
});

let p = process.env.PORT;
if (p === null || p === "") {
    p = 3000;
}

var server = app.listen(p, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


