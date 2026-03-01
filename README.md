# Re-Play Deployment Guide (Netlify)

This application is ready to be deployed to Netlify as a Single Page Application (SPA).

## Prerequisites

1.  A [Netlify](https://www.netlify.com/) account.
2.  The [Netlify CLI](https://docs.netlify.com/cli/get-started/) installed (optional, but recommended).
3.  Your **Gemini API Key**.

## Deployment Steps

### Option 1: Manual Deployment (Drag and Drop)

1.  Run the build command locally:
    ```bash
    npm run build
    ```
2.  Log in to your Netlify account and go to the **Sites** page.
3.  Drag the `dist` folder from your project root into the deployment area.
4.  Once deployed, go to **Site settings > Environment variables**.
5.  Add a new variable:
    *   **Key**: `GEMINI_API_KEY`
    *   **Value**: `your_actual_gemini_api_key_here`
6.  Trigger a new deploy or wait for the environment variable to propagate.

### Option 2: Git Integration (Recommended)

1.  Push your code to a Git provider (GitHub, GitLab, or Bitbucket).
2.  In Netlify, click **Add new site > Import an existing project**.
3.  Select your repository.
4.  Netlify will automatically detect the settings from `netlify.toml`:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
5.  Before clicking **Deploy site**, go to the **Environment variables** section and add:
    *   **Key**: `GEMINI_API_KEY`
    *   **Value**: `your_actual_gemini_api_key_here`
6.  Click **Deploy site**.

## Configuration Details

The project includes a `netlify.toml` file that handles:
-   **SPA Routing**: Ensures that all routes are redirected to `index.html` so React Router can handle them.
-   **Build Settings**: Automates the build and publish process.

## Environment Variables

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | **Required**. Your Google Gemini API key for AI features. |
