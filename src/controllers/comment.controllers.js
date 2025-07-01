import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// GET all comments for a video (with pagination)
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const comments = await Comment.find({ video: videoId })
        .populate("owner", "userName fullName avatar")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))

    const totalComments = await Comment.countDocuments({ video: videoId })

    return res.status(200).json(
        new ApiResponse(200, {
            comments,
            pagination: {
                total: totalComments,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(totalComments / limit),
            }
        }, "Comments fetched successfully")
    )
})

// ADD a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    const populatedComment = await comment.populate("owner", "userName fullName avatar")

    return res.status(201).json(
        new ApiResponse(201, populatedComment, "Comment added successfully")
    )
})

// UPDATE a comment (only by owner)
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Updated content is required")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment")
    }

    comment.content = content
    await comment.save()

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    )
})

// DELETE a comment (only by owner)
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    await comment.deleteOne()

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
