# 📺 VideoTube Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)

A complete, highly responsive, and beautifully animated frontend for **VideoTube** – a modern video-sharing platform inspired by YouTube. Built with the latest React 19 and Vite for lightning-fast performance.

## ✨ Features
- **Modern User Interface**: Premium dark-mode glassmorphism design with fluid animations using Framer Motion.
- **Mobile Responsive**: Fully optimized for mobile, tablet, and desktop viewing.
- **Authentication**: Secure JWT-based Login and Registration integrated with Axios interceptors.
- **Video Management**: Seamlessly upload MP4/MKV/MOV videos, along with custom thumbnails directly to Cloudinary via the backend.
- **Interactive Video Player**: Dynamic video watching experience featuring real-time comments, likes, and a functional share button.
- **Channel Profiles**: View user channels, their total views, subscriber counts, and subscribe/unsubscribe dynamically.
- **Personalized Dashboards**: View your Watch History, Liked Videos, and manage your account settings (avatar/cover image updates).

## 🛠️ Tech Stack
- **Framework**: React 19 (via Vite)
- **Routing**: React Router DOM
- **HTTP Client**: Axios (configured with `withCredentials: true` for cross-site cookie support)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with comprehensive custom CSS root variables for absolute theming control

## 🚀 Getting Started Locally

### 1. Prerequisites
Make sure you have Node.js installed. Ensure your `VIDEOTUBE-BACKEND` is running concurrently to supply the API data.

### 2. Installation
Navigate into the frontend directory and install the dependencies:
```bash
cd VIDEOTUBE-FRONTEND
npm install
```

### 3. Configuration
The API endpoint is globally configured in `src/api/axios.js`. 
If you are running the backend locally on port `8000`, ensure your `baseURL` looks like this:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  withCredentials: true,
});
```

### 4. Run the Development Server
Start the ultra-fast Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the app!

## 🌐 Deployment Guidelines
This frontend is structurally configured to be deployed easily on **Vercel**. 

- **SPA Routing**: We leverage `vercel.json` in the root folder to handle React Router's client-side routing, preventing `404 Not Found` errors when users visit specific URLs dynamically.
- **CORS Configuration**: Before deploying to production, make sure the `axios.js` base URL is updated to your deployed backend domain, and verify the backend environment variable `CORS_ORIGIN` precisely matches your Vercel URL (with NO trailing slashes!).
