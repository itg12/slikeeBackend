const mongoose = require('mongoose')

const BookingSchema = mongoose.Schema({
    roomID:{
        type:String,
        required:true
    },
    name:{
        type: String,
        requied:true
    },
    phone:{
        type: Number,
        requied:true
    },
    email:{
        type: String,
    },
    bookingDate:{
        type: Date,
        default: Date
    },
    from:{
        type: Date,
        requied:true
    },
    to:{
        type: Date,
        requied:true
    },
})

const Bookings = mongoose.model('bookings',BookingSchema);
module.exports=Bookings