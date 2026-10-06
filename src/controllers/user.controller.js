import {asyncHandler} from "../utils/asyncHandler.js" // we can use asyncHandler to wrap our controller functions to handle errors and avoid try-catch blocks in each controller function, it will catch any error thrown in the controller function and pass it to the next middleware which is the error handling middleware in our app.js file, so we don't have to write try-catch block in each controller function and we can just throw an error and it will be handled by the error handling middleware in our app.js file, this will make our code cleaner and more readable
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary} from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async function (userId) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new apiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // we are not validating the user schema before saving because we are only updating the refreshToken field and we don't want to validate the other fields like password, email, etc. because they are required fields and we don't want to throw validation errors for those fields when we are only updating the refreshToken field

        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(500, "Token generation failed");
    }
};


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
    console.log("User details received in the controller:", { email, username });

    if ([fullName, email, username, password].some((field) => !field || String(field).trim() === "")) {
        throw new apiError(400, "All fields are required");
    }

    // Check if user already exists in the database
    const existingUser = await User.findOne({ $or: [{ email }, { username }] }); //await is required here because we are querying the database and it returns a promise, so we need to wait for the promise to resolve before we can check if the user exists or not

    if (existingUser) {
        throw new apiError(409, "User already exists");
    }
    //req.body is given by express.json() middleware and it will parse the incoming request body and make it available in req.body, so we can access the user details from req.body
    //req.fields is given by multer middleware and it will parse the incoming request body and make it available in req.fields, so we can access the user details from req.fields
    //req.files is given by multer middleware and it will parse the incoming request body and make it available in req.files, so we can access the user details from req.files
    
    //console.log(req.files); // Check the structure of req.files to see how the files are being sent
    // avatar and coverImage are the names of the fields in the form-data that we are sending from the frontend, so we can access them using req.files.avatar and req.files.coverImage, but since we are using multer middleware, it will parse the incoming request body and make it available in req.files, so we can access the files using req.files.avatar[0] and req.files.coverImage[0], because multer will store the files in an array, so we need to access the first element of the array to get the file object, and then we can access the path of the file using req.files.avatar[0].path and req.files.coverImage[0].path
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage?.[0]?.path; //Using this optional chaining operator to avoid errors if req.files or req.files.coverImage is undefined or null, and also using array destructuring to get the first element of the array, which is the file object, and then we can access the path of the file using req.files.coverImage[0].path

    let coverImageLocalPath;
    if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) {
        throw new apiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(500, "Avatar upload failed");
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

const loginUser = asyncHandler(async (req, res) => {
    // TODO: Implement login logic
    // 1. Get the email and password from req.body
    // 2. Find the user by email or username in the database
    // 3. If user exists, check the password
    // 4. If password is correct, generate access and refresh tokens
    // 5. Send the tokens in a secure way (e.g., cookies)

    const { email, username, password } = req.body ?? {};

    if (!(email || username) || !password) {
        throw new apiError(400, "Email or username and password are required");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (!user) {
        throw new apiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    //Now here we will make a tradeoff between changing the user object and by querying the user again from the database to get the updated user object without password and refreshToken fields, we will go with the second approach because it is more secure and we don't want to expose the password and refreshToken fields in the response, so we will query the user again from the database to get the updated user object without password and refreshToken fields, and then we will send that user object in the response along with accessToken and refreshToken, so that we can keep the user object in sync with the database and also keep the sensitive information like password and refreshToken secure.
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    // Now we will send the accessToken and refreshToken in the response along with the loggedInUser object, and we will also set the accessToken and refreshToken in the cookies with httpOnly and secure flags to prevent XSS attacks and CSRF attacks, so that the tokens are not accessible from the client-side JavaScript and can only be sent in the request headers, and also we will set the secure flag to true to ensure that the cookies are only sent over HTTPS connections, so that the tokens are not exposed in plain text over insecure connections.
    //It means that it cannot be modified from frontend js code and can only be modified from the server side, so it is more secure and prevents XSS attacks, and also it will be sent in the request headers automatically with every request to the server, so we don't have to manually add it to the request headers in the frontend code, and also it will be sent only over HTTPS connections, so it is more secure and prevents CSRF attacks.
    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new apiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );

})

const refreshAcessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.BODY.refreshToken;
    if(!incomingRefreshToken) {
        throw new apiError(401, "unauthorized request, refresh token is required");
    }
    try{
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await user.findById(decodedToken?._id)
    if(!user) {
        throw new apiError(401, "unauthorized request, user not found");

    }

    if(incomingRefreshToken !== user?.refreshToken) {
        throw new apiError(401, "unauthorized request, invalid refresh token");
    }

    const options = {
        httpOnly: true,
        secure: true
    };

    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                accessToken,
                refreshToken: newRefreshToken
            },
            "Access token refreshed successfully"
        )
    )
}catch (error) {
    throw new apiError(401, error?.message || "Invalid refresh token");
}
})

export {registerUser, loginUser, logoutUser, refreshAcessToken}