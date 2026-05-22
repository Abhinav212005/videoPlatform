//require('dotenv').config({path: "./.env"})
import dotenv from "dotenv";
import connectDB from "./db/index.js";

import {app} from './app.js'
dotenv.config({
    path: './.env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed", err);
})


/*
import mongoose from "mongoose";
import { DB_name } from "./constants";

import express from "express";
const app = express();

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
        app.on("error", (err) => {
            console.log("Error in connecting to the database", err);
            throw err
        })
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    } catch (err) {
        console.log("Error in connecting to the database", err);
        throw err;
    }
    })()
*/
