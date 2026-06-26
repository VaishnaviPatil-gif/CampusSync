/**
 * ShowcasePage — the marketing/overview page shown after the intro.
 *
 * Pixel-perfect React port of <section class="showcase-page"> from the original HTML.
 * Receives onNavigateToAuth to handle all "Login to Explore" buttons.
 * Receives activeWorkflowIndex and workflowProgress from the parent.
 */
import styles from '@/pages/LandingPage.module.css'
import { useWorkflowAnimation } from '@/hooks/useWorkflowAnimation'

/* Graduation-cap SVG — extracted from inline SVG in original HTML */
const GraduationCapSvg = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
    <path
      fill="currentColor"
      d="M32 12 8 24l24 12 19-9.5V42h5V24L32 12Zm-15 22.8V41c0 3.9 6.7 7 15 7s15-3.1 15-7v-6.2L32 42 17 34.8Z"
    />
  </svg>
)

/* Reel images — same URLs as original */
const REEL_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=320&fit=crop', alt: 'Students collaborating' },
  { src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=320&fit=crop', alt: 'Success and achievement' },
  { src: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500&h=320&fit=crop', alt: 'Digital learning' },
  { src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&h=320&fit=crop', alt: 'Education focus' },
  { src: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=500&h=320&fit=crop', alt: 'Academic excellence' },
  { src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=320&fit=crop', alt: 'Team collaboration' },
  { src: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=500&h=320&fit=crop', alt: 'Success mindset' },
  { src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=320&fit=crop', alt: 'Student success' },
] as const

const FEATURES = [
  { icon: 'A', title: 'Dropout Risk Prediction using AI', desc: 'Predicts high-risk students early from multi-dimensional behavioral and academic patterns.' },
  { icon: 'P', title: 'Student Performance Analytics', desc: 'Tracks trend lines across tests, assignments, attendance, and class engagement.' },
  { icon: 'M', title: 'Mental Health & Stress Monitoring', desc: 'Combines mood and IoT-based wellness indicators to detect distress signals in time.' },
  { icon: 'F', title: 'Financial Risk & Scholarship Suggestions', desc: 'Flags financial stress and recommends scholarships or aid paths for continuity.' },
  { icon: 'R', title: 'Real-Time Alerts to Parents & Teachers', desc: 'Sends immediate alerts with clear next actions for timely intervention planning.' },
  { icon: 'E', title: 'Student Engagement Tracking', desc: 'Measures both academic and non-academic participation to build full growth profiles.' },
] as const

const INSIGHTS = [
  'Early detection of student problems before visible decline appears.',
  'Prevents dropouts before they happen using proactive support signals.',
  'Supports students beyond academics with wellness and context-aware insights.',
  'Connects students, parents, and faculty in one unified response system.',
] as const

const WORKFLOW_STAGES = [
  { num: '01', title: 'Student Data', desc: 'Attendance, academic, behavior, mood, and support history are unified into one profile.' },
  { num: '02', title: 'AI Analysis', desc: 'Pattern engines evaluate hidden correlations and detect risk acceleration signals.' },
  { num: '03', title: 'Risk Score', desc: 'Each student receives a dynamic score with confidence context and urgency level.' },
  { num: '04', title: 'Alerts', desc: 'Teachers and parents get real-time alerts with clear, role-aware action prompts.' },
  { num: '05', title: 'Intervention', desc: 'Targeted support plans are launched, monitored, and refined for measurable outcomes.' },
] as const

const ROLES = [
  { title: 'Student Login', desc: 'Access personal analytics, progress trends, and recommendations.', label: 'Login as Student', role: 'Student' },
  { title: 'Parent Login', desc: 'View alerts, milestones, and intervention guidance for your child.', label: 'Login as Parent', role: 'Parent' },
  { title: 'Faculty Login', desc: 'Monitor classrooms, detect risks, and coordinate support plans.', label: 'Login as Faculty', role: 'Teacher' },
] as const

interface ShowcasePageProps {
  isActive: boolean
  onNavigateToAuth: (preselectedRole?: string) => void
}

export default function ShowcasePage({ isActive, onNavigateToAuth }: ShowcasePageProps) {
  const { activeIndex, progressPercent } = useWorkflowAnimation()

  return (
    <section
      className={`${styles.showcasePage} ${isActive ? styles.showcasePageActive : ''}`}
      id="showcasePage"
    >
      <div className={styles.showcaseShell}>

        {/* ── Top bar ── */}
        <header className={`${styles.showcaseTop} ${styles.reveal}`}>
          <div className={styles.logoMark}>
            <span className={styles.brandWord}>
              STUDENT 360°
              <GraduationCapSvg className={styles.sCap} />
            </span>
          </div>
          <div className={styles.exploreActions}>
            <button
              className={styles.exploreBtn}
              type="button"
              id="exploreSignInBtn"
              onClick={() => onNavigateToAuth()}
            >
              Login To Explore
            </button>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className={`${styles.showcaseHero} ${styles.reveal} ${styles.delay1}`}>
          <h1 className={styles.headingBrand}>
            Student 360°
            <GraduationCapSvg className={`${styles.sCap} ${styles.sCapHero}`} />
          </h1>
          <h4>A 360° View of Student Success</h4>
          <p>
            Student360 AI is an integrated early-warning platform that combines academics, attendance,
            behavior, wellness, and financial signals into one clean dashboard for institutions,
            teachers, parents, and students.
          </p>
          <button
            className={styles.showcasePrimary}
            type="button"
            id="heroExploreBtn"
            onClick={() => onNavigateToAuth()}
          >
            Login to Explore More
          </button>

          {/* Film reel */}
          <div
            className={styles.reelWrap}
            aria-label="Student success stories and educational excellence"
          >
            <div className={styles.reelTrack}>
              {/* Original + duplicate set for seamless infinite scroll */}
              {[...REEL_IMAGES, ...REEL_IMAGES].map((img, i) => (
                <div key={i} className={styles.reelFrame}>
                  <img src={img.src} alt={img.alt} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
          <p className={styles.reelNote}>
            Let's collaborate together for stronger student care across campuses.
          </p>
        </section>

        {/* ── What This Platform Does ── */}
        <section className={`${styles.reveal} ${styles.delay2}`}>
          <h3 className={styles.sectionTitle}>What This Platform Does</h3>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <article key={f.icon} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Why This Platform Matters ── */}
        <section className={`${styles.reveal} ${styles.delay3}`}>
          <h3 className={styles.sectionTitle}>Why This Platform Matters</h3>
          <div className={styles.insightGrid}>
            {INSIGHTS.map((text) => (
              <article key={text} className={styles.insightCard}>
                {text}
              </article>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className={`${styles.reveal} ${styles.delay4}`}>
          <h3 className={styles.sectionTitle}>How It Works</h3>
          <div className={styles.workflowBoard} aria-label="Platform process flow">
            <div className={styles.workflowProgress} aria-hidden="true">
              <span
                className={styles.workflowProgressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className={styles.workflowGrid}>
              {WORKFLOW_STAGES.map((stage, i) => (
                <article
                  key={stage.num}
                  className={`${styles.workflowStage} ${i === activeIndex ? styles.workflowStageActive : ''}`}
                >
                  <span className={styles.workflowNum}>{stage.num}</span>
                  <b>{stage.title}</b>
                  <p>{stage.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── User Roles ── */}
        <section className={`${styles.reveal} ${styles.delay5}`}>
          <h3 className={styles.sectionTitle}>User Roles</h3>
          <div className={styles.roleGrid}>
            {ROLES.map((r) => (
              <article key={r.role} className={styles.roleCard}>
                <h4>{r.title}</h4>
                <p>{r.desc}</p>
                <button
                  className={styles.roleBtn}
                  type="button"
                  id={`role${r.role}ExploreBtn`}
                  onClick={() => onNavigateToAuth(r.role)}
                >
                  {r.label}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* ── CTA Strip ── */}
        <section className={`${styles.ctaStrip} ${styles.reveal} ${styles.delay5}`}>
          <h3>Empower Every Student. Prevent Every Risk.</h3>
          <button
            className={styles.ctaBtn}
            type="button"
            id="ctaExploreBtn"
            onClick={() => onNavigateToAuth()}
          >
            Login
          </button>
        </section>

      </div>
    </section>
  )
}
