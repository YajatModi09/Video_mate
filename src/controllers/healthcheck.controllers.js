import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const healthcheck = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, { status: "OK" }, "Server is up and running 🚀")
    );
});

export {
    healthcheck
}
// This controller is used to check the health of the server
// It can be used to check if the server is running and responding to requests      