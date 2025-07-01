import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (req.user._id.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    });

    if (existingSubscription) {
        await existingSubscription.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed from channel successfully"));
    }

    await Subscription.create({
        channel: channelId,
        subscriber: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, {}, "Subscribed to channel successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "userName fullName avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, subscribers.map(sub => sub.subscriber), "Subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "userName fullName avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, subscriptions.map(sub => sub.channel), "Subscribed channels fetched successfully")
    );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
