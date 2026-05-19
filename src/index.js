//require('dotenv').config({path: "./.env"})
import dotenv from "dotenv/config";
import connectDB from "./db/index.js";



connectDB()


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
