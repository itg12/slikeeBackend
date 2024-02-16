const jwt = require("jsonwebtoken")
const SECRET_KEY = "IAMRISHABHGUPTASOFTWAREENGINEERATMICROSOFT"
const User = require('../Models/UserSchema')

const AuthenticateUser = async(req,res,next)=>{
    try {
        const token = req.cookies?.Token
        if(!token){
            return res.send("Unautherized request")
        }

        // Verifying the JWT Token
        const decode = jwt.verify(token,SECRET_KEY)
        const user = await User.findOne({_id:decode.id})
        
        if(!user){
            return res.send("No UserId Found")
        }

        req.user = user
        next()
    } catch (error) {
        return res.send("some error", error)
    }
}

module.exports=AuthenticateUser
