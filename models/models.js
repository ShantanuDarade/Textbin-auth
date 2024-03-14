const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "auth"
    },
    value: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("User", userSchema)