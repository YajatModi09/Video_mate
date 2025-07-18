import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefreshTokens = async(userId)=>{
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})
    return {refreshToken, accessToken}
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access tokens");
  }
}


const registerUser = asyncHandler(async (req, res) => {
  const { fullName, userName, password, email } = req.body;

  if ([fullName, email, userName, password].some(field => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with name or email already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0) coverImageLocalPath = req.files.coverImage[0].path
  if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) throw new ApiError(400, "Avatar upload failed");

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase()
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) throw new ApiError(500, "Something went wrong while registering user");

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully")
  );
})


const loginUser = asyncHandler(async (req,res)=>{
  const {email, userName, password} = req.body;
  if(!userName && !email){
    throw new ApiError(400,"username or email is required");
  }
  const user = await User.findOne({
    $or: [{userName}, {email}]
  })
  if(!user) throw new ApiError(404,"user does not exist");
  const isPasswordValid = await user.isPasswordCorrect(password);
  if(!isPasswordValid) throw new ApiError(401,"password is invalid");
  const {refreshToken, accessToken} = await generateAccessAndRefreshTokens(user._id)
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  const options ={
    httpOnly: true,
    secure: true
  }
  return res.status(200)
  .cookie("accessToken",accessToken, options)
  .cookie("refreshToken",refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser , accessToken, refreshToken
      },
      "user logged im successfully"
    )
  )
})


const logOutUser = asyncHandler(async (req,res)=>{
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
  const options ={
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)
  .clearCookies("accessToken",options)
  .clearCookies("refreshToken",options)
  .json(new ApiResponse(200, {}, "User logged Out"))
})


const refreshAccessToken = asyncHandler(async (req, res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken) throw new ApiError(401,"Unautharized User");
  const decodedToken = jwt.verify(
    incomingRefreshToken, process.env.REFRESH_TOKEN_SECERET
  )
  try {
    const user = await User.findById(decodedToken?._id)
    if(!user) throw new ApiError(401,"Invalid Refresh Token");
    if(incomingRefreshToken !== user?.refreshToken) throw new ApiError(401,"Refresh Token is used or expired");
    const options = {
      httpOnly: true,
      secure: true
    }
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken, refreshToken: newRefreshToken},
        "Access Token Refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token");
  }
})


const changeCurrentPassword = asyncHandler(async (req,res)=>{
  const {oldPassword , newPassword} = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if(!isPasswordCorrect) throw new ApiError(400,"Invalid Old Password");
  user.password = newPassword
  await user.save({validateBeforeSave: false})
  return res
  .status(200)
  .json(new ApiResponse(200,{},"password has been successfully changed")) 
})


const getCurrentUser = asyncHandler(async (req, res)=>{
  return res
  .status(200)
  .json(200,req.user,"user fetched successfully")
})


const updateAccountDetails = asyncHandler(async (req,res)=>{
  const {fullName,email} = req.body
  if(!fullName || !email) throw new ApiError(400,"All fields are required");
  const user = User.findByIdAndUpdate(user?._id,
    {
      $set: {
        fullName,
        email: email
      }
    },
    { new: true}
  ).select("-password")
  return res.status(200)
  .json(new ApiResponse(200,user, "Account details updated successfully"))
})


const updateAvatar = asyncHandler( async (req,res)=>{
  const avatarLocalPath = req.file?.path
  if(!avatarLocalPath) throw new ApiError(400,"Avatar not found");
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if(!avatar.url) throw new ApiError(400,"Error while uploading on cloudinary");
  const user = await User.findByIdAndUpdate( user?._id,
    {
      $set:{
        avatar: avatar.url
      }
    },
    {new: true}
  ).select("-password")
  return res.status(200)
  .json(new ApiResponse(200, user,"Avatar updated successfully"))
})


const updateCoverImage = asyncHandler( async (req,res)=>{
  const coverImageLocalPath = req.file?.path
  if(!coverImageLocalPathLocalPath) throw new ApiError(400,"Cover Image not found");
  const coverImage = await uploadOnCloudinary(coverImageLocalPathLocalPath);
  if(!coverImage.url) throw new ApiError(400,"Error while uploading on cloudinary");
  const user = await User.findByIdAndUpdate( user?._id,
    {
      $set:{
        coverImage: coverImage.url
      }
    },
    {new: true}
  ).select("-password")
  return res.status(200)
  .json(new ApiResponse(200, user,"Cover Image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const {username}= req.params;
  if(!username?.trim()){
    throw new ApiError(400,"username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username : username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields:{
        subscribersCount: {
          $size: "$subscribers"
        },
        subscribedToCount:{
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: {$in : [req.user?._id , "$subscribers,subscriber"]},
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project:{
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        email: 1,
        avatar: 1,
        isSubscribed: 1,
        coverImage: 1
      }
    }

    
    
  ])
  if(!channel?.length) throw new ApiError(404,"Channel Does not exist");
  return res
  .status(200)
  .json(
    new ApiResponse(200, channel[0], "User channel is fatched successfully")
  )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
  const user = await User.aggregate([
    {
      $match : {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [{
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [{
              $project: {
                fullName: 1,
                userName: 1,
                avatar: 1
              }
            }]
          }
        },{
          $addFields: {
            owner: {
              $first: "$owner"
            }
          }
        }]
      }
    }
  ])
  return res.status(200)
  .json( new ApiResponse(200,user[0],"Watch History Fetched Successfully!!!!"))
})
export {registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword,getCurrentUser , updateAccountDetails,updateAvatar, updateCoverImage,getUserChannelProfile
  ,getWatchHistory
}