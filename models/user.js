var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    fName: String,
    lName: String,
    //MAKE EMAIL A UNIQUE ATTRIBUTE
    email: {type: String, unique: true},
    password: String
});

module.exports = mongoose.model("User", userSchema);