import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Toggle like for a video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        user: req.user._id
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "Video unliked successfully"));
    }

    const newLike = await Like.create({
        video: videoId,
        user: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, newLike, "Video liked successfully"));
});


// Toggle like for a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        user: req.user._id
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "Comment unliked successfully"));
    }

    const newLike = await Like.create({
        comment: commentId,
        user: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, newLike, "Comment liked successfully"));
});


// Toggle like for a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        user: req.user._id
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "Tweet unliked successfully"));
    }

    const newLike = await Like.create({
        tweet: tweetId,
        user: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, newLike, "Tweet liked successfully"));
});


// Get all liked videos by the user
const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.find({
        user: req.user._id,
        video: { $exists: true }
    })
    .populate("video")
    .sort({ createdAt: -1 });

    const videos = likedVideos.map(like => like.video).filter(Boolean);

    if (!videos.length) {
        throw new ApiError(404, "No liked videos found");
    }

    return res.status(200).json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}