import {asyncHandler} from "../utils/asyncHandler.js" // we can use asyncHandler to wrap our controller functions to handle errors and avoid try-catch blocks in each controller function, it will catch any error thrown in the controller function and pass it to the next middleware which is the error handling middleware in our app.js file, so we don't have to write try-catch block in each controller function and we can just throw an error and it will be handled by the error handling middleware in our app.js file, this will make our code cleaner and more readable
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary} from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation of user details(not empty, email is correct, password is strong, etc.)
    // check if user already exists in the database: username, email
    // check for images, check for avatar 
    // upload images to cloudinary and get the urls
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName, email, username, password } = req.body ?? {};
    console.log("User details received in the controller:", { email, password });

    if ([fullName, email, username, password].some((field) => !field || String(field).trim() === "")) {
        throw new apiError(400, "All fields are required");
    }

    // Check if user already exists in the database
    const existingUser = await User.findOne({ $or: [{ email }, { username }] }); //await is required here because we are querying the database and it returns a promise, so we need to wait for the promise to resolve before we can check if the user exists or not

    if (existingUser) {
        throw new apiError(409, "User already exists");
    }
    //reqq.body is given by express.json() middleware and it will parse the incoming request body and make it available in req.body, so we can access the user details from req.body
    //req.fields is given by multer middleware and it will parse the incoming request body and make it available in req.fields, so we can access the user details from req.fields
    //re.files is given by multer middleware and it will parse the incoming request body and make it available in req.files, so we can access the user details from req.files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath) {
        throw new apiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError()
    }

    const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken ")

    if(!createdUser){
        throw new apiError(500, "User creation failed")
    }

    return res.status(201).json(
        new apiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );

})

export {registerUser}