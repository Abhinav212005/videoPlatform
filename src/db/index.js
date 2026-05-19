import mongoose from "mongoose";
import { DB_name } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`);
        console.log(`\n MongoDB connected: ${connectionInstance.connection.host} \n`);
    } catch (err) {
        console.log("Error in connecting to the database", err);
        process.exit(1); // Exit the process with a failure code
    }
}

export default connectDB;