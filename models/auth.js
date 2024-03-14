const mongoose = require('mongoose')
const authSchema = mongoose.Schema({
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String,
    }
})

module.exports = mongoose.model("auth", authSchema)