const express = require("express");
const mongoose = require("mongoose");
const Resume = require("../models/Resume");
const { authenticateToken } = require("./auth");

const router = express.Router();

// DEV-ONLY helper: derive user id
function getUserId(req) {
  return (
    req.user?.id ||
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
router.post("/", authenticateToken, async (req, res, next) => {
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
router.get("/", authenticateToken, async (req, res, next) => {
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
router.get("/:id", authenticateToken, async (req, res, next) => {
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
router.put("/:id", authenticateToken, async (req, res, next) => {
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
router.delete("/:id", authenticateToken, async (req, res, next) => {
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
router.post("/render", authenticateToken, async (req, res, next) => {
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

// =============================
// PDF Export Route (Improved)
// =============================
router.post("/export-pdf", authenticateToken, async (req, res, next) => {
  try {
    const { html: componentHtml, templateId } = req.body;
    if (!componentHtml) {
      return res.status(400).json({ message: "HTML content is required" });
    }

    const isCreativeBold = templateId === "creative-bold";

    // Build full HTML for Puppeteer rendering
    let finalHtml;
    if (!isCreativeBold) {
      finalHtml = `
      <html>
        <head>
          <style>
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              /* A simple, forceful rule to prevent breaking inside any element.
                 The inline-block wrappers should be the primary mechanism, but this helps. */
              * {
                break-inside: avoid !important;
              }
            }
          </style>
        </head>
        <body>
          ${componentHtml}
        </body>
      </html>
    `;
    } else {
      finalHtml = `
          
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>

    <style>
      @page {
        margin: 0;
        size: A4;
      }

      html, body {
        margin: 0;
        padding: 0;
        width: 210mm;
        min-height: 297mm;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        background: ${isCreativeBold ? "#7c3aed" : "#ffffff"};
      }

      body {
        padding: 32px;
      }

      /* Each page container */
      .page {
        width: 210mm;
        min-height: 297mm;
        display: grid;
        grid-template-columns: ${isCreativeBold ? "1fr 2fr" : "1fr"};
        position: relative;
        page-break-after: always;
        overflow: hidden;
      }

      /* Sidebar only for creative-bold */
      ${
        isCreativeBold
          ? `
      .resume-sidebar {
        background-color: #7c3aed;
        color: white;
        padding: 32px;
        height: 100%;
        position: relative;
      }
      .page::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 33.333%;
        height: 100%;
        background: #7c3aed;
        z-index: -1;
      }
      `
          : ""
      }

      /* Main content column for all pages */
      .resume-main {
        background-color: #ffffff;
        padding: 48px 40px 56px 40px;
        display: flex;
        flex-direction: column;
      }

      /* Add top padding for all pages after the first page */
      .page + .page .resume-main {
        padding-top: 80px; /* Same as creative bold */
      }

      /* Avoid breaking sections in the middle */
      section, .resume-section, .repeatable-section, .group {
        page-break-inside: avoid;
      }

      /* Ensure grid content renders above backgrounds */
      div[style*="display: grid"] {
        position: relative;
        margin: -32px; /* Keep consistent with creative bold */
        width: calc(100% + 64px);
        min-height: 297mm;
        z-index: 1;
      }

      /* Prevent awkward page breaks */
      .avoid-break {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .page-break {
        page-break-before: always;
        break-before: page;
      }

      /* Print color adjustment for safety */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    </style>
  </head>
  <body>
    ${componentHtml}
  </body>
</html>
`;
    }



    const puppeteer = req.app.get("puppeteer");
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: "networkidle0" });

    let pdf;
    if (isCreativeBold) {
      pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    } else {
      pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
    });
    }

    await browser.close();
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
    return res.send(pdf);
  } catch (err) {
    console.error("PDF Export Error:", err);
    return next(err);
  }
});



module.exports = router;