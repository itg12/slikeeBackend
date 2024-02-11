const mongoose = require('mongoose')

const ContactSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        required: true
       
    },
    message:{
        type: String,
        required: true
    }

})

const Contact = mongoose.model("contacts", ContactSchema)

module.exports = Contact