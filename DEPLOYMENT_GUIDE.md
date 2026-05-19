# Deployment Guide: Vercel & Render

I have successfully updated the codebase to dynamically switch between your local environment (`http://localhost:5000`) and the production environment using the `NEXT_PUBLIC_API_URL` environment variable.

Follow these step-by-step instructions to get your Dental LMS live on the internet!

## Step 1: Push Code to GitHub

First, make sure all these changes are committed and pushed to your GitHub repository. Both Vercel and Render connect directly to your GitHub to enable automatic deployments.

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

---

## Step 2: Deploy Backend to Render

Render is great for Node.js backends. 

1. Go to [Render.com](https://render.com/) and sign in with GitHub.
2. Click **New +** and select **Web Service**.
3. Select "Build and deploy from a Git repository" and connect your Dental LMS repository.
4. **Configuration:**
   - **Name:** `odontogenic-backend` (or whatever you prefer)
   - **Root Directory:** `backend` *(⚠️ Crucial step: type `backend` here)*
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **Environment Variables:** Scroll down and add these variables:
   - `MONGO_URI`: `[Your MongoDB Atlas Connection String]`
   - `JWT_SECRET`: `[Your secret string for tokens]`
   - `EMAIL_USER`: `[Your Titan Email]`
   - `EMAIL_PASS`: `[Your Titan App Password]`
6. Click **Create Web Service**. Render will now build and start your backend.
7. Once deployed, copy the Render URL (e.g., `https://odontogenic-backend.onrender.com`). You will need this for the frontend.

> [!NOTE]
> Free instances on Render spin down after 15 minutes of inactivity. The first request after a period of inactivity might take ~50 seconds as the server wakes up. Additionally, files uploaded locally to the `uploads/` folder will be deleted whenever the server restarts.

---

## Step 3: Deploy Frontend to Vercel

Vercel is the creator of Next.js and provides the best hosting experience for it.

1. Go to [Vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your Dental LMS GitHub repository.
4. **Configuration:**
   - **Project Name:** `odontogenic-lms`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Edit this and select the `frontend` folder.
5. **Environment Variables:** Expand this section and add:
   - `NEXT_PUBLIC_API_URL`: Paste the URL from Render and append `/api` (e.g., `https://odontogenic-backend.onrender.com/api`).
6. Click **Deploy**. Vercel will build your Next.js application.

---

## Step 4: MongoDB Atlas Network Access

Since your backend is now hosted in the cloud, you need to allow it to connect to your database.

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Under "Security" in the left sidebar, click **Network Access**.
3. Click **Add IP Address**.
4. Select **Allow Access From Anywhere** (`0.0.0.0/0`).
5. Click **Confirm**.

---

## Testing the Live App

Once Vercel finishes deploying, click on the live domain they provide (e.g., `https://odontogenic-lms.vercel.app`). 

Try logging in, navigating chapters, and uploading/downloading a test file in the admin panel to ensure the frontend successfully communicates with the live backend!
