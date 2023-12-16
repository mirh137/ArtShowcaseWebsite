// function that makes a get request to the login page so the server can render and respond
function loginPage(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            // redirecting the user to the login page
            location.href = "http://localhost:3000/login";
        }
    }
    xhttp.open("GET", "http://localhost:3000/login", true);
    //we will be getting a text/html response since we are looking to move to the login page
    xhttp.setRequestHeader("Content-Type", "text/html");
    xhttp.send();
}
// function that makes a get request to the registration page
function registerPage(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            // redirecting to the registration page
            location.href = "http://localhost:3000/register";
        }
    }
    xhttp.open("GET", "http://localhost:3000/register", true);
    xhttp.setRequestHeader("Content-Type", "text/html");
    xhttp.send();
}
// function that makes a get request to the gallery page
function galleryPage(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            // redirecting to the gallery page
            location.href = "http://localhost:3000/";
        }
    }
    xhttp.open("GET", "http://localhost:3000/", true);
    xhttp.setRequestHeader("Content-Type", "text/html");
    xhttp.send();

}
// function to make a post request to the server so a new user can be added to the database
function registerUser(){
    let xhttp = new XMLHttpRequest();
    // creating the new user object
    let user = {};
    user["username"] = document.getElementById("registerUsername").value;
    user["password"] = document.getElementById("registerPassword").value;
    user["userType"] = "Patron";
    user["artistsFollowing"] = [];
    user["liked"] = [];
    user["artworks"] = [];
    user["workshops"] = []
    user["notifications"] = [];
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            // alerting that a user has been created and then redirecting to the login
            alert("New account has been created! Login!")
            location.href = "http://localhost:3000/login"
        }
    }
    // sending the new user object to the server 
    xhttp.open("POST", "http://localhost:3000/register", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(user));
}
// function to post the login information to the server so it can authenticate the user
function sendLoginInfo(){
    let xhttp = new XMLHttpRequest();
    // creating an object that holds the username and password of the user trying to log in
    let info = {};
    info["username"] = document.getElementById("username").value;
    info["password"] = document.getElementById("password").value;

    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            // if the login is successfull then redirect the user to their page
            location.href = `http://localhost:3000/login/${info["username"]}`;
        }
    }
    // sending the login information to the server
    xhttp.open("POST", "http://localhost:3000/login", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(info));
}
// function to logout the currently logged in user
function logout(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            // if the logout was successfull, then redirect to the gallery and alert them that they have been logged out
            location.href = "http://localhost:3000/"
            alert("You have been logged out! or You were never logged in!")
        }
    }
    xhttp.open("GET", "http://localhost:3000/logout", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send();
}
// function to update the usertype to artist in the database
function upgradeToArtist(user){
    let xhttp = new XMLHttpRequest();
    // setting the usertyp to Artist
    user.userType = "Artist";
    // sending the updated information to the server so the information in the database also changes
    xhttp.open("PUT", `http://localhost:3000/login/${user.username}`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(user));
}
// function to update the userType to patron in the database
function changeToPatron(user){
    let xhttp = new XMLHttpRequest();
    // setting the usertype to Patron
    user.userType = "Patron";
    // sending the updated information to the server
    xhttp.open("PUT", `http://localhost:3000/login/${user.username}`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(user));
}
// function to display the reviews of the artwork on its page
function updateReviews(artwork){
    let result = ``;
    // adding the html into the result
    console.log(artwork.ratings.length);
    for(let i = 0; i < artwork.ratings.length; i++){
        result += `<p>${artwork.ratings[i]}</p>`;
    }
    // setting the innerHtml to the result that holds all the html code
    document.getElementById("reviews").innerHTML = result;
}
// function to update the likes displayed on the artwork page
function updateLikes(artwork){
    document.getElementById("likes").innerHTML = `<p> Likes: ${artwork.likes}`;
}
// function to post the new reviews to the server to add it into the database
function sendReview(artwork){
    let xhttp = new XMLHttpRequest();
    let review = document.getElementById("artworkReview").value;
    // adding the review to the local artwork object
    artwork.ratings.push(review);
    
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            // once the review has been added to the database update the display of reviews on the artwork page and alert the user their review has been added
            updateReviews(artwork);
            alert("Your review has been added!");
        }
    }
    // sending the local updated artwork object to server
    xhttp.open("POST", `http://localhost:3000/artworks/${artwork.name}`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(artwork));
}
// function to increase the likes of an artwork
function likeArtwork(artwork){
    // increasing the likes of the artwork
    artwork.likes++;
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            // if successfull then update the display of likes on the artwork page
            updateLikes(artwork);
        }
    }
    // sending the updated object to the server
    xhttp.open("PUT", `http://localhost:3000/artworks/${artwork.name}`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(artwork));
}
// function to update the display of similiar artworks on the current artwork page
function updateSimiliar(results){
    // creating the html code
    let result = `<h3> Similiar Results</h3>`;
    for(let i = 0; i < results.length; i++){
        result += `<a href="/artworks/${results[i].name}">${results[i].name}</a></br>`;
    }
    // setting the innerhtml of the div to the result
    document.getElementById("similiarResults").innerHTML =  result;
}
// function to get the all the similiar artworks from the database
function getSimiliarResults(artwork){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            let results = JSON.parse(this.responseText);
            // once the server responds with the information, update the display to show the similiar artworks
            updateSimiliar(results);
        }
    }
    // making a get request to obtain similiar artworks
    xhttp.open("GET", `http://localhost:3000/similiarworks/${artwork.category}/${artwork.medium}`, true);
    xhttp.setRequestHeader("Content-Type", "text/html");
    xhttp.send();
}
// function to enroll the user into a workshop
function enroll(){
    alert("You have been enrolled in the workshop!");
}
//function to send a put request to unfollow a user
function unfollow(user, name){
    let xhttp = new XMLHttpRequest();
    // finding the user in the artistsfollowing
    let index = user.artistsFollowing.indexOf(name);
    // if found then remove it 
    if(index > -1){
        user.artistsFollowing.splice(index, 1);
    }
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            // reload the page to update the followed artists list
            location.reload();
        }
    }
    // send the updated user object to the server so it can update the database
    xhttp.open("PUT", `http://localhost:3000/unfollow/${name}`);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(user));
}
// function to send a get request to the server so it can respond with all the artworks that match the query
function searchArtworks(){
    let xhttp = new XMLHttpRequest();
    // getting the values from the input boxes
    let name = document.getElementById("searchName").value;
    let artistName = document.getElementById("searchArtist").value;
    let category = document.getElementById("searchCategory").value;
    // if any of them are empty then set them to empty
    if(name === ""){
        name = "empty"
    }
    if(artistName === ""){
        artistName = "empty"
    }
    if(category === ""){
        category = "empty";
    }

    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            //updating the results display on the user page
            document.getElementById("searchResults").innerHTML = this.responseText;
        }
    }
    // make a get request to artworks with the name, artist, and category as the params
    xhttp.open("GET", `http://localhost:3000/artworks/${name}/${artistName}/${category}`);
    xhttp.setRequestHeader("Content-Type", "text/html");
    xhttp.send();
}
//function that makes a get request so the server can respond with the addArtwork page
function addArtworkPage(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            // if successfull then redirecting to the addart page
            location.href = "http://localhost:3000/addart"
        }
    }
    // sending the get request
    xhttp.open("GET", `http://localhost:3000/addart`, true);
    xhttp.setRequestHeader("Content-Type", "text/html");
    xhttp.send();
}
// function to make a post request to the server to add the artwork object into the database
function addArtwork(){
    // creating the new artwork object
    let artwork = {}
    artwork["name"] = document.getElementById("newName").value;
    artwork["year"]= document.getElementById("newYear").value;
    artwork["category"] = document.getElementById("newCategory").value;
    artwork["medium"] = document.getElementById("newMedium").value;
    artwork["description"] = document.getElementById("newDescription").value;
    artwork["image"]  = document.getElementById("newImage").value;
    artwork["likes"] = 0;
    artwork["ratings"] = [];

    let xhttp = new XMLHttpRequest();
    // sending the new artwork to the server
    xhttp.open("POST", "http://localhost:3000/addart", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(artwork));
}
// function that makes a post request to the server so a new workshop can be added to the currently logged in user
function addWorkshop(){
    let xhttp = new XMLHttpRequest()
    // creating a container object that will hold the name of workshop
    let container = {};
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            // if the workshop was successfully added to the database, then alert the user
            alert("Workshop has been added!");
        }
    }
    container["name"] = document.getElementById("workshopName").value;
    // sending the container object to the server
    xhttp.open("POST", "http://localhost:3000/addworkshop", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(container));
}

function userHome(){
    let name = "any"
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            // redirecting the user to their user page
            location.href = `http://localhost:3000/login/${name}`;
        }
    }
    // sending the get request to the user page
    xhttp.open("GET", `http://localhost:3000/login/${name}`, true);
    xhttp.setRequestHeader("Content-Type", "text/html");
    xhttp.send();
}

function followArtist(artist){
    let xhttp = new XMLHttpRequest();
    xhttp.open("PUT",`http://localhost:3000/follow/${artist.username}`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(artist));
}

function removeLike(artwork){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            location.reload();
        }
    }
    xhttp.open("PUT",`http://localhost:3000/unlike/${artwork}`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(artwork));
}