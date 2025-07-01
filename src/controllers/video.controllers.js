import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const filter = {};
    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }
    if (userId && isValidObjectId(userId)) {
        filter.owner = userId;
    }

    const sortOrder = sortType === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const videos = await Video.find(filter)
        .populate("owner", "fullName userName avatar")
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Video.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, { videos, total }, "Videos fetched successfully")
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !req.files?.video?.[0]?.path) {
        throw new ApiError(400, "Title and video file are required");
    }

    const videoLocalPath = req.files.video[0].path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    const videoUpload = await uploadOnCloudinary(videoLocalPath, "video");
    if (!videoUpload?.url) {
        throw new ApiError(500, "Video upload failed");
    }

    let thumbnailUpload;
    if (thumbnailLocalPath) {
        thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload?.url || "",
        owner: req.user._id,
        duration: videoUpload.duration || 0
    });

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId)
        .populate("owner", "fullName userName avatar");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    if (req.files?.thumbnail?.[0]?.path) {
        const thumbnailUpload = await uploadOnCloudinary(req.files.thumbnail[0].path);
        video.thumbnail = thumbnailUpload?.url || video.thumbnail;
    }

    video.title = title || video.title;
    video.description = description || video.description;

    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    await video.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"} successfully`)
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
