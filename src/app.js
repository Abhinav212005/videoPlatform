import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
// we use app.use () to use the middleware in our application or to do some configuration in our application
// we can use multiple middlewares in our application
// we can also use third party middlewares in our application

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, // Allow cookies to be sent in cross-origin requests
}));

app.use(express.json({limit: "16kb"})); // Middleware to parse JSON bodies
app.use(express.urlencoded({extended: true, limit:"16kb"})); // Middleware to parse URL-encoded bodies
app.use(express.static("public")); // Middleware to serve static files from the "public" directory
app.use(cookieParser()); // Middleware to parse cookies

//routes import
import userRouter from "./routes/user.routes.js" // we can give own name to the imported router, it doesn't have to be the same as the file name, but only if the file is exporting a single router, otherwise we have to use the same name as the exported router in the file, e.g., if we have multiple routers in the file, we have to use the same name as the exported router in the file, e.g., if we have userRouter and authRouter in the file, we have to use userRouter and authRouter in the import statement, otherwise we will get an error that the router is not defined
// when we import a file we can keep any name but if it is not export default then we have to use the same name as the exported variable in the file, e.g., if we have export const userRouter = Router() in the file, then we have to use import {userRouter} from "./routes/user.routes.js" in the import statement, otherwise we will get an error that userRouter is not defined, but if we have export default userRouter = Router() in the file, then we can use any name in the import statement, e.g., import myUserRouter from "./routes/user.routes.js" and it will work fine because it is a default export, but if it is not a default export then we have to use the same name as the exported variable in the file, otherwise we will get an error that the variable is not defined

//routes declaration
/* app.get("/", (req, res) => { // we can use app.get() to define a route for the GET method, it takes two arguments, the first argument is the path of the route and the second argument is a callback function that will be called when the route is matched, the callback function takes two arguments, the first argument is the request object and the second argument is the response object, we can use res.send() to send a response to the client, we can also use res.json() to send a JSON response to the client, we can also use res.status() to set the status code of the response, we can also use res.redirect() to redirect the client to another route, we can also use res.render() to render a view template and send it as a response to the client. But we are not using get method because we have defined a route for the GET method in the userRouter and it will be prefixed with /user, e.g., /user/register for the register route, so we don't need to define a route for the GET method here in the app.js file, we can just use the userRouter to handle all the routes related to users. But if we want to define a route for the GET method here in the app.js file, we can do that too, but it is not recommended because it will make our code messy and hard to maintain. So we are not defining a route for the GET method here in the app.js file. */
   // res.status(200).json({
    //    success: true,
  //      message: "Welcome to the API",
//    })} 
app.use("/api/v1/users", userRouter) // user related routes will be handled by userRouter and it will be prefixed with /user, e.g., /user/register for the register route
// http://localhost:5000/api/v1/users/register

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

export { app };

