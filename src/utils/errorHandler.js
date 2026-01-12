export class AppError extends Error {
    constructor(message,statusCode=500,type="ERROR"){
        super(message);
        this.statusCode = statusCode;
        this.type = type;
        this.isOperational = true;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this,this.constructor);
    }
}

export const errorHandler = (error,toast) => {
    //log error
    console.error("Error occurred:",{
        message: error.message,
        stack:error.stack,
        timestamp:new Date().toISOString()
    });

    //check network connectivity
    if(!navigator.onLine){
        toast.error("No internet connection. Please check your network.");
        return;
    }

    //handle axios/api errors
    if(error.response){
        const status = error.response.status;
        const errorMessages = {
            400: "Bad Request. Please check your input.",
            401: "Authentication failed.Please check your API key.",
            403: "Access denied. You don't have permission to access this resource.",
            404: "Resource not found.",
            500: "Internal Server Error. Please try again later.",
            502: "Bad Gateway. Server is temporarily unavailable.",
            503: "Service Unavailable. Please try again later."
        };

        const message = errorMessages[status] || `Error ${status}: ${error.message}.`;
        toast.error(message);
        return;
    }

    //handle network errors
    if(error.request){
        toast.error("Network error,Please check your connection.");
        return;
    }

    //handle parsing errors
    if(error.name === "SyntaxError"){
        toast.error("Invalid data format. Please check the input data.");
        return;
    }

    //handle file reading errors
    if(error.name === "NotReadableError"){
        toast.error("Unable to read your file.Please try again later");
        return;
    }

    //handle abort errors
    if(error.name === "AbortError"){
        toast.info("Operation cancelled.");
        return;
    }

    //handle custom app errors
    if(error instanceof AppError){
        toast.error(error.message);
        return;
    }


    //default error message
    toast.error(error.message || "An unexpected error occurred.Please try again.");
};

//Async error wrapper,wraps aysnc functions to catch errors automatically
export const asyncErrorHandler = (fn) => {
    return async (...args) => {
        try{
            return await fn(...args);
        }catch(error){
            errorHandler(error,toast);
            throw error;
        }
    };
};