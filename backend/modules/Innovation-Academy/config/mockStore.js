import bcrypt from 'bcryptjs';

// Pre-hashed passwords for quick in-memory testing
const adminHashedPassword = bcrypt.hashSync('admin123', 10);
const userHashedPassword = bcrypt.hashSync('user123', 10);

class MockStore {
  constructor() {
    this.reset();
  }

  reset() {
    // 1. Users
    this.users = [
      {
        _id: '664f10000000000000000001',
        id: '664f10000000000000000001',
        name: 'Dilshan Perera',
        email: 'admin@trace.lk',
        password: adminHashedPassword,
        role: 'admin',
        phone: '+94 70 151 0444',
        organization: 'TRACE Expert City Secretariat',
        bio: 'Head of Programs & Incubation at TRACE Sri Lanka, Bay 05 Maradana.',
        avatar: '',
        createdAt: new Date(),
      },
      {
        _id: '664f10000000000000000002',
        id: '664f10000000000000000002',
        name: 'Kavindu Senanayake',
        email: 'kavindu@eng.mrt.ac.lk',
        password: userHashedPassword,
        role: 'participant',
        phone: '+94 77 123 4567',
        organization: 'University of Moratuwa - Electronic & Telecom Eng',
        bio: 'Computer vision and IoT robotics researcher aiming to build deep-tech hardware startups.',
        avatar: '',
        createdAt: new Date(),
      },
      {
        _id: '664f10000000000000000003',
        id: '664f10000000000000000003',
        name: 'Nimna Jayawardena',
        email: 'nimna@heliostech.lk',
        password: userHashedPassword,
        role: 'participant',
        phone: '+94 71 987 6543',
        organization: 'Helios AgriTech Solutions',
        bio: 'AgriTech IoT founder with pre-seed prototype seeking institutional mentorship.',
        avatar: '',
        createdAt: new Date(),
      },
    ];

    // 2. The TWO Flagship Programs
    this.programs = [
      {
        _id: '664f20000000000000000001',
        id: '664f20000000000000000001',
        programId: 'program-01',
        slug: 'program-01',
        badge: 'PROGRAM 01',
        title: 'Innovation & Design Thinking Masterclass',
        shortDescription:
          'Master human-centered innovation, 12 steps from ideation to launching solutions for real-world national challenges.',
        description:
          'The Innovation & Design Thinking Masterclass is TRACE Sri Lanka’s flagship academy curriculum designed for engineers, innovators, product designers, and future founders. Grounded in TRACE Expert City’s high-tech industrial cluster at Bay 05 Maradana, this intensive masterclass equips participants with systemic empathy, ideation frameworks, rapid prototyping, and venture-grade pitch readiness.',
        coverImage:
          'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
        objectives: [
          'Master user-centered empathy research and stakeholder interview frameworks',
          'Synthesize ambiguous real-world problems into focused opportunity briefs',
          'Execute rapid physical and digital prototyping sprints in Maker Labs',
          'Pitch ideas persuasively using venture storytelling and visual clarity',
        ],
        targetAudience: [
          'Engineering, Computer Science & Design Undergraduates',
          'Early-stage tech founders and innovation leads',
          'Corporate R&D and product team members',
          'Ambitious researchers seeking commercial translation',
        ],
        duration: '1 Month (4 Intensive Sprint Modules)',
        benefits: [
          'Official TRACE Sri Lanka Certificate of Excellence',
          'Direct access to TRACE Bay 05 Maker Space & Prototyping Labs',
          '1-on-1 mentorship sessions with veteran industry architects',
          'Automatic entry to TRACE Pre-Incubation shortlisting',
        ],
        activities: [
          'Week 1: Empathy Mapping & Problem Discovery Sprint',
          'Week 2: Ideation, Solution Trees & Crazy Eights',
          'Week 3: Rapid Prototyping & Maker Space Bench Testing',
          'Week 4: Demo Day Showcase & Executive Jury Pitch',
        ],
        learningOutcomes: [
          'Ability to validate market demand before building high-cost engineering solutions',
          'Proficiency in fast physical/digital mockups and iterative test cycles',
          'Confident articulation of value propositions to enterprise stakeholders',
        ],
        highlights: [
          'Design Thinking for Innovation',
          '12 Steps from Ideation to Launching Real World Challenges',
          'Design Sprints and Rapid Prototyping',
          'Idea Pitching and Presentation',
        ],
        coordinator: {
          name: 'Dilshan Perera',
          email: 'projects@trace.lk',
          title: 'Head of Programs & Incubation',
          phone: '+94 70 151 0444',
        },
        status: 'Active',
        cohort: 'Cohort 12 (Active Sprint)',
        totalSeats: 45,
        createdAt: new Date(),
      },
      {
        _id: '664f20000000000000000002',
        id: '664f20000000000000000002',
        programId: 'program-02',
        slug: 'program-02',
        badge: 'PROGRAM 02',
        title: 'Pre-Incubation Program on Startup Innovation',
        shortDescription:
          'Comprehensive venture formation, seed validation, unit economics, and investment readiness for tech startups.',
        description:
          'TRACE Pre-Incubation is Sri Lanka’s premier seed-stage pipeline for deep-tech, IoT, hardware, and high-value software startups. Located in Maradana’s historic TRACE Expert City, this 3-month cohort sprint transforms early prototypes and academic research into commercially viable ventures backed by Sri Lanka’s top technology leaders, enterprise clients, and venture capitalists.',
        coverImage:
          'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
        objectives: [
          'Structure corporate venture governance and founder equity agreements',
          'Validate unit economics, customer acquisition costs, and pricing models',
          'Construct production-grade proof of concepts and hardware prototypes',
          'Architect institutional pitch decks for angel networks and VC funds',
        ],
        targetAudience: [
          'Hardware, IoT, AI, and Software Startup Founders with working PoCs',
          'University spin-off research teams seeking commercialization',
          'Post-hackathon winning squads ready for company formation',
        ],
        duration: '3 Months (Cohort Track & Incubation Sprint)',
        benefits: [
          'Complimentary dedicated co-working space at TRACE Expert City Bay 05',
          'Direct fast-track pitching to TRACE Angel Network & seed funds',
          'Legal, intellectual property (IP), and patent advisory',
          'Direct pilot opportunities with 30+ Tech Cluster resident giants',
        ],
        activities: [
          'Month 1: Venture Formation Basics & Founder Journey Sprints',
          'Month 2: GTM Strategy, Unit Economics & Customer Discovery',
          'Month 3: Pitch Deck Architecture, Demo Day & Seed Round Roadshow',
        ],
        learningOutcomes: [
          'Incorporate and govern a high-growth tech startup',
          'Execute scalable B2B/B2C sales and distribution channels',
          'Present confidently before institutional technology investors',
        ],
        highlights: [
          'Venture Formation Basics & Pre-Incubation Lifecycle',
          'Innovation Mindset & Founder Journey',
          'Design Thinking & Business Model Canvas',
          'Proof of Concept (PoC) & Rapid Prototyping',
          'Go-To-Market (GTM) Strategy & Unit Economics',
          'Storytelling, Pitch Deck Architecture & Investment Readiness',
          'Final Showcase & Pitch Fest',
          'Pre-Incubation Endorsement & TRACE Affiliation Ceremony',
        ],
        coordinator: {
          name: 'Dilshan Perera',
          email: 'projects@trace.lk',
          title: 'Head of Programs & Incubation',
          phone: '+94 70 151 0444',
        },
        status: 'Active',
        cohort: 'Cohort 08 (Execution Phase)',
        totalSeats: 30,
        createdAt: new Date(),
      },
    ];

    // 3. Workshops connected to Parent Programs
    this.workshops = [
      // Program 01 Workshops
      {
        _id: '664f30000000000000000001',
        id: '664f30000000000000000001',
        title: 'Design Thinking & Grand Challenges',
        slug: 'design-thinking-and-grand-challenges',
        programId: '664f20000000000000000001',
        programSlug: 'program-01',
        programTitle: 'Innovation & Design Thinking Masterclass',
        description:
          'Learn the full user interview framework to identify underserved engagement trends in emerging market and deep-tech sectors. Real-world case studies from Sri Lankan healthcare and agricultural automation.',
        coverImage:
          'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
        date: 'Saturday, May 24, 2025',
        startTime: '09:30 AM',
        endTime: '12:30 PM',
        venue: 'TRACE Auditorium A, Bay 05, Maradana',
        isOnline: false,
        meetingLink: '',
        speakerName: 'Eng. Dimuthu Perera',
        speakerDescription:
          'Senior Innovation Architect at TRACE Studio with 14+ years in design thinking systems.',
        topicsCovered: [
          'User Empathy Field Techniques',
          'Root Cause Discovery & 5 Whys',
          'Stakeholder Ecosystem Mapping',
          'Human-Centered Problem Definition',
        ],
        learningOutcomes: [
          'Conduct non-biased user interviews',
          'Frame actionable problem statements for national challenges',
        ],
        additionalInstructions:
          'Please bring your laptop and notebook. Post-it notes and sprint stationery will be provided at Bay 05 registration desk.',
        status: 'Upcoming',
        capacity: 50,
        createdAt: new Date(),
      },
      {
        _id: '664f30000000000000000002',
        id: '664f30000000000000000002',
        title: 'User Empathy & Problem Validation Sprint',
        slug: 'user-empathy-and-problem-validation',
        programId: '664f20000000000000000001',
        programSlug: 'program-01',
        programTitle: 'Innovation & Design Thinking Masterclass',
        description:
          'Hands-on field synthesis workshop. Translate live feedback from industry partners into structured customer journey maps and validation matrices.',
        coverImage:
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        date: 'Saturday, May 31, 2025',
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        venue: 'Maker Space Studio 2, TRACE Expert City',
        isOnline: false,
        meetingLink: '',
        speakerName: 'Tharushi Perera',
        speakerDescription:
          'Lead UX Researcher and Product Strategist with experience scaling enterprise Fintech squads.',
        topicsCovered: [
          'Customer Journey Architecture',
          'Quantitative vs Qualitative Synthesis',
          'Value Proposition Testing Matrices',
        ],
        learningOutcomes: [
          'Identify genuine pain points versus false positives',
          'Build customer personas anchored in real market data',
        ],
        additionalInstructions:
          'Physical lab session. Coffee and refreshments served at 11:30 AM.',
        status: 'Upcoming',
        capacity: 45,
        createdAt: new Date(),
      },
      {
        _id: '664f30000000000000000003',
        id: '664f30000000000000000003',
        title: 'Idea Pitching & Storytelling Masterclass',
        slug: 'idea-pitching-and-storytelling',
        programId: '664f20000000000000000001',
        programSlug: 'program-01',
        programTitle: 'Innovation & Design Thinking Masterclass',
        description:
          'Interactive pitching clinic. Master narrative arcs, concise 3-minute executive summaries, and slide composition for national innovation showcases.',
        coverImage:
          'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
        date: 'Saturday, June 07, 2025',
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        venue: 'Online Virtual Studio (Google Meet)',
        isOnline: true,
        meetingLink: 'https://meet.google.com/trc-dt-masterclass',
        speakerName: 'Dilshan Perera',
        speakerDescription: 'Head of Programs & Incubation at TRACE Sri Lanka.',
        topicsCovered: [
          'The 3-Minute Elevator Pitch Formula',
          'Hook, Problem, Solution, Traction Sequence',
          'Handling tough Q&A from executive judges',
        ],
        learningOutcomes: [
          'Deliver high-conviction presentations with confidence',
          'Design clean, uncluttered visual pitch decks',
        ],
        additionalInstructions:
          'Virtual session. Click the "Join Workshop" button on your dashboard 10 minutes prior to session commencement.',
        status: 'Upcoming',
        capacity: 60,
        createdAt: new Date(),
      },
      // Program 02 Workshops
      {
        _id: '664f30000000000000000004',
        id: '664f30000000000000000004',
        title: 'Rapid Prototyping & Proof of Concept (PoC)',
        slug: 'rapid-prototyping-and-proof-of-concept',
        programId: '664f20000000000000000002',
        programSlug: 'program-02',
        programTitle: 'Pre-Incubation Program on Startup Innovation',
        description:
          'Move from wireframe or schematic to physical functional prototype with early debugging tools, SLA 3D printing, and bench testing in TRACE Hardware Labs.',
        coverImage:
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        date: 'Wednesday, May 28, 2025',
        startTime: '10:00 AM',
        endTime: '01:30 PM',
        venue: 'Robotics & Sensor Lab, Bay 05, Maradana',
        isOnline: false,
        meetingLink: '',
        speakerName: 'Dr. Anura Fernando',
        speakerDescription:
          'Director of Hardware Engineering at TRACE Labs, specializing in embedded IoT sensors and mechatronics.',
        topicsCovered: [
          'Microcontroller & Sensor Integration',
          'Rapid SLA 3D Printing & Enclosure Design',
          'Bench Voltage, Signal Analysis & Debugging',
        ],
        learningOutcomes: [
          'Construct a working MVP hardware prototype',
          'Validate functional component costs for BOM estimates',
        ],
        additionalInstructions:
          'Safety goggles provided at the entrance. Closed-toe shoes mandatory inside Bay 05 Sensor Lab.',
        status: 'Ongoing',
        capacity: 30,
        createdAt: new Date(),
      },
      {
        _id: '664f30000000000000000005',
        id: '664f30000000000000000005',
        title: 'Go-To-Market (GTM) Strategy & Unit Economics',
        slug: 'go-to-market-gtm-strategy-unit-economics',
        programId: '664f20000000000000000002',
        programSlug: 'program-02',
        programTitle: 'Pre-Incubation Program on Startup Innovation',
        description:
          'Solve the customer profitability equation for early-stage B2B ventures and formulate initial sales manipulation strategies for local and international markets.',
        coverImage:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        date: 'Monday, June 02, 2025',
        startTime: '05:30 PM',
        endTime: '08:00 PM',
        venue: 'Executive Boardroom, TRACE Expert City',
        isOnline: false,
        meetingLink: '',
        speakerName: 'Kasthula Jayasuriya',
        speakerDescription:
          'Principal Partner at Colombo Venture Partners and Angel Investor.',
        topicsCovered: [
          'Customer Acquisition Cost (CAC) vs Lifetime Value (LTV)',
          'B2B Enterprise Pilot Pricing & SLA Agreements',
          'Early Sales Funnels & Cold Outreach Strategy',
        ],
        learningOutcomes: [
          'Construct defensible financial models and unit margin sheets',
          'Close commercial letters of intent (LOI) with enterprise clients',
        ],
        additionalInstructions:
          'Bring your product unit economics spreadsheet for live peer breakdown and mentor critique.',
        status: 'Upcoming',
        capacity: 30,
        createdAt: new Date(),
      },
      {
        _id: '664f30000000000000000006',
        id: '664f30000000000000000006',
        title: 'Pitch Deck Architecture & Investment Readiness',
        slug: 'pitch-deck-architecture-investment-readiness',
        programId: '664f20000000000000000002',
        programSlug: 'program-02',
        programTitle: 'Pre-Incubation Program on Startup Innovation',
        description:
          'Structure 10-slide venture investor decks, prepare data rooms, and rehearse cap-table scenarios for institutional pre-seed and seed rounds.',
        coverImage:
          'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
        date: 'Thursday, June 12, 2025',
        startTime: '04:00 PM',
        endTime: '07:00 PM',
        venue: 'TRACE Auditorium B, Bay 05, Maradana',
        isOnline: false,
        meetingLink: '',
        speakerName: 'Mano Sekaram',
        speakerDescription:
          'Founding Member of TRACE Sri Lanka, Tech Pioneer, and Angel Investor.',
        topicsCovered: [
          'The 10 Canonical Slides of a Tech Seed Pitch',
          'Cap-Table Hygiene & SAFE / Convertible Notes',
          'Due Diligence Data Room Setup',
        ],
        learningOutcomes: [
          'Draft an investment-grade pitch deck',
          'Negotiate seed valuation terms with regional venture funds',
        ],
        additionalInstructions:
          'Physical presentation with mock VC panel feedback. Refreshments and networking dinner to follow.',
        status: 'Upcoming',
        capacity: 35,
        createdAt: new Date(),
      },
    ];

    // 4. Program Registrations
    this.programRegistrations = [
      {
        _id: '664f40000000000000000001',
        id: '664f40000000000000000001',
        referenceNumber: 'REG-TRC-2025-0101',
        userId: '664f10000000000000000002',
        programId: '664f20000000000000000001',
        programSlug: 'program-01',
        programTitle: 'Innovation & Design Thinking Masterclass',
        fullName: 'Kavindu Senanayake',
        email: 'kavindu@eng.mrt.ac.lk',
        phoneNumber: '+94 77 123 4567',
        organization: 'University of Moratuwa - Electronic & Telecom Eng',
        additionalInformation:
          'Enrolled in Cohort 12 to commercialize robotics and computer vision research.',
        status: 'Approved',
        createdAt: new Date(),
      },
      {
        _id: '664f40000000000000000002',
        id: '664f40000000000000000002',
        referenceNumber: 'REG-TRC-2025-0201',
        userId: '664f10000000000000000003',
        programId: '664f20000000000000000002',
        programSlug: 'program-02',
        programTitle: 'Pre-Incubation Program on Startup Innovation',
        fullName: 'Nimna Jayawardena',
        email: 'nimna@heliostech.lk',
        phoneNumber: '+94 71 987 6543',
        organization: 'Helios AgriTech Solutions',
        additionalInformation:
          'Agritech seed prototype looking for Bay 05 incubation and sensor testing.',
        status: 'Approved',
        createdAt: new Date(),
      },
    ];

    // 5. Industry Visit Requests
    this.visitRequests = [
      {
        _id: '664f50000000000000000001',
        id: '664f50000000000000000001',
        referenceNumber: 'VIS-TRC-801',
        userId: '664f10000000000000000002',
        organizationName: 'University of Moratuwa - IEEE Student Branch',
        organizationType: 'University / Faculty',
        contactPerson: 'Kavindu Senanayake',
        email: 'kavindu@eng.mrt.ac.lk',
        phone: '+94 77 123 4567',
        numberOfParticipants: 45,
        participantAgeGroup: 'Undergraduates (19-24)',
        preferredVisitDate: '2025-06-18',
        preferredTime: '10:00 AM - 01:00 PM',
        visitPurpose:
          'Expose electronics engineering undergraduates to TRACE Expert City technology companies, maker spaces, and startup founders.',
        areasOfInterest: [
          'Bay 05 Maker Space',
          'Robotics & Sensor Labs',
          'Incubation Studios',
          'TRACE Auditorium & History',
        ],
        additionalRequirements:
          'Requesting a 30-minute keynote by TRACE architects on high-value technology careers.',
        status: 'Confirmed',
        allocatedHost: 'Dilshan Perera & Bay 05 Secretariat',
        adminNotes: 'Confirmed for June 18th morning. Auditorium A reserved.',
        createdAt: new Date(),
      },
      {
        _id: '664f50000000000000000002',
        id: '664f50000000000000000002',
        referenceNumber: 'VIS-TRC-802',
        userId: null,
        organizationName: 'Ananda College ICT Society',
        organizationType: 'School / College',
        contactPerson: 'Sahan Wickramasinghe',
        email: 'ict.society@anandacollege.edu.lk',
        phone: '+94 71 555 8899',
        numberOfParticipants: 35,
        participantAgeGroup: 'School Students (14-18)',
        preferredVisitDate: '2025-06-25',
        preferredTime: '01:30 PM - 04:30 PM',
        visitPurpose:
          'School technological immersion tour to inspire high school innovators about computer vision, AI, and startup culture in Sri Lanka.',
        areasOfInterest: [
          'Bay 05 Maker Space',
          'Robotics & Sensor Labs',
          'TRACE Auditorium & History',
        ],
        additionalRequirements: 'School bus parking space inside Expert City premises.',
        status: 'Pending',
        allocatedHost: 'TRACE Expert City Secretariat',
        createdAt: new Date(),
      },
    ];

    // 6. Contact Messages
    this.contactMessages = [
      {
        _id: '664f60000000000000000001',
        id: '664f60000000000000000001',
        name: 'Dr. Senaka Rajapaksha',
        email: 'senaka.r@res.cmb.ac.lk',
        subject: 'Faculty Research Collaboration Inquiry',
        programOfInterest: 'Innovation & Design Thinking Masterclass (Cohort 12)',
        message:
          'We have 6 postgraduate biomedical researchers seeking to participate in your upcoming Innovation & Design Thinking Masterclass to prototype diagnostic sensors.',
        status: 'Unread',
        createdAt: new Date(),
      },
      {
        _id: '664f60000000000000000002',
        id: '664f60000000000000000002',
        name: 'Amila Dharmasiri',
        email: 'amila@synapse.lk',
        subject: 'Bay 05 Hardware Lab Access for Seed Startup',
        programOfInterest: 'Pre-Incubation Program on Startup Innovation (Cohort 08)',
        message:
          'Our team has built an IoT smart grid telemetry device and we would like to know the application deadline for Cohort 08 pre-incubation and hardware lab bench usage.',
        status: 'Replied',
        replyNotes: 'Replied with syllabus and invited for walk-in tour at Bay 05.',
        createdAt: new Date(),
      },
    ];

    // 7. Notifications (Empty by default - real notifications only)
    this.notifications = [];
  }
}

export const mockStore = new MockStore();

