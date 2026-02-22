# Chadabaze Map App

**Live Demo:** [https://chadabaz.vercel.app](https://chadabaz.vercel.app)

A Next.js application designed to track, map, and expose illegal toll collection or extortion ("Chadabaze") activities. The app allows users to report incidents, pin them on an interactive map, provide evidence (photos/videos), and crowd-verify reports through a voting system.

## 🌟 Key Features

- **Interactive Map:** View and pin locations of reported incidents using an interactive map interface.
- **Detailed Reporting:** Record crucial information including the collector's name, amount demanded per stall/car, and the source of the information.
- **Evidence Upload:** Support for uploading photos (via ImgBB) and linking video evidence (from Google Drive).
- **Community Fact-Checking:** Users can vote ("Yes" or "No") on the authenticity of reported pins to ensure data reliability.
- **Categorized Map Icons:** Custom map markers and UI elements based on report categories.

## 🚀 Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB
- **Mapping:** Leaflet & React Leaflet

## 🛠️ Local Development Setup

First, clone the repository and install the dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory and add the required environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

### Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📦 Deployment

The project is optimized for deployment on [Vercel](https://vercel.com), the platform from the creators of Next.js.

### Steps to Deploy on Vercel:
1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Go to Vercel and import your repository to create a new project.
3. **Important:** Add your Environment Variables (`MONGODB_URI`, `NEXT_PUBLIC_IMGBB_API_KEY`, etc.) in the Vercel project settings before deploying.
4. Click **Deploy**.

Vercel will automatically build and deploy your application, providing you with a live URL.

For more details on deploying Next.js applications, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
