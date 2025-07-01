# Video_mate
Sure! Here's a professional and detailed `README.md` file tailored for your full-stack **video-sharing/social platform backend** (based on the controllers and routes you've shared: user, video, comment, tweet, playlist, subscription, and auth).

---

# 🎥 Video Sharing Platform - Backend API

This is the **Node.js + Express.js** backend for a full-featured **video sharing and social media platform** with functionality for:

* User registration & login
* Video uploads and CRUD
* Tweet-like micro-posts
* Playlists
* Comments
* Likes
* Subscriptions
* Watch history
* JWT-based authentication
* Cloudinary for file uploads

---

## 📁 Folder Structure

```
.
├── controllers/
│   ├── user.controllers.js
│   ├── video.controllers.js
│   ├── comment.controllers.js
│   ├── tweet.controllers.js
│   ├── playlist.controllers.js
│   ├── subscription.controllers.js
│   └── like.controllers.js
├── models/
│   ├── user.model.js
│   ├── video.model.js
│   ├── comment.model.js
│   ├── tweet.model.js
│   ├── playlist.model.js
│   └── subscription.model.js
├── middlewares/
│   ├── auth.middleware.js
│   └── multer.middlewares.js
├── routes/
│   ├── user.routes.js
│   ├── video.routes.js
│   ├── comment.routes.js
│   ├── tweet.routes.js
│   ├── playlist.routes.js
│   ├── subscription.routes.js
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── cloudinary.js
├── .env
├── app.js
└── server.js
```

---

## ⚙️ Features

### 🔐 Authentication & Authorization

* JWT-based login/logout
* Access & Refresh token rotation
* Password change and validation
* Middleware to protect routes

### 👤 User Management

* Register with avatar and optional cover image
* Update profile details, avatar, and cover image
* Get user channel profile
* Get watch history

### 📼 Video System

* Upload videos & thumbnails via Cloudinary
* Update, delete, publish/unpublish videos
* Search, filter, and paginate videos

### 💬 Comments

* Add, edit, delete comments on videos
* Threaded comment structure (optional)
* Like comments (optional)

### 📝 Tweets

* Create, edit, delete tweet-like posts
* Fetch tweets by user

### 🎶 Playlists

* Create, update, delete playlists
* Add/remove videos
* Fetch by user or playlist ID

### 🔔 Subscriptions

* Toggle subscribe/unsubscribe
* Get list of channel subscribers
* Get list of channels a user follows

### ❤️ Likes

* Toggle like on videos, comments, and tweets
* Get liked videos

---

## 🔧 Technologies Used

* **Node.js**
* **Express.js**
* **MongoDB + Mongoose**
* **Cloudinary** for file uploads
* **JWT** for authentication
* **Multer** for handling multipart form data
* **dotenv** for environment config

---

## 📦 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/YajatModi09/Video_mate9.git
cd video-platform-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your `.env` file

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Start the server

```bash
npm run dev
```

---

## 🛣️ API Routes Overview

| Route                     | Method | Description                      |
| ------------------------- | ------ | -------------------------------- |
| `/api/users/register`     | POST   | Register a new user              |
| `/api/users/login`        | POST   | Login user                       |
| `/api/users/logout`       | POST   | Logout user                      |
| `/api/videos/`            | GET    | Fetch videos with filters        |
| `/api/videos/`            | POST   | Publish video with upload        |
| `/api/comments/video/:id` | GET    | Get comments of a video          |
| `/api/comments/video/:id` | POST   | Add a comment to a video         |
| `/api/playlists/`         | POST   | Create a playlist                |
| `/api/tweets/`            | POST   | Create a tweet                   |
| `/api/subscriptions/:id`  | POST   | Subscribe/unsubscribe to channel |
| ...                       | ...    | Many more 🔥                     |

---

## ✅ Contribution

Feel free to fork, clone, and make improvements. Pull requests are always welcome!

---

## 🛡️ License

MIT License. You are free to use and modify it as needed.
