/** Legal copy; review with the owner before publication, especially after
 * changes to hosting, external services or data handling. */

export type LegalSection = {
  heading: string;
  body?: string[];
  list?: string[];
};

export type LegalDoc = {
  id: string;
  slug: string;
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

const UPDATED = "3 November 2026";
const PRIVACY_UPDATED = "3 November 2026";

const IDENTITY = {
  name: "Lakshit Singh Saini",
  mark: "Lakshit",
  role: "Computer Science student & developer",
  country: "India",
  email: "lakshitsinghsaini@gmail.com",
};

export const LEGAL_DOCS: LegalDoc[] = [
  /* ------------------------------------------------------------------ PRIVACY */
  {
    id: "privacy",
    slug: "privacy",
    eyebrow: "legal",
    title: "Privacy Policy",
    updated: PRIVACY_UPDATED,
    intro:
      "This is a personal portfolio website. It was built to collect as little as possible — in practice, it collects nothing on its own. This page explains exactly what that means and what happens in the one situation where you might share information with me.",
    sections: [
      {
        heading: "1. Who I am",
        body: [
          `This website is operated by me, ${IDENTITY.name} (also known by my personal mark, ${IDENTITY.mark}), an individual based in ${IDENTITY.country}.`,
          "It is a personal portfolio, not a registered company, firm or commercial service. There is no business entity behind it — just me showing my work.",
          `If you need to reach me about anything on this page, email ${IDENTITY.email}.`,
        ],
      },
      {
        heading: "2. The short version",
        body: ["This website does not run any of the following:"],
        list: [
          "Accounts or sign-ups",
          "First-party cookies",
          "Analytics or usage tracking",
          "Advertising or ad networks",
          "Tracking pixels or fingerprinting",
          "Mailing lists or newsletters",
          "Any sale or sharing of data",
        ],
      },
      {
        heading: "3. What this website does not collect",
        body: [
          "The site has no contact backend or database. The contact form prepares a message in your email app; it does not send or store a submission on this site. You can also copy the prepared message. Your email provider handles the message if you choose to send it.",
          "The only thing saved on your device is your theme choice (light or dark), kept in your browser's localStorage. It contains no identifier, never leaves your device, and is never transmitted anywhere. Clearing your browser data removes it.",
        ],
      },
      {
        heading: "4. If you choose to email me",
        body: [
          "The only way I can receive your personal data is if you decide to email me. That choice is entirely yours — the site never sends anything on your behalf.",
          "When you do, I receive whatever you include in that message (typically your name, your email address and your message), delivered through my email provider. I use it only to read your message and reply to you.",
          "I do not sell, rent or share it with anyone for marketing. I do not add you to a mailing list. If you later ask me to delete our email thread, I will.",
        ],
      },
      {
        heading: "5. Third-party services involved",
        body: [
          "Fonts — your browser requests typefaces from Google Fonts. Google receives the technical information normally sent with those requests; its own privacy practices apply.",
          "Hosting — the site is served by a static hosting provider. Providers of this kind keep standard technical server logs (see the next section) for security and abuse prevention.",
          "GitHub and project previews — your browser may request public profile data from the GitHub API and project preview images from GitHub. The contribution graph uses github-contributions-api.jogruber.de. These providers receive ordinary request information such as your IP address, and their own privacy practices apply.",
          "Email — if you contact me, your message passes through my email provider and is handled under that provider's own privacy policy.",
        ],
      },
      {
        heading: "6. Server logs",
        body: [
          "Like almost every website on the internet, the hosting provider may automatically record technical details — such as your IP address, browser type and the time of the request — to keep the service secure and prevent abuse.",
          "Log retention and access depend on the hosting provider and its configuration.",
        ],
      },
      {
        heading: "7. How information is protected",
        body: [
          "The site is a set of static files with no account or contact database. Use HTTPS when available; the hosting provider controls the transport and server configuration.",
        ],
      },
      {
        heading: "8. Your rights (India)",
        body: [
          "Under India's Digital Personal Data Protection Act, 2023 (the DPDP Act), you have rights over your personal data — including the right to access it, have it corrected or erased, withdraw consent, nominate someone to exercise your rights on your behalf, and raise a grievance.",
          "Because this website does not collect personal data, there is normally nothing to exercise those rights over. If you have emailed me and want your messages corrected or deleted, write to me and I will take care of it, normally within 30 days.",
        ],
      },
      {
        heading: "9. Children",
        body: [
          "This is a professional portfolio and is not directed at children under 18. I do not knowingly collect any data from children.",
        ],
      },
      {
        heading: "10. Transfers outside India",
        body: [
          "The site and its third-party services may use servers outside India. Ordinary requests can include technical information such as your IP address; the relevant providers handle that information under their own policies.",
        ],
      },
      {
        heading: "11. Changes to this policy",
        body: [
          "If data handling changes — for example by adding a contact backend, newsletter or analytics — this page should be reviewed and updated before the change goes live.",
        ],
      },
      {
        heading: "12. Contact",
        body: [
          `Questions about privacy: ${IDENTITY.email}`,
          "This page is plain-language information about how this website works. It is not legal advice.",
        ],
      },
    ],
  },

  /* -------------------------------------------------------------------- TERMS */
  {
    id: "terms",
    slug: "terms",
    eyebrow: "legal",
    title: "Terms & Conditions",
    updated: UPDATED,
    intro:
      "These terms apply to your use of this website. They are deliberately short, because the site is a personal portfolio and nothing is bought, sold or subscribed to here.",
    sections: [
      {
        heading: "1. Using this site",
        body: [
          "By browsing this website you accept these terms. If you do not agree with them, please stop using the site.",
        ],
      },
      {
        heading: "2. What this website is",
        body: [
          "This is a personal portfolio belonging to Lakshit Singh Saini. Its only purpose is to show my projects, skills and contact details.",
          "The site is informational. It has no accounts, no paid features, no subscriptions and no payment processing. Nothing can be purchased through it.",
        ],
      },
      {
        heading: "3. Ownership of content",
        body: [
          "The text, layout, visuals and source code of this website are © 2026 Lakshit Singh Saini. All rights reserved.",
          "The project names SaBuddy, Veylo, Pustakalaya, FacilityFix and Sortify refer to my own projects.",
          "You are welcome to view the site and share links to it. Please do not copy it wholesale, republish it, or present it as your own work.",
        ],
      },
      {
        heading: "4. Source code on GitHub",
        body: [
          "Where I link to source code, that code is governed by the licence stated inside the relevant repository. If a repository states no licence, all rights are reserved and you may not reuse that code without my written permission.",
        ],
      },
      {
        heading: "5. Project information",
        body: [
          "Status labels such as \u201cIn Development\u201d or \u201cReady\u201d describe the project at the time of publishing and may change at any time.",
          "Project descriptions are intentionally high-level. They are not specifications, promises or commitments to release anything, add any feature, or maintain availability.",
        ],
      },
      {
        heading: "6. External links",
        body: [
          "This site links to third-party services — including GitHub, LinkedIn, Instagram, X and Google Drive — for my profiles, repositories and résumé folder.",
          "I do not control those services and do not endorse everything on them. Your use of them is governed by their own terms and privacy policies, not these terms.",
        ],
      },
      {
        heading: "7. No professional advice",
        body: [
          "The content here is general information about me and my work. It is not professional, technical, legal, financial or career advice, and it should not be relied on as such.",
        ],
      },
      {
        heading: "8. Availability and accuracy",
        body: [
          "The site is provided \u201cas is\u201d and \u201cas available\u201d, without warranties of any kind. I try to keep it accurate and online, but I make no promise that it will always be available, uninterrupted or error-free, and I may change or remove content at any time without notice.",
        ],
      },
      {
        heading: "9. Limitation of liability",
        body: [
          "To the maximum extent permitted by law, I am not liable for any loss or damage arising from your use of, or inability to use, this website or anything linked from it.",
        ],
      },
      {
        heading: "10. Trademarks",
        body: [
          "Names such as GitHub, LinkedIn, Instagram, X, Google, Google Fonts, Android, Kotlin, React and Supabase belong to their respective owners. They are used only to identify the technologies and services I work with, and their use here implies no affiliation, sponsorship or endorsement.",
        ],
      },
      {
        heading: "11. Changes to these terms",
        body: [
          "I may update these terms from time to time. The date at the top shows when they were last revised, and continuing to use the site after a change means you accept the updated terms.",
        ],
      },
      {
        heading: "12. Governing law",
        body: [
          "These terms are governed by the laws of India. Any dispute connected with this website is subject to the exclusive jurisdiction of the courts of competent jurisdiction in India.",
        ],
      },
      {
        heading: "13. Contact",
        body: [`Questions about these terms: ${IDENTITY.email}`],
      },
    ],
  },

  /* ------------------------------------------------------------------ COOKIES */
  {
    id: "cookies",
    slug: "cookies",
    eyebrow: "legal",
    title: "Cookie Policy",
    updated: PRIVACY_UPDATED,
    intro:
      "The site code does not set first-party cookies. It saves a theme preference locally and connects to third-party services as described below.",
    sections: [
      {
        heading: "1. What cookies are",
        body: [
          "Cookies are small files a website stores in your browser, usually to remember a login, a preference or a visit. Sites that run analytics, advertising or logins typically set them.",
        ],
      },
      {
        heading: "2. What this website sets",
        body: ["The site code does not set first-party cookies or use the following:"],
        list: [
          "First-party cookies",
          "Session storage",
          "Tracking pixels",
          "Analytics or measurement tools",
          "Advertising or ad networks",
          "Session or device fingerprinting",
        ],
      },
      {
        heading: "3. The one thing stored on your device",
        body: [
          "If you switch between the light and dark themes, your choice is saved in your browser's localStorage under a single key, so the site remembers it next time.",
          "This functional preference holds no identifier, is not sent by the site to a server, and disappears when you clear your browser's site data.",
        ],
      },
      {
        heading: "4. Why there is no consent banner",
        body: [
          "The site has no cookie banner. Its code uses localStorage for the theme preference and does not set first-party cookies; third-party services and hosting have their own practices.",
        ],
      },
      {
        heading: "5. Google Fonts and the contribution graph",
        body: [
          "The typefaces are requested from Google Fonts. The provider receives ordinary browser request information and its own policies apply.",
          "The GitHub API, GitHub project preview images, and the contribution graph API (github-contributions-api.jogruber.de) are third-party services. Their cookie and privacy practices are outside this site's control.",
        ],
      },
      {
        heading: "6. Controlling cookies in general",
        body: [
          "Most browsers let you block or delete cookies and site data. Blocking third-party requests can affect fonts, previews, or live GitHub data; clearing site data also removes your theme preference.",
        ],
      },
      {
        heading: "7. If this ever changes",
        body: [
          "If device storage or third-party services change, this page should be reviewed and updated.",
        ],
      },
      {
        heading: "8. Contact",
        body: [`Questions about cookies: ${IDENTITY.email}`],
      },
    ],
  },

  /* ------------------------------------------------------------------ REFUNDS */
  {
    id: "refunds",
    slug: "refunds",
    eyebrow: "legal",
    title: "Refund Policy",
    updated: UPDATED,
    intro:
      "This page exists for clarity rather than necessity: this website does not sell anything, so there is nothing to refund.",
    sections: [
      {
        heading: "1. Nothing is sold here",
        body: [
          "This is a personal portfolio. It offers no products, services, subscriptions, downloads for sale, donations or paid memberships, and it is not connected to any payment processor or gateway.",
          "No transaction of any kind can take place through this website.",
        ],
      },
      {
        heading: "2. Refunds",
        body: [
          "Because no payments are accepted, no refunds apply. There are no fees, charges or recurring payments that could be returned.",
        ],
      },
      {
        heading: "3. If that changes",
        body: [
          "If I ever offer paid work, products or services, they will be governed by a separate written agreement or updated terms, which will describe pricing, cancellation and refunds — including any statutory rights you may have as a consumer in India. This page will be updated at the same time.",
        ],
      },
      {
        heading: "4. Contact",
        body: [`Questions about billing or refunds: ${IDENTITY.email}`],
      },
    ],
  },
];
