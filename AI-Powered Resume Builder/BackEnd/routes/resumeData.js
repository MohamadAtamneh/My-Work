const express = require("express");
  const mongoose = require("mongoose");
  const Resume = require("../models/Resume");
  const { authMiddleware } = require("./auth");

  const router = express.Router();

  // DEV-ONLY helper: derive user id
  function getUserId(req) {
    return (
      req.user?._id ||
      req.userId ||
      req.auth?.id ||
      req.headers["x-user-id"] || // Dev header; set from frontend during dev
      null
    );
  }

  function ensureUser(req, res) {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: missing user." });
      return null;
    }
    try {
      return mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;
    } catch {
      return userId;
    }
  }

  // Only accept allowed fields
  function pickResumeFields(body = {}) {
    const { title, templateId, theme, style, basics, blocks, resumeData } = body;
    return { title, templateId, theme, style, basics, blocks, resumeData };
  }

  function toClient(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    obj.id = obj._id;
    delete obj.__v;
    return obj;
  }

  // Create
  router.post("/", authMiddleware, async (req, res, next) => {
    try {
      const uid = ensureUser(req, res);
      if (!uid) return;

      const data = pickResumeFields(req.body);
      if (!data.title || !String(data.title).trim()) {
        return res.status(400).json({ message: "Title is required" });
      }
      const created = await Resume.create({ userId: uid, ...data });
      return res.status(201).json(toClient(created));
    } catch (err) {
      return next(err);
    }
  });

  // List current user's resumes
  router.get("/", authMiddleware, async (req, res, next) => {
    try {
      const uid = ensureUser(req, res);
      if (!uid) return;

      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        Resume.find({ userId: uid }).sort({ updatedAt: -1 }).skip(skip).limit(limit),
        Resume.countDocuments({ userId: uid }),
      ]);

      return res.json({
        items: items.map(toClient),
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (err) {
      return next(err);
    }
  });

  // Read one
  router.get("/:id", authMiddleware, async (req, res, next) => {
    try {
      const uid = ensureUser(req, res);
      if (!uid) return;

      const { id } = req.params;
      const doc = await Resume.findOne({ _id: id, userId: uid });
      if (!doc) return res.status(404).json({ message: "Resume not found" });
      return res.json(toClient(doc));
    } catch (err) {
      return next(err);
    }
  });

  // Update
  router.put("/:id", authMiddleware, async (req, res, next) => {
    try {
      const uid = ensureUser(req, res);
      if (!uid) return;

      const { id } = req.params;
      const data = pickResumeFields(req.body);
      const updated = await Resume.findOneAndUpdate(
        { _id: id, userId: uid },
        { $set: data },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Resume not found" });
      return res.json(toClient(updated));
    } catch (err) {
      return next(err);
    }
  });

  // Delete
  router.delete("/:id", authMiddleware, async (req, res, next) => {
    try {
      const uid = ensureUser(req, res);
      if (!uid) return;

      const { id } = req.params;
      const removed = await Resume.findOneAndDelete({ _id: id, userId: uid });
      if (!removed) return res.status(404).json({ message: "Resume not found" });
      return res.json({ ok: true, id });
    } catch (err) {
      return next(err);
    }
  });

  // Render a resume with a theme
  router.post("/render", authMiddleware, async (req, res, next) => {
    try {
      const { resumeData, themeName = "elegant" } = req.body;
      if (!resumeData) {
        return res.status(400).json({ message: "resumeData is required" });
      }

      const themes = req.app.get("themes");
      const theme = themes[themeName];
      if (!theme) {
        return res.status(400).json({ message: `Theme '${themeName}' not found` });
      }

      // Use a simple render function from the theme
      const html = theme.render(resumeData);
      return res.send(html);
    } catch (err) {
      return next(err);
    }
  });

  // Export a resume as PDF
  router.post("/export-pdf", authMiddleware, async (req, res, next) => {
    try {
      // The frontend now sends pre-rendered HTML
      const { html: componentHtml } = req.body;
      if (!componentHtml) {
        return res.status(400).json({ message: "HTML content is required" });
      }

      // Inject Tailwind CSS via a CDN link for Puppeteer to use.
      // This ensures the styling matches the live preview.
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            ${componentHtml}
          </body>
        </html>
      `;

      const puppeteer = req.app.get("puppeteer");
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      const pdf = await page.pdf({ format: "A4", printBackground: true });
      await browser.close();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
      return res.send(pdf);
    } catch (err) {
      return next(err);
    }
  });

  module.exports = router;