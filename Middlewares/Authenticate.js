const jwt = require("jsonwebtoken");
const User = require("../Models/UserSchema");


const Authenticate = async (req,res,next)=>{
    try{
        // Finding the JWT Token
        const Token = req.headers.token

        // Verifying the User
        const decode = jwt.verify(Token, process.env.SECRET_KEY)
        const userID = decode.user.id

        // Finding the particular user by email
        const findUser = await User.findById({_id:userID})

        if(!findUser){
            throw new Error("User not Found");
        }

        res.status(200).send("Authentication Successfull")

        next();
      
    }
    catch(err){
        return res.status(401).send('Unauthorised Person: No Token Provided')
    }

}

module.exports = Authenticate;

