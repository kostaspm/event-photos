import { motion } from "framer-motion";
import "./LandingPage.css";

// ─── Configuration ────────────────────────────────────────────────────────────
// Replace this with the actual shared Google Photos album link
const ALBUM_URL = "https://photos.app.goo.gl/syqnStSSdzfANZVv7";

// Replace with the baby's name and baptism details
const BABY_NAME = "Μαρία";
const BAPTISM_DATE = "1 Ιουνίου 2026";
const WELCOME_MESSAGE =
  "Είμαστε τόσο χαρούμενοι που είστε μαζί μας σε αυτή την ξεχωριστή μέρα! " +
  "Θέλουμε να μοιραστείτε μαζί μας τις όμορφες στιγμές που αποτυπώσατε. " +
  "Κάθε φωτογραφία και βίντεο είναι ένας θησαυρός που θα κρατάμε για πάντα. 💕";

// ─── Decorative floating elements ────────────────────────────────────────────
const floatingItems = [
  { id: 1, symbol: "🕊️", top: "8%", left: "5%", delay: 0, duration: 4 },
  { id: 2, symbol: "✨", top: "15%", left: "88%", delay: 0.8, duration: 3.5 },
  { id: 3, symbol: "🌸", top: "35%", left: "3%", delay: 1.2, duration: 5 },
  { id: 4, symbol: "🕊️", top: "28%", left: "92%", delay: 0.4, duration: 4.5 },
  { id: 5, symbol: "✨", top: "60%", left: "7%", delay: 1.6, duration: 3.8 },
  { id: 6, symbol: "🌸", top: "72%", left: "90%", delay: 0.6, duration: 4.2 },
  { id: 7, symbol: "🕊️", top: "85%", left: "12%", delay: 2.0, duration: 5.2 },
  { id: 8, symbol: "✨", top: "90%", left: "82%", delay: 1.0, duration: 3.2 },
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="lp-page">
      {/* Floating decorations */}
      {floatingItems.map((item) => (
        <motion.span
          key={item.id}
          className="lp-float"
          style={{ top: item.top, left: item.left }}
          animate={{ y: [0, -18, 0] }}
          transition={{
            repeat: Infinity,
            duration: item.duration,
            delay: item.delay,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        >
          {item.symbol}
        </motion.span>
      ))}

      {/* ── Hero ── */}
      <header className="lp-hero">
        {/* Soft radial glow behind the photo */}
        <div className="lp-glow" aria-hidden="true" />

        <motion.div
          className="lp-photo-ring"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          custom={0.1}
        >
          {/*
           * Replace the src below with the actual banner photo of the baby.
           * Example: src="/maria-photo.jpg"
           * The image should ideally be square or will be cropped to a circle.
           */}
          <img
            src="/banner.jpg"
            alt={`Φωτογραφία της ${BABY_NAME}`}
            className="lp-photo"
            onError={(e) => {
              // Fallback gradient if image is not provided yet
              (e.currentTarget as HTMLImageElement).style.display = "none";
              e.currentTarget.parentElement!.classList.add("lp-photo-placeholder");
            }}
          />
          <div className="lp-photo-placeholder-content">
            <span>👼</span>
          </div>
        </motion.div>

        <motion.h1
          className="lp-name"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
        >
          {BABY_NAME}
        </motion.h1>

        <motion.p
          className="lp-subtitle"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.6}
        >
          Βάπτιση &nbsp;•&nbsp; {BAPTISM_DATE}
        </motion.p>

        {/* Decorative divider */}
        <motion.div
          className="lp-divider"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        />
      </header>

      {/* ── Welcome card ── */}
      <main className="lp-main">
        <motion.section
          className="lp-card"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1.0}
        >
          <h2 className="lp-card-title">Καλώς ήρθατε! 🤍</h2>
          <p className="lp-card-text">{WELCOME_MESSAGE}</p>
        </motion.section>

        {/* ── Instructions card ── */}
        <motion.section
          className="lp-card lp-card--steps"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1.2}
        >
          <h2 className="lp-card-title">Πώς να μοιραστείτε τις φωτογραφίες σας</h2>
          <ol className="lp-steps">
            <li>
              <span className="lp-step-num">1</span>
              <span>Πατήστε το κουμπί παρακάτω για να ανοίξετε το κοινόχρηστο άλμπουμ.</span>
            </li>
            <li>
              <span className="lp-step-num">2</span>
              <span>Συνδεθείτε με τον λογαριασμό σας Google (αν χρειαστεί).</span>
            </li>
            <li>
              <span className="lp-step-num">3</span>
              <span>
                Πατήστε «Προσθήκη φωτογραφιών» και επιλέξτε όσες θέλετε να μοιραστείτε!
              </span>
            </li>
          </ol>
        </motion.section>

        {/* ── CTA Button ── */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          custom={1.4}
          className="lp-cta-wrapper"
        >
          <motion.a
            href={ALBUM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-cta"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="lp-cta-icon">📸</span>
            Μοιραστείτε τις φωτογραφίες σας
          </motion.a>
          <p className="lp-cta-note">Ανοίγει το Google Photos άλμπουμ σε νέα καρτέλα</p>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <motion.footer
        className="lp-footer"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1.6}
      >
        <p>Με αγάπη, η οικογένεια &nbsp;🤍</p>
      </motion.footer>
    </div>
  );
}
