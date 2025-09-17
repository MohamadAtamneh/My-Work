# Modular Skills Assessment Tool – README

## Overview

This is a **full-stack modular skills assessment tool** designed to **assist students with scenario-based assessments**.

* **Backend:** Node.js + Express
* **Frontend:** React + Vite
* **Database:** MongoDB
* **AI Routes:** Optional Anthropic Claude (`/api/claude`)

The AI is intended to **analyze student responses** and provide feedback on whether their answers match the given scenario.

You can run the project entirely **locally** using VS Code.

---

## Prerequisites

* **Node.js v18+** ([Download](https://nodejs.org/en/))
* **npm** (comes with Node.js)
* **MongoDB Community Server** + **MongoDB Compass**
* (Optional) **Anthropic API key** for AI routes

---

## How to Run

1. **Download the ZIP** file and extract it.

2. **Open the project folder** in **VS Code**.

3. **Backend**:

   * Open the backend folder.

   * Ensure your `.env` file is present with at least:

     ```
     MONGO_URI=mongodb://127.0.0.1:27017/modular_skills
     ANTHROPIC_API_KEY=your-key   # optional
     NODE_ENV=development
     ```

   * Open the terminal in VS Code and run:

     ```
     npm install
     node app.js
     ```

   * Backend server should start at `http://localhost:5000`.

4. **Frontend**:

   * Open the frontend folder.

   * Install dependencies:

     ```
     npm install
     npm run dev
     ```

   * Open the browser at `http://localhost:5173/`.

   * All frontend API calls will connect to the backend automatically.

---

## Notes

* Make sure **MongoDB is running** locally. Compass can be used to inspect the database.
* AI routes (`/api/claude`) **require an Anthropic API key**; without it, AI features will not work.
* The AI is used to **evaluate student answers** against given scenarios and provide feedback.
* All other functionality works **fully locally** (students, teachers, notifications, classes).
* Users do **not need to clone the project** or use Git — just download the ZIP and open in VS Code.

---

## ⚠️ Important

> The AI features are **not functional by default** because connecting to Anthropic Claude requires a subscription. All other parts of the app can be tested and used locally.



