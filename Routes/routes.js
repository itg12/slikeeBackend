const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const User = require('../Models/UserSchema')
const Rooms = require('../Models/RoomSchema')
const Contact = require('../Models/ContactSchema')
const Bookings = require('../Models/Bookings')
const jwt = require('jsonwebtoken')


// Signup Route

router.post("/signup", async (req,res)=>{
    
        const {name, email, phone, password} = req.body

        
        try{

            if(!name || !email || !phone ||  !password){
                return res.status(502).json({message:"Please fill the field properly"})
            }
    
            const userExist = await User.findOne({email: email})
        
            if(userExist){
                return res.status(422).json({error: "User already Registered."});
            }
    
            if(!req.body.email.includes('@gmail.com')){
                return res.status(430).json({error: 'Enter valid email'})
            }

            if(req.body.password.length<8){
                return res.status(500).json({error: "Password should be greater than 8 characters."})               
            }

        
            // Now on this step i will hash the user password and confirm password.

            const salt = await bcrypt.genSalt(12);
            const securePassword = await bcrypt.hash(req.body.password, salt); 

            // Save the data in particular schema

            const user = new User({name, email, phone, password:securePassword})  
            const userRegister = await user.save();

            if(userRegister){               
                res.status(200).json({message: "Signup Successfull", id:userRegister.id})              

                // Now we are sending the email for successfull signup to the user.

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'risansig.2019@gmail.com',
                        pass: 'ztnz okfg qrcp snqk'
                    }
                })
              
                
                async function main() {
                 // send mail with defined transport object
                 const info = await transporter.sendMail({
                   from: '"risansig.2019@gmail.com', // sender address
                   to: req.body.email, // list of receivers
                   subject: "SLIKEE Hotel", // Subject line
                   text:  `Thank you for signup with SLIKEE Hotel with id: ${userRegister.id}`, // plain text body
                 });
               
                 console.log("Message sent: %s", info.messageId);
                }
                main().catch(console.error)
            }
           
        }catch(err){
            res.status(404).json({error: "Some Error Occured"+err})
        }
         
})


// Login Route

router.post("/login", async (req,res)=>{

    try{

        const {email, password} = req.body

        if(!email || !password){
            return res.status(500).json({message:"Please fill the field properly"})
        }

        const userAuth  = await User.findOne({email: email})

        if(!userAuth){
            return res.status(422).json({message:"Invalid Details"})
        }

         // Match user password with hash password
        const isMatch = await bcrypt.compare(password, userAuth.password);

        if(!isMatch){
            return res.status(422).json({message: "Invalid Details"})
        }
        else{

            // Now i will store jwt token during login

            const data = {
                user:{
                    id:userAuth.id
                }
            }
            // Signing the JWT Token
            const Token = jwt.sign(data, process.env.SECRET_KEY);
           
        
            // Saving the JWT Token in the database in User collection.
            userAuth.token = Token;
            await userAuth.save()
            

             return res
            .status(200)  
            .json({Token:Token})
        }  
    }catch(err){
        return res.status(404).json({message: "Some Error Occured"} + err)
    }
})


// Contact (Message) Schema

router.post("/contact", async (req,res)=>{
    
    const {name, email, phone, message} = req.body

    
    try{

        if(!name || !email || !phone ||  !message){
            return res.status(502).json({message:"Please fill the field properly"})
        }
     

        if(!req.body.email.includes('@gmail.com')){
            return res.status(430).json({message: 'Enter valid email'})
        }


        // Save the data in particular schema

        const messages = new Contact({name, email, phone, message})  
        const saveMessage = await messages.save();

        if(saveMessage){               
            res.status(200).json({message: "Message Sent Successfully"})


            // Now we are sending the email for successfull signup to the user.

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'risansig.2019@gmail.com',
                    pass: 'ztnz okfg qrcp snqk'
                }
            })
          
            
            async function main() {
             // send mail with defined transport object
             const info = await transporter.sendMail({
               from: '"risansig.2019@gmail.com', // sender address
               to: req.body.email, // list of receivers
               subject: "SLIKEE HOTEL", // Subject line
               text:  `${req.body.name}, Thank you for Connecting with us. We will contact you soon.` // plain text body
             });
            }
            main().catch(console.error)
        }
       
    }catch(err){
        return res.status(404).json({error: "Some Error Occured"+err})
    }
     
})


// Fetch TopRooms from Database

router.get('/toprooms', async (req,res)=>{
    try{
     const data = await Rooms.find({category:"top"})
     return res.send(data)
    }
    catch(err){
     return res.status(404).json({message:"Some Error Occured"}+err)
    }   
 })

 
// Fetch All Rooms from Database

router.get('/rooms', async (req,res)=>{
   try{
    const data = await Rooms.find({})
    return res.send(data)
   }
   catch(err){
    return res.status(404).json({message:"Some Error Occured"}+err)
   }
   
})


// Fetch Particular Room Details from Database

router.get('/:id', async (req,res)=>{
    try{
     const data = await Rooms.findOne({"_id":req.params.id})
     return res.send(data)
    }
    catch(err){
     return res.status(404).json({message:"Some Error Occured"}+err)
    }    
 })


 // Bookable Room Details

 router.get('/BookRoom/:id', async (req,res)=>{
    try{
        // Finding the selected room Details.
        const data = await Rooms.findOne({"_id":req.params.id})

        return res.send(data)

        // Finding the User Details who is booking the room.
        
    }
    catch(err){
     return res.status(404).json({message:"Some Error Occured"}+err)
    }    
 })


