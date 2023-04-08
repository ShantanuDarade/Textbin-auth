const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    value: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("User", userSchema)