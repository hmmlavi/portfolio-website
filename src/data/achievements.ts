/**
 * Achievements & Certifications — verified structured data.
 * Real photographs and certificates live in public/achievements/.
 */
import { type AccentName } from "@/data/palette";

export type AchievementImage = {
  src: string;
  alt: string;
  caption?: string;
  fit?: "contain" | "cover";
};

export type AwardItem = {
  id: string;
  title: string;
  org: string;
  date: string;
  detail: string;
  accent: AccentName;
  images: AchievementImage[];
};

export type RecognitionItem = {
  id: string;
  title: string;
  org: string;
  date: string;
  detail: string;
  accent: AccentName;
  images: AchievementImage[];
};

export type CertItem = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
  tasks?: string[];
  verifyUrl?: string;
  accent: AccentName;
  image?: AchievementImage;
};

export type CloudBadge = {
  name: string;
  issuer: string;
  url: string;
};

/* ──────────────── 1. awards & competition wins ──────────────── */
export const AWARDS: AwardItem[] = [
  {
    id: "terii-gk-quiz",
    title: "1st Position — State-Level Quiz Competition",
    org: "TERii — Technology Education & Research Integrated Institutions",
    date: "18 January 2025",
    detail:
      "Secured first position in the state-level quiz competition at TERii Regalia Fiesta 2025.",
    accent: "ice",
    images: [
      {
        src: "/achievements/terii-gk-quiz-certificate.png",
        alt: "Certificate of Distinction for first position in TERii Regalia Fiesta 2025, a state-level quiz competition",
        caption: "Certificate of Distinction — TERii Regalia Fiesta 2025",
        fit: "contain",
      },
      {
        src: "/achievements/terii-gk-quiz-ceremony.jpg",
        alt: "TERii Regalia Fiesta quiz award group photograph",
        caption: "Award ceremony — TERii Regalia Fiesta 2025",
        fit: "cover",
      },
    ],
  },
  {
    id: "piet-spardha-runner-up",
    title: "Runner-Up — Spardha Ideathon",
    org: "PIET — Panipat Institute of Engineering & Technology",
    date: "December 2022",
    detail:
      "Earned the runner-up position at the Spardha Ideathon and received the event trophy.",
    accent: "rose",
    images: [
      {
        src: "/achievements/piet-spardha-trophy.png",
        alt: "PIET Spardha 2022 Runner-Up trophy for the Ideathon",
        caption: "Runner-up trophy — Spardha Ideathon, 2022",
        fit: "contain",
      },
      {
        src: "/achievements/piet-spardha-ceremony.jpg",
        alt: "Photograph from the PIET Spardha Ideathon event",
        caption: "Spardha Ideathon — event photograph",
        fit: "cover",
      },
    ],
  },
  {
    id: "nit-kurukshetra-webdev",
    title: "1st Position — Web Development Competition",
    org: "National Institute of Technology, Kurukshetra",
    date: "26 November 2022",
    detail:
      "Secured first position in the web development competition as part of a two-member team.",
    accent: "mint",
    images: [
      {
        src: "/achievements/nit-kurukshetra-certificate.png",
        alt: "NIT Kurukshetra Certificate of Achievement for first position in the Web Development competition, awarded to Lakshit Saini and Vishal",
        caption: "Certificate of Achievement — NIT Kurukshetra",
        fit: "contain",
      },
      {
        src: "/achievements/nit-kurukshetra-ceremony.jpg",
        alt: "Certificate presentation photograph for the NIT Kurukshetra competition",
        caption: "Certificate presentation",
        fit: "cover",
      },
    ],
  },
  {
    id: "piet-spardha-finalist",
    title: "National-Level Spardha Ideathon — Finalist",
    org: "PIET — Panipat Institute of Engineering & Technology",
    date: "December 2022",
    detail:
      "Recognised as a finalist at the national-level PIET Spardha Ideathon.",
    accent: "violet",
    images: [
      {
        src: "/achievements/piet-spardha-finalist-certificate.png",
        alt: "Certificate recognising Lakshit as a finalist in the national-level PIET Spardha Ideathon",
        caption: "Finalist certificate — PIET Spardha Ideathon",
        fit: "contain",
      },
    ],
  },
];

/* ──────────────── 2. recognition & representation ──────────────── */
export const RECOGNITION: RecognitionItem[] = [
  {
    id: "gita-jayanti-governor",
    title: "Project Presentation to the Governor of Haryana",
    org: "International Gita Jayanti Mahotsav",
    date: "December 2023",
    detail:
      "Represented my school and presented our project to Shri Bandaru Dattatreya, then Governor of Haryana.",
    accent: "ice",
    images: [
      {
        src: "/achievements/gita-jayanti-governor.png",
        alt: "School project exhibition photograph with the Governor of Haryana at Gita Jayanti",
        caption: "Project presentation — Gita Jayanti Mahotsav",
        fit: "cover",
      },
    ],
  },
  {
    id: "gita-jayanti-dignitaries",
    title: "Project Presentation Before National Leaders",
    org: "International Gita Jayanti Mahotsav",
    date: "December 2023",
    detail:
      "Represented my school and presented the project during a visit by national and state dignitaries, including the Vice President and Haryana leadership.",
    accent: "mint",
    images: [
      {
        src: "/achievements/gita-jayanti-dignitaries.png",
        alt: "School project exhibition being viewed by national and state dignitaries at Gita Jayanti",
        caption: "Project exhibition — Gita Jayanti Mahotsav",
        fit: "cover",
      },
    ],
  },
  {
    id: "kuk-appreciation",
    title: "Runner-Up — Innovative Idea",
    org: "Kurukshetra University",
    date: "12 January 2023",
    detail:
      "Received a runner-up trophy for an innovative idea, with recognition on National Youth Day at Kurukshetra University.",
    accent: "rose",
    images: [
      {
        src: "/achievements/kuk-innovative-idea-certificate.png",
        alt: "Kurukshetra University Certificate of Appreciation for runner-up trophy for an innovative idea on National Youth Day, 12 January 2023",
        caption: "Certificate of Appreciation — Kurukshetra University",
        fit: "contain",
      },
    ],
  },
];

/* ──────────────── 3. professional certifications ──────────────── */
export const CERTIFICATIONS: CertItem[] = [
  {
    id: "datacom-cloud",
    title: "Introduction to Cloud Job Simulation",
    issuer: "Datacom · Forage",
    date: "18 September 2026",
    credentialId: "6aad91838b93e7892ab160d5",
    tasks: [
      "Register an application on the cloud",
      "Create a GitHub Actions workflow",
    ],
    verifyUrl:
      "https://www.theforage.com/completion-certificates/gCW7Xki5Y3vNpBmnn/qsuRRyXDZ7Dj2QFx4_gCW7Xki5Y3vNpBmnn_68f109519972dd2cc245f15e_1789760623403_completion_certificate.pdf",
    accent: "mint",
    image: {
      src: "/achievements/datacom-certificate.png",
      alt: "Datacom Introduction to Cloud Job Simulation — Certificate of Completion, September 18th 2026",
      fit: "contain",
    },
  },
  {
    id: "deloitte-tech",
    title: "Technology Job Simulation",
    issuer: "Deloitte · Forage",
    date: "16 October 2025",
    credentialId: "n2TYWowFk8J26xSGN",
    tasks: ["Coding", "Development"],
    verifyUrl:
      "https://www.theforage.com/completion-certificates/9PBTqmSxAf6zZTseP/udmxiyHeqYQLkTPvf_9PBTqmSxAf6zZTseP_68f109519972dd2cc245f15e_1760631471361_completion_certificate.pdf",
    accent: "violet",
    image: {
      src: "/achievements/deloitte-certificate.png",
      alt: "Deloitte Technology Job Simulation — Certificate of Completion, October 16th 2025",
      fit: "contain",
    },
  },
];

/* ──────────────── 4. google cloud ──────────────── */
export const GOOGLE_CLOUD = {
  credly: "https://www.credly.com/users/lakshitsinghsaini",
  labsCompleted: "300+",
  summary:
    "Completed over 300 hands-on Google Cloud labs and earned multiple skill badges — a sustained, self-driven practice streak rather than a one-off certificate.",
};