//  Send the User BookingData into Database 

router.post("/BookingRoom", async (req,res)=>{
    const {roomID, name, phone, from, to} = req.body

    try{

        if(!req.headers.token){
            console.log("Kindly First Login your account")
            return res.status(401).json({message:"Kindly First Login your Account."})
        }

        // Verifying the JWT Token
        const decode = jwt.verify(req.headers.token, process.env.SECRET_KEY)
        const user = decode.user.id 

        // Finding the Particular user email who is booking the room 
        const findEmail = await User.findOne({"_id":user})
        const userEmail = findEmail.email

        if(!roomID || !name || !phone || !from || !to){
            return res.status(400).json({message:"Please fill the field properly"})
        }

        if(from>to){
            return res.status(402).json({message:"From should be less than To"})
        }

        // Save the data in particular schema

        const data = new Bookings({roomID, name, phone, email:userEmail, from, to})  
        const saveData = await data.save();
 
        //Save the Booked Room Id in particular user Bookings Field.
        findEmail.bookings.push(saveData.roomID) 
        await findEmail.save()


        if(saveData){             

            res.status(200).json({message: "Booking Successfull", BookingId:saveData.id, RoomId:saveData.roomID, bookingDate:saveData.bookingDate})  

            // Now we are sending the email for successfull signup to the user.

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'risansig.2019@gmail.com',
                    pass: 'ztnz okfg qrcp snqk'
                }
            })
          
            
            async function main() {
                // send mail with defined transport object
                const info = await transporter.sendMail({
                from: '"risansig.2019@gmail.com', // sender address
                to: userEmail, // list of receivers
                subject: "SLIKEE Hotel", // Subject line
                text:  `Your Booking has confirmed with Booking id: ${saveData.id}. Booking Date and Time is: ${saveData.bookingDate}. Your RoomId is:${saveData.roomID}. Kindly keep safe your BookingId and RoomId because it's also required (if you want to cancel your Booking)`, // plain text body
                });          
            }
            main().catch(console.error)
        }
       
    }catch(err){
        res.status(404).json({error: "Some Error Occured"+err})
    }
     
})
 

// Logout the User

router.post("/logout",async(req,res)=>{

    try {
        // Getting the Token
        const token = req.headers.token

        // Verifying the JWT Token

        const decode = await jwt.verify(token, process.env.SECRET_KEY)
        const user = decode.user.id 

        // Finding the user by JWT Token
        const findLoggedInUser = await User.findOne({_id:user})

        // Set user Token blank when user is Logout
        findLoggedInUser.token = ""
        await findLoggedInUser.save()

        res.send("Logout Successfully")

    } catch (error) {
        res.send("Some error Occured", error)
        console.log("Some Error occured", error)
    }
    
})


// All Bookings of a Particular User

router.get("/my_bookings/bookings", async (req,res)=>{
    try {
        // Finding the jwt auth token    
        const Token = req.headers.token
        
        if(!Token){
            return res.status(408).json({message:"Kindly Login your account"})
        }

        // Verifying the JWT Token.
        // Note- Here we are using try and catch block so that if the token is edited or the value of token is modified, no error will occured. 
        try {           
            const decode = jwt.verify(Token, process.env.SECRET_KEY)
            const userID = decode.user.id

            // Finding the particular user by email
            const findUser = await User.findById({_id:userID})
                 
            // Retrive the Room Id's from User Bookings field.
            const roomIds = findUser.bookings

            // Retrive the full Rooms with Details by BookedRooms id's
            try {
                let roomData=[]
                for(let i=0; i<roomIds.length; i++){
                    const rooms = await Rooms.findOne({'_id':roomIds[i]})
                    roomData.push(rooms)
                }          

                return res
                .status(200)
                .json({message:"Room Fetched", roomData})

            } catch(error){
                return res.json({message:"Some Error Occured"})
            }
            
        }catch (error) {
            return res.status(400).json({message:"Invalid JWT token"})
        } 
  
    } catch (error) {
        return res.send("Some Error Occured", error)
    }
})


// Cancel A Particular Booked Room

router.post("/CancelBooking", async (req,res)=>{    
    const {RoomId, BookingId} =req.body    
    try {       
        // Getting the Token and RoomId sending by the headers
        const token = req.headers.token
        
        if(!RoomId || !BookingId){
            return res.status(502).json({message:"Please fill the field properly"})
        }
        
        // Verifying the JWT Token

        const decode = await jwt.verify(token, process.env.SECRET_KEY)
        const user = decode.user.id 

        // Finding the user by JWT Token
        const findLoggedInUser = await User.findOne({_id:user})



        //Remove the Booking from the User Bookings Section.
        const bookingIds = findLoggedInUser.bookings

        let saveUser=false

        for(let i=0;i<bookingIds.length; i++){
                if(bookingIds[i]===RoomId){
                      await findLoggedInUser.bookings.remove(RoomId)          
                      await findLoggedInUser.save()
                      saveUser=true
                }
        }

        // Remove the Bookings from the User Bookings Collection.
        const deleteBooking = await Bookings.findByIdAndDelete({_id:BookingId})


        // Finally Sending the Response
        if(saveUser===true && deleteBooking){
            return res.status(200).json({message:"Cancle Booking Successfully"})
        }
        
    } catch (error) {
        return res.send("Some Error Occured", error)
    }
})



module.exports = router