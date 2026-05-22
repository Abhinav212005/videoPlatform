import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname: {
       type: String,
       required: true,
       trim: true,
       index: true
    },
    avatar: {
        type: String, // cloudiniary url
        required: true,

    },
    coverImage: {
        type: String, // cloudiniary url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "password is required"]
    },
    refreshToken: {
        type: String
    }
},{
    timestamps: true
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // If password is not modified, skip hashing
    this.password = bcrypt.hashSync(this.password, 10); // here 10 is the salt rounds, you can adjust it as needed and it will take more time to hash the password with higher salt rounds but it will be more secure
    next(); // Call next to proceed with saving the user
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
} // it will compare the plain text password with the hashed password and return true if they match and false if they don't

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRATION
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
     return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRATION
        }
    )
}
export const User = mongoose.model("User", userSchema);