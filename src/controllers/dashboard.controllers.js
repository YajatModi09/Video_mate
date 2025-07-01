import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const [totalVideos, totalSubscribers, videos] = await Promise.all([
        Video.countDocuments({ owner: userId }),
        Subscription.countDocuments({ channel: userId }),
        Video.find({ owner: userId }).select("views")
    ]);

    const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);
    const videoIds = videos.map(video => video._id);

    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds }
    });

    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            totalViews,
            totalSubscribers,
            totalLikes
        }, "Channel statistics fetched successfully")
    );
});
const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const videos = await Video.find({ owner: userId })
        .populate("owner", "fullName userName avatar")
        .sort({ createdAt: -1 });

    if (!videos.length) {
        throw new ApiError(404, "No videos found for this channel");
    }

    return res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    );
});
export {
    getChannelStats, 
    getChannelVideos
    }