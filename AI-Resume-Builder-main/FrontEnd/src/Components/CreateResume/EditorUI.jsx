import React, { useMemo, useState } from "react";

export function SectionCard({
  title,
  action,
  footer,
  as: Tag = "section",
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  children,
}) {
  return (
    <Tag className={["rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden shadow-xl", className].join(" ")}>
      {(title || action) && (
        <div className={["px-5 py-4 border-b border-white/10 flex items-center justify-between", headerClassName].join(" ")}>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {action ? <div className="text-xs text-purple-300 hover:text-purple-200">{action}</div> : null}
        </div>
      )}
      <div className={["p-4", bodyClassName].join(" ")}>{children}</div>
      {footer ? <div className={["px-5 py-3 border-t border-white/10 text-xs text-gray-400", footerClassName].join(" ")}>{footer}</div> : null}
    </Tag>
  );
}

export function BlockToolbar({ onMoveUp, onMoveDown, onDuplicate, onDelete, upDisabled, downDisabled }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={upDisabled}
        className="px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-gray-200 disabled:opacity-40"
        title="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={downDisabled}
        className="px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-gray-200 disabled:opacity-40"
        title="Move down"
      >
        ↓
      </button>
      <button type="button" onClick={onDuplicate} className="px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-gray-200" title="Duplicate">
        ⎘
      </button>
      <button type="button" onClick={onDelete} className="px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-red-300" title="Delete">
        ✖
      </button>
    </div>
  );
}

export function ResumePreviewPanel({
  title = "Live preview",
  action,
  loading = false,
  error = null,
  previewHtml = "",
  previewComponent = null, // React element preview (e.g., <ResumeRenderer ... />)
  initialScale = 0.95,
  minScale = 0.75,
  maxScale = 1.25,
  step = 0.05,
  panelClassName = "",
  paperClassName = "",
  headerClassName = "",
  bodyClassName = "",
}) {
  const [scale, setScale] = useState(initialScale);
  const presets = useMemo(() => [0.75, 0.9, 1, 1.1, 1.25], []);
  const dec = () => setScale((s) => Math.max(minScale, +(s - step).toFixed(2)));
  const inc = () => setScale((s) => Math.min(maxScale, +(s + step).toFixed(2)));

  return (
    <section className={["rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden shadow-xl", panelClassName].join(" ")}>
      <div className={["px-5 py-4 border-b border-white/10 flex items-center justify-between", headerClassName].join(" ")}>
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {error ? <span className="text-xs text-red-300">Failed to load preview</span> : null}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-300">
            <button
              type="button"
              onClick={dec}
              className="px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
              aria-label="Zoom out"
            >
              −
            </button>
            <select
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
              aria-label="Zoom level"
            >
              {presets.map((p) => (
                <option key={p} value={p}>
                  {Math.round(p * 100)}%
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={inc}
              className="px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
          {action ? <div className="text-xs text-purple-300 hover:text-purple-200">{action}</div> : null}
        </div>
      </div>
      <div className={["p-4", bodyClassName].join(" ")}>
        {loading ? (
          <div className="px-5 py-4 text-gray-400 text-sm">Rendering…</div>
        ) : (
          <div className="w-full">
            <div className="mx-auto" style={{ width: "min(100%, 720px)" }}>
              <div className="origin-top mx-auto" style={{ transform: `scale(${scale})`, transformOrigin: "top center", width: "100%" }}>
                <div className={["bg-white text-gray-900 rounded-lg shadow", "aspect-[1/1.414] w-full", "overflow-y-auto print:overflow-visible print:shadow-none", paperClassName].join(" ")}>
                  {previewComponent ? (
                    <div className="w-full h-full">{previewComponent}</div>
                  ) : previewHtml ? (
                    <iframe title="Resume Preview" className="w-full h-full" srcDoc={previewHtml} sandbox="allow-scripts allow-same-origin" style={{ border: "0" }} />
                  ) : (
                    <div className="p-6 sm:p-8 text-sm text-gray-600">
                      Start editing blocks to see a preview. This canvas preserves an A4-like aspect ratio.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}