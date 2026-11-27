export const DEFAULT_PROGRAMS = [
  {
    programId: 'program-01',
    slug: 'program-01',
    badge: 'PROGRAM 01',
    title: 'Innovation & Design Thinking Masterclass',
    shortDescription:
      'Design thinking for innovation, 12 steps from ideation to launching real world challenges.',
    description:
      'The Innovation & Design Thinking Masterclass is TRACE Sri Lanka’s flagship academy curriculum designed for engineers, innovators, product designers, and future founders. Grounded in TRACE Expert City’s high-tech industrial cluster at Bay 07 Maradana, this intensive masterclass equips participants with systemic empathy, ideation frameworks, rapid prototyping, and venture-grade pitch readiness.',
    duration: '1 Month',
    fee: 'LKR 15,000 per month',
    cohort: 'Admissions Open',
    highlights: [
      'Innovation Mindset & Vision Building',
      'Design Thinking',
      'Rapid Prototyping',
      'Idea Pitching & Feedback',
    ],
    activities: [
      'Week 1: Empathy Mapping & Problem Discovery Sprint',
      'Week 2: Ideation, Solution Trees & Crazy Eights',
      'Week 3: Rapid Prototyping & Maker Space Bench Testing',
      'Week 4: Demo Day Showcase & Executive Jury Pitch',
    ],
    targetAudience: [
      'Engineering, Computer Science & Design Undergraduates',
      'Early-stage tech founders and innovation leads',
      'Corporate R&D and product team members',
      'Ambitious researchers seeking commercial translation',
    ],
    benefits: [
      'Official TRACE Sri Lanka Certificate of Excellence',
      'Direct access to TRACE Bay 07 Maker Space & Prototyping Labs',
      '1-on-1 mentorship sessions with veteran industry architects',
      'Automatic entry to TRACE Pre-Incubation shortlisting',
    ],
    coordinator: {
      name: 'Ms. Neranjana Rashmi',
      email: 'projects@trace.lk',
      title: 'Executive - Project Management',
    },
    workshops: [],
  },
  {
    programId: 'program-02',
    slug: 'program-02',
    badge: 'PROGRAM 02',
    title: 'Pre-Incubation Program on Startup Innovation',
    shortDescription:
      'Comprehensive venture formation, seed validation, unit economics, and investment readiness.',
    description:
      'TRACE Pre-Incubation is Sri Lanka’s premier seed-stage pipeline for deep-tech, IoT, hardware, and high-value software startups. Located in Maradana’s historic TRACE Expert City, this 3-month cohort sprint transforms early prototypes and academic research into commercially viable ventures backed by Sri Lanka’s top technology leaders, enterprise clients, and venture capitalists.',
    duration: '3 Months',
    fee: 'LKR 5,000 Registration Fee + LKR 15,000 per month',
    cohort: 'Admissions Open',
    highlights: [
      'Ideation & Problem Discovery',
      'Design Thinking & Business Model Canvas',
      'Proof of Concept & Rapid Prototyping',
      'Go-To-Market Strategy',
      'Pitch Deck Development & Investment Readiness',
    ],
    activities: [
      'Month 1: Venture Formation Basics & Founder Journey Sprints',
      'Month 2: GTM Strategy, Unit Economics & Customer Discovery',
      'Month 3: Pitch Deck Architecture, Demo Day & Seed Round Roadshow',
    ],
    targetAudience: [
      'Hardware, IoT, AI, and Software Startup Founders with working PoCs',
      'University spin-off research teams seeking commercialization',
      'Post-hackathon winning squads ready for company formation',
    ],
    benefits: [
      'Complimentary dedicated co-working space at TRACE Expert City Bay 07',
      'Direct fast-track pitching to TRACE Angel Network & seed funds',
      'Legal, intellectual property (IP), and patent advisory',
      'Direct pilot opportunities with 30+ Tech Cluster resident giants',
    ],
    coordinator: {
      name: 'Ms. Neranjana Rashmi',
      email: 'projects@trace.lk',
      title: 'Executive - Project Management',
    },
    workshops: [],
  },
];

export const getDefaultProgramBySlug = (slug) =>
  DEFAULT_PROGRAMS.find((p) => p.slug === slug || p.programId === slug) || null;

