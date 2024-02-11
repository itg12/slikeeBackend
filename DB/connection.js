const mongoose = require('mongoose')
const DB = process.env.DATABASE;

mongoose.connect(DB).then(()=>{
    console.log("Connected to the Database")
}).catch((err)=>console.log("No connection found"))



