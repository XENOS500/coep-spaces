	 export const authorize = (...allowedRoles)=>{
    return (req,res,next)=>{
        //check if authenticated
        if(!req.user){
            return res.status(401).json({
                success:false,
                message:"Authentication required"
            })
        }
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                success:false,
                message:"Access denied insufficient permissisons",
            })
        }
        next()
    }
}