const mongoose = require("mongoose")

const RoomSchema = mongoose.Schema({
    room_Number:{
        type:Number,
        required:true
    },
    image:{
        type: String, 
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    capacity:{
        type:Number,
        required: true
    },
    facilities:[

    ],
    rating:{
        type: Number,
        required: true
    },
    category:{
        type: String,
        required: true
    }
})

const Rooms  = mongoose.model('rooms', RoomSchema)

module.exports= Rooms