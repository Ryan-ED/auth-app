var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    fName: String,
    lName: String,
    email: {type: String, unique: true},
    password: String
});

module.exports = mongoose.model("User", userSchema);