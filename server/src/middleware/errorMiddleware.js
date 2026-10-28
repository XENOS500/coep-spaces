export const notFound =(req,res,next)=>{
    const error = new Error(
        `Route not found : ${req.originalUrl}`
    )

    error.statusCode =404

    next(error)
}

export const errorHandler = (err,req,res,next)=>{
    let statusCode =err.statusCode||err.status||500
    let message = err.message ||"Internal Server Error"

    if(err.name ==="CastError"){
        statusCode=400
        message ="Invalid resource Id"
    }

    if(err.name === "ValidationError"){
        statusCode= 400
        message =Object.values(err.errors)
        .map((error)=>error.message)
        .join(",")
    }

    if(err.code == 11000){
        statusCode=409
        message ="A record with this value already exits"
    }

    if(
        statusCode>=500 && process.env.NODE_ENV ==="production"
    ){
        message = "Internal Server Error"
    }
    res.status(statusCode).json({
        success:false,
        message,

        ...(process.env.NODE_ENV !== "production"&&{
            stack:err.stack,
        })
    })
}