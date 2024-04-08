import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation -- not empty
    // check if user already exits: ( username , email )
    // check for image, check for avtar
    // upload to them to cloudinary, avatar
    // create user object - create enter in db
    // remove password and refresh token field from response
    // check for user creation
    // return response



    //1. get user details from frontend
    const{ fullName, email,  username, password } = req.body
    console.log("email:", email);

    //2. validation -- not empty
    if( [fullName, email, username, password].some((field)=>
          field?.trim()=== "")
    ){
        throw new ApiError(400,"All field are required")
    }

    //3. check if user already exits: username , email
    const existedUser = await User.findOne({
        $or:[ { username }, { email } ]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    //4. check for image, check for avtar    
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    //5. upload to them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    //6. create user object - create enter in db
    const user =  await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //7. remove password and refresh token field from response    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //8. check for user creation
    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering thr user")
    }

    //9. return response
    return res.this.status(201).json(
        new ApiResponse(200, createdUser, "user registered sucessfully")
    )
});

export { registerUser }; 