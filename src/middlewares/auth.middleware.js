import { apiError } from '../utils/apiError.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

//WE ARE USING THIS MIDDLEWARE TO VERIFY THE JWT TOKEN SENT BY THE CLIENT IN THE REQUEST HEADER OR IN THE COOKIES, AND IF THE TOKEN IS VALID THEN WE ARE ATTACHING THE USER OBJECT TO THE REQUEST OBJECT SO THAT WE CAN ACCESS IT IN THE CONTROLLER FUNCTION, OTHERWISE WE ARE THROWING AN ERROR WITH STATUS CODE 401 (UNAUTHORIZED) AND MESSAGE "Unauthorized request" OR "Invalid access token" IF THE TOKEN IS INVALID OR EXPIRED.
//OUR MAIN OBJECTIVE  WAS TO CREATE A MIDDLEWARE FUNCTION WHICH WILL GIVE THE USER OBJECT THAT CONTAINS THE USER ID SO THAT WE CAN USE IT IN THE CONTROLLER FUNCTION TO GET THE USER DETAILS FROM THE DATABASE AND RETURN IT TO THE CLIENT, AND ALSO TO CHECK IF THE USER IS AUTHENTICATED OR NOT, AND IF NOT THEN WE WILL THROW AN ERROR WITH STATUS CODE 401 (UNAUTHORIZED) AND MESSAGE "Unauthorized request" OR "Invalid access token" IF THE TOKEN IS INVALID OR EXPIRED.
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try{const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', ''); // Get the token from the cookies
    if (!token) {
        throw new apiError(401, 'Unauthorized request');
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select('-password -refreshToken'); // Find the user by ID and exclude the password field
    if (!user) {
        //Next_video: discuss about frontend
        throw new apiError(401, 'Unauthorized request');
    }

    req.user = user; // Attach the user object to the request object
    next(); // Call the next middleware function
    }catch (error) {
        throw new apiError(401, error?.message || "Invalid access token");
    }

})