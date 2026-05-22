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

export { app };