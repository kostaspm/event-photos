import { motion } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import "./LandingPage.css";

// ─── Configuration ────────────────────────────────────────────────────────────
const BABY_NAME = "Μαρία Ειρήνη";
const BAPTISM_DATE = "4 Ιουλίου 2026";
const WELCOME_MESSAGE =
  "Είμαστε τόσο χαρούμενοι που είστε μαζί μας σε αυτή την ξεχωριστή μέρα! " +
  "Θέλουμε να μοιραστείτε μαζί μας τις όμορφες στιγμές που αποτυπώσατε. " +
  "Κάθε φωτογραφία και βίντεο είναι ένας θησαυρός που θα κρατάμε για πάντα.";

// ─── Types ────────────────────────────────────────────────────────────────────
type FileStatus = "pending" | "uploading" | "done" | "error";

interface UploadEntry {
  id: string;
  file: File;
  status: FileStatus;
  thumbUrl?: string;
  errorMsg?: string;
}

// ─── Decorative floating elements ────────────────────────────────────────────
const floatingItems = [
  { id: 1, symbol: "✿", top: "8%",  left: "5%",  delay: 0,   duration: 4   },
  { id: 2, symbol: "✿", top: "15%", left: "88%", delay: 0.8, duration: 3.5 },
  { id: 3, symbol: "✿", top: "60%", left: "7%",  delay: 1.6, duration: 3.8 },
  { id: 4, symbol: "✿", top: "72%", left: "90%", delay: 0.6, duration: 4.2 },
];

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: "easeOut" as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  }),
};

// ─── Status icon helper ───────────────────────────────────────────────────────
function StatusIcon({ status }: { status: FileStatus }) {
  if (status === "uploading") return <span className="lp-spinner" aria-label="Ανέβασμα…" />;
  if (status === "done")      return <span className="lp-badge lp-badge--done"  aria-label="Ανέβηκε">✓</span>;
  if (status === "error")     return <span className="lp-badge lp-badge--error" aria-label="Σφάλμα">✕</span>;
  return                             <span className="lp-badge lp-badge--pending" aria-label="Αναμονή">·</span>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [entries, setEntries]       = useState<UploadEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      entries.forEach((e) => { if (e.thumbUrl) URL.revokeObjectURL(e.thumbUrl); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const accepted = Array.from(fileList).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );
    if (!accepted.length) return;
    setEntries((prev) => [
      ...prev,
      ...accepted.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        status: "pending" as FileStatus,
        thumbUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      })),
    ]);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        addFiles(e.target.files);
        e.target.value = ""; // allow re-selecting the same file
      }
    },
    [addFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const startUpload = async () => {
    if (isUploading) return;
    const pending = entries.filter((e) => e.status === "pending");
    if (!pending.length) return;

    setIsUploading(true);

    for (const entry of pending) {
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, status: "uploading" } : e)),
      );

      try {
        const fd = new FormData();
        fd.append("file", entry.file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? `Σφάλμα ${res.status}`);
        }
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, status: "done" } : e)),
        );
      } catch (err) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entry.id
              ? { ...e, status: "error", errorMsg: err instanceof Error ? err.message : "Αποτυχία" }
              : e,
          ),
        );
      }
    }

    setIsUploading(false);
  };

  const retryFailed = () => {
    setEntries((prev) =>
      prev.map((e) =>
        e.status === "error" ? { ...e, status: "pending", errorMsg: undefined } : e,
      ),
    );
  };

  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const doneCount    = entries.filter((e) => e.status === "done").length;
  const errorCount   = entries.filter((e) => e.status === "error").length;
  const allDone      = entries.length > 0 && pendingCount === 0 && !isUploading && errorCount === 0;

  return (
    <div className="lp-page">
      {/* Floating decorations */}
      {floatingItems.map((item) => (
        <motion.span
          key={item.id}
          className="lp-float"
          style={{ top: item.top, left: item.left }}
          animate={{ y: [0, -18, 0] }}
          transition={{ repeat: Infinity, duration: item.duration, delay: item.delay, ease: "easeInOut" }}
          aria-hidden="true"
        >
          {item.symbol}
        </motion.span>
      ))}

      {/* ── Hero ── */}
      <header className="lp-hero">
        <div className="lp-glow" aria-hidden="true" />

        <motion.div className="lp-photo-ring" variants={scaleIn} initial="hidden" animate="visible" custom={0.1}>
          <img
            src="/banner.jpg"
            alt={`Φωτογραφία της ${BABY_NAME}`}
            className="lp-photo"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              e.currentTarget.parentElement!.classList.add("lp-photo-placeholder");
            }}
          />
          <div className="lp-photo-placeholder-content" />
        </motion.div>

        <motion.h1 className="lp-name" variants={fadeUp} initial="hidden" animate="visible" custom={0.4}>
          {BABY_NAME}
        </motion.h1>

        <motion.p className="lp-subtitle" variants={fadeUp} initial="hidden" animate="visible" custom={0.6}>
          Βάπτιση &nbsp;•&nbsp; {BAPTISM_DATE}
        </motion.p>

        <motion.div
          className="lp-divider"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        />
      </header>

      {/* ── Main ── */}
      <main className="lp-main">
        {/* Welcome card */}
        <motion.section className="lp-card" variants={fadeUp} initial="hidden" animate="visible" custom={1.0}>
          <h2 className="lp-card-title">Καλώς ήρθατε</h2>
          <p className="lp-card-text">{WELCOME_MESSAGE}</p>
        </motion.section>

        {/* Upload card */}
        <motion.section className="lp-card" variants={fadeUp} initial="hidden" animate="visible" custom={1.2}>
          <h2 className="lp-card-title">Μοιραστείτε τις φωτογραφίες σας</h2>

          {/* Drop zone */}
          <div
            className={`lp-dropzone${isDragging ? " lp-dropzone--active" : ""}`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Επιλέξτε φωτογραφίες"
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          >
            <span className="lp-dropzone-icon">{isDragging ? "↓" : "↑"}</span>
            <p className="lp-dropzone-label">
              {isDragging ? "Αφήστε τα εδώ!" : "Σύρτε φωτογραφίες εδώ ή πατήστε για επιλογή"}
            </p>
            <p className="lp-dropzone-hint">Εικόνες &amp; βίντεο · έως 50 MB το αρχείο</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="lp-file-input"
            onChange={handleFileInput}
            aria-label="Επιλογή αρχείων"
          />

          {/* File list */}
          {entries.length > 0 && (
            <ul className="lp-file-list" aria-label="Επιλεγμένα αρχεία">
              {entries.map((entry) => (
                <li key={entry.id} className={`lp-file-item lp-file-item--${entry.status}`}>
                  {entry.thumbUrl ? (
                    <img src={entry.thumbUrl} alt="" className="lp-file-thumb" aria-hidden="true" />
                  ) : (
                    <span className="lp-file-thumb lp-file-thumb--video" aria-hidden="true">🎥</span>
                  )}
                  <span className="lp-file-name" title={entry.file.name}>{entry.file.name}</span>
                  <span className="lp-file-status">
                    <StatusIcon status={entry.status} />
                    {entry.status === "error" && entry.errorMsg && (
                      <span className="lp-file-error">{entry.errorMsg}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* All-done banner */}
          {allDone && (
            <motion.div
              className="lp-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" as const }}
            >
              <p>
                <strong>Ευχαριστούμε θερμά!</strong><br />
                {doneCount} {doneCount === 1 ? "φωτογραφία ανέβηκε" : "φωτογραφίες ανέβηκαν"} στο άλμπουμ μας.
              </p>
            </motion.div>
          )}

          {/* Action row */}
          <div className="lp-actions">
            {pendingCount > 0 && (
              <motion.button
                className="lp-cta"
                onClick={startUpload}
                disabled={isUploading}
                whileHover={isUploading ? {} : { scale: 1.05 }}
                whileTap={isUploading ? {} : { scale: 0.97 }}
              >
                {isUploading ? (
                  <><span className="lp-spinner lp-spinner--btn" aria-hidden="true" /> Ανέβασμα…</>
                ) : (
                  <>Ανέβασμα {pendingCount} {pendingCount === 1 ? "αρχείου" : "αρχείων"}</>
                )}
              </motion.button>
            )}

            {errorCount > 0 && !isUploading && (
              <button className="lp-secondary-btn" onClick={retryFailed}>
                Επανάληψη αποτυχημένων ({errorCount})
              </button>
            )}

            {entries.length > 0 && !isUploading && (
              <button className="lp-secondary-btn" onClick={() => fileInputRef.current?.click()}>
                + Προσθήκη περισσότερων
              </button>
            )}
          </div>
        </motion.section>
      </main>

      {/* ── Footer ── */}
      <motion.footer className="lp-footer" variants={fadeUp} initial="hidden" animate="visible" custom={1.6}>
        <p>Με αγάπη, η οικογένεια</p>
      </motion.footer>
    </div>
  );
}
