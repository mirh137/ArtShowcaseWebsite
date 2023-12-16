// getting express and sessions
let express = require("express");
const session = require("express-session");
const app = express();
// setting up session
app.use(session({
    secret:"This is  a secret",
    resave: true,
    saveUninitialized: true
}));
//setting the view engine and express.json so it automatically parses to JSON
app.set("view engine", "pug");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// setting up mongo
let mongo = require("mongodb");
let MongoClient = mongo.MongoClient;
let db;
// all the links and the functions they call
app.get("/", renderHome);
app.get("/login", renderLogin);
app.get("/register", renderRegistration);
app.post("/register", addUser);
app.post("/login", login);
app.get("/login/:username", renderUser);
app.put("/login/:username", upgradeArtist);
app.get("/artworks/:artworkName", loadArtwork);
app.post("/artworks/:artworkName", addReview);
app.put("/artworks/:artworkName", increaseLike);
app.get("/similiarworks/:category/:medium", findSimiliar);
app.get("/artists/:artistName", renderArtist);
app.put("/unfollow/:user", unfollowUser);
app.get("/artworks/:name/:artistName/:category", findMatchingArtworks);
app.get("/logout", logoutUser);
app.get("/addart", renderAddArt);
app.post("/addart", addArtDatabase);
app.post("/addworkshop",auth,addWorkshopDatabase);
app.put("/follow/:user", followUser);
app.put("/unlike/:art", dislike);

// function to authorize the user
function auth(req, res, next){
    // if the user is not logged in then they are unauthorized
    if(!req.session.loggedin){
        res.status(401).send("Unauthorized");
        return;
    }
    //find a user whose username matched the logged in username
    db.collection("users").findOne({"username": req.session.username, "userType": "Artist"}, function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        if(!result){
            res.status(401).send("Unauthorized");
            return;
        }
        // pass on to the next middleware
        next();
    });
}
// function to remove likes from a artwork
function dislike(req, res, next){
    let art = req.body;
    // updating the liked list of the currently logged in user
    db.collection("users").updateOne({"username": req.session.username}, {$pull:{"liked": art}}, function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        else{
            res.status(200).send("Succesfully removed like!");
        }
    });
}
// function to follow a user
function followUser(req, res, next){
    let userToFollow = req.params.user;
    // making sure the user that not allowed to follow themselves
    if(req.session.username !== userToFollow){
        // updating the artists followed by the currently signed in user
        db.collection("users").updateOne({"username": req.session.username}, {$push: {"artistsFollowing": userToFollow}}, function(err, result){
            if(err){
                res.status(500).send("Error reading database.");
                return;
            }
            else{
                res.status(200).send("Following User Now!");
            }
        });
    }
    // cant follow themself
    else{
        res.status(200).send("You can not follow yourself!");
    }
}
    

//function to add the workshop into the signed in users workshop list
function addWorkshopDatabase(req, res, next){
    workshop = req.body;
    // adding to the workshop list
    db.collection("users").updateOne({"username": req.session.username}, {$push: {"workshops":workshop.name}}, function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        else{
            res.status(200).send("Workshop added");
        }
    });
}
// function to add art
function addArtDatabase(req, res, next){
    artwork = req.body;
    artwork["artist"] = req.session.username;
    // adding the art to the gallery collection
    db.collection("gallery").insertOne(artwork, function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
    });
    
    let userArtwork = {};
    userArtwork["name"] = artwork.name;
    userArtwork["image"] = artwork.image;
    let message = `${req.session.username} has published a new piece of art!`;
    // adding the art to the users collection because the users have a list of artworks they have created
    db.collection("users").updateOne({"username": req.session.username}, {$push: {"artworks": userArtwork}}, function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        // else{
        //     res.status(200).send("Fully Updated both collections");
        // }
    });

    db.collection("users").updateMany({"artistsFollowing": req.session.username}, {$push: {"notifications": message}}, function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        else{
            res.status(200).send("Fully Updated both collections");
        }
    })
}
// function to render the page that allows the user to add art to the databases
function renderAddArt(req, res, next){
    res.status(200).render("addartwork");
}
// function to logout the user that is currently logged in
function logoutUser(req, res, next){
    if(req.session.loggedin){
        // setting logged in to false and the username to undefined
        req.session.loggedin = false;
        req.session.username = undefined;
        res.status(200).send("Logged out");
    }
    else{
        res.status(200).send("You were not logged in!");
    }
}
// function to find all the artworks that match the name, artist, or category
function findMatchingArtworks(req, res, next){
    let name = req.params.name;
    let artistName = req.params.artistName;
    let category = req.params.category;
    // finding using the $or 
    db.collection("gallery").find({$or: [{"name": name}, {"artist":artistName}, {"category": category}]}).toArray(function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        if(!result){
            res.status(404).send("No Artworks Found!");
            return;
        }
        if(result.length != 0){
            // rendering that partial page
            res.status(200).render("searchedartworks", {artworks: result});
            return;
        }
    });
}
//function to unfollow an artist
function unfollowUser(req, res, next){
    let currUser = req.body;
    // updating the artistsFollowing to the updated one which does not contain the artist we want to unfollow
    db.collection("users").updateOne({"username": currUser.username},{$set: {"artistsFollowing": currUser.artistsFollowing}}, function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        if(!result){
            res.status(404).send("User Not Found!");
            return;
        }
        else{
            res.status(200).send("Unfollowing Complete!");
        }
    });
}
// function to render the artist page
function renderArtist(req, res, next){
    let artistName = req.params.artistName;
    // finding the artist whose name matches
    db.collection("users").find({"username": artistName}).toArray(function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        if(!result){
            res.status(404).send("Artwork not found");
            return;
        }
        else{
            // because I used find I passed in the index 0 of the result
            res.status(200).render("artist", {artist: result[0]});
        }
    });
}
// function to find all artworks whose category or medium is the same
function findSimiliar(req, res, next){
    let category = req.params.category;
    let medium = req.params.medium;
    // finding all the results that match
    db.collection("gallery").find({$or: [{"category": category}, {"medium": medium}]}).toArray(function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        if(!result){
            res.status(404).send("Category or Medium not found!");
            return;
        }
        // sending the results to the client side
        res.status(200).send(result);
    });
}
// function to increase the likes of a artwork
function increaseLike(req, res, next){
    let artwork = req.body;
    let container = {};
    container["name"] = artwork.name;
    container["image"] = artwork.image;
    // updating the likes of the artwork
    if(req.session.loggedin){
        db.collection("gallery").updateOne({"name": artwork.name},{$set: {"likes": artwork.likes}}, function(err, result){
            if(err){
                res.status(500).send("Error reading database.");
                return;
            }
            if(!result){
                res.status(404).send("Artwork not found");
                return;
            }
        });
        db.collection("users").updateOne({"username": req.session.username}, {$push:{"liked": container}}, function(err, result){
            if(err){
                res.status(500).send("Error reading database.");
                return;
            }
            if(!result){
                res.status(404).send("Artwork not found");
                return;
            }
            else{
                res.status(200).send("Succesfully added likes!");
            }
        });
    }
    
}
// function to add a review to the artwork
function addReview(req, res, next){
    let artwork = req.body;
    // updating the reviews
    if(req.session.loggedin){
        db.collection("gallery").updateOne({"name": artwork.name},{$set: {"ratings": artwork.ratings}}, function(err, result){
            if(err){
                res.status(500).send("Error reading database.");
                return;
            }
            if(!result){
                res.status(404).send("Artwork not found");
                return;
            }
            else{
                res.status(200).send("Added Review!");
            }
        });
    }
}
// function to render an artwork
function loadArtwork(req, res, next){
    let artworkName = req.params.artworkName;
    // finding the artwork whose name matches
    db.collection("gallery").findOne({"name":artworkName}, function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        if(!result){
            res.status(404).send("Artwork not found");
            return;
        }
        else{
            // rendering the artwork page
            res.status(200).render("artwork", {artwork: result});
        }
    });
}
// function to upgrade the user to an artist
function upgradeArtist(req, res, next){
    let username = req.params.username;
    let user = req.body;
    // updating the usertype of the user
    db.collection("users").updateOne({"username":username}, {$set: {"userType": user.userType}}, function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        res.status(200).send("Upgrade to Artist ... Complete!");
    });
}
// function to login a user
function login(req, res, next){
    if(req.session.loggedin){
        res.status(200).send("Already logged in.");
        return;
    }
    let username = req.body.username;
    serverUsername = username;
    let password = req.body.password;

    console.log("Logging in with credentials:");
	console.log("Username: " + username);
	console.log("Password: " + password);
    // finding our if the username exists
    db.collection("users").findOne({"username": username}, function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        if(!result){
            res.status(404).send("Username not found.");
            return;
        }
        // if the username exists we check if the password matches
        else{
            if(result.password === password){
                req.session.loggedin = true;
                req.session.username = username;
                res.status(200).send("Logged in");
            }
            // otherwise wrong password
            else{
                res.status(401).send("Invalid password");
            }
        }
    });
}
// function to render the user page
function renderUser(req, res, next){
    if(req.session.loggedin == true){
        // let username = req.params.username;
        // finding if a user with the matching name exists
        db.collection("users").findOne({"username": req.session.username}, function(err, result){
            if(err){
                res.status(500).send("Error reading database.");
                return;
            }
            // if the user exists then render the user page to show all the user information
            res.render("user", {user: result});
        });
    } 
}
// function to render the homepage (Gallery)
function renderHome(req, res, next){
    // finding all the artworks in the database
    db.collection("gallery").find({}).toArray(function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        // if there are more than one artworks then render the gallery page
        if(result.length > 0){
            res.render("home", {artworks: result});
        }
    });
}
// function to render the login page
function renderLogin(req, res, next){
    res.render("login");
}
// function to render the registraction page
function renderRegistration(req, res, next){
    res.render("registration");
}
// function to register the user and add it into the database
function addUser(req, res, next){
    let user = req.body;
    // inserting into the database
    db.collection("users").insertOne(user, function(err, result){
        if(err){
            res.status(500).send("Error reading database");
            return;
        }
        res.status(200).send("Account Created!");
    });
}

MongoClient.connect("mongodb://127.0.0.1:27017/", { useNewUrlParser: true }, function(err, client) {
    if(err){
        throw err;
    }
    db = client.db("database");
    app.listen(3000);
    console.log("http://localhost:3000");
});

