const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
    }
}

export {asyncHandler}

// const asyncHandler =() => {}
// const asyncHandler = (fn) => () => {}
// const asyncHandler = (func) => async () => {}
//
// basically it is a higher order function that takes a function as an argument and returns a new function that wraps the original function in a try-catch block.
//  The returned function is an async function that takes the same arguments as the original function (req, res, next) and calls the original function with those arguments.
//  If the original function throws an error, the error is caught and passed to the next middleware in the chain using next(error). 
// This allows for centralized error handling in Express applications.

//const asyncHandler = (func) => async (req, res, next) => {
//    try {
//        await func(req, res, next);
//
//    } catch (error) {
//        res.status(error.code || 500).json({
//            success: false,
//            message: error.message || "Internal Server Error",
//        })
//    }
//}