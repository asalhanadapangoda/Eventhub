import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Program from '../models/Program.js';
import Workshop from '../models/Workshop.js';
import ProgramRegistration from '../models/ProgramRegistration.js';
import VisitRequest from '../models/VisitRequest.js';
import ContactMessage from '../models/ContactMessage.js';
import Notification from '../models/Notification.js';

dotenv.config();

export const seedData = async () => {
  try {
    console.log('[Seeder] Initializing database seeding for TRACE Sri Lanka...');

    // Clear existing collections
    await User.deleteMany();
    await Program.deleteMany();
    await Workshop.deleteMany();
    await ProgramRegistration.deleteMany();
    await VisitRequest.deleteMany();
    await ContactMessage.deleteMany();
    await Notification.deleteMany();

    // 1. Create Admin and Participant Users
    const adminUser = await User.create({
      name: 'Dilshan Perera',
      email: 'admin@trace.lk',
      password: 'admin123',
      role: 'admin',
      phone: '+94 70 151 0444',
      organization: 'TRACE Expert City Secretariat',
      bio: 'Head of Programs & Incubation at TRACE Sri Lanka, Bay 05 Maradana.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });

    const participantUser = await User.create({
      name: 'Kavindu Senanayake',
      email: 'kavindu@eng.mrt.ac.lk',
      password: 'user123',
      role: 'participant',
      phone: '+94 77 123 4567',
      organization: 'University of Moratuwa - Electronic & Telecom Eng',
      bio: 'Computer vision and IoT robotics researcher aiming to build deep-tech hardware startups.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    });

    const participantUser2 = await User.create({
      name: 'Nimna Jayawardena',
      email: 'nimna@heliostech.lk',
      password: 'user123',
      role: 'participant',
      phone: '+94 71 987 6543',
      organization: 'Helios AgriTech Solutions',
      bio: 'AgriTech IoT founder with pre-seed prototype seeking institutional mentorship.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    });

    console.log('[Seeder] Users created (Admin: admin@trace.lk / admin123, Participant: kavindu@eng.mrt.ac.lk / user123)');

    // 2. Create the TWO Main Programs
    const program1 = await Program.create({
      programId: 'program-01',
      title: 'Innovation & Design Thinking Masterclass',
      slug: 'program-01',
      badge: 'PROGRAM 01',
      icon: 'brain',
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
      duration: '1 Month',
      fee: 'LKR 15,000 per month',
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
        'Innovation Mindset & Vision Building',
        'Design Thinking',
        'Rapid Prototyping',
        'Idea Pitching & Feedback',
      ],
      coordinator: {
        name: 'Dilshan Perera',
        email: 'projects@trace.lk',
        title: 'Head of Programs & Incubation',
        phone: '+94 70 151 0444',
      },
      status: 'Active',
      featured: true,
      enrollmentOpen: true,
      totalSeats: 45,
      cohort: 'Cohort 12 (Active Sprint)',
    });

    const program2 = await Program.create({
      programId: 'program-02',
      title: 'Pre-Incubation Program on Startup Innovation',
      slug: 'program-02',
      badge: 'PROGRAM 02',
      icon: 'rocket',
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
      duration: '3 Months',
      fee: 'LKR 5,000 Registration Fee + LKR 15,000 per month',
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
        'Ideation & Problem Discovery',
        'Design Thinking & Business Model Canvas',
        'Proof of Concept & Rapid Prototyping',
        'Go-To-Market Strategy',
        'Pitch Deck Development & Investment Readiness',
      ],
      coordinator: {
        name: 'Dilshan Perera',
        email: 'projects@trace.lk',
        title: 'Head of Programs & Incubation',
        phone: '+94 70 151 0444',
      },
      status: 'Active',
      featured: true,
      enrollmentOpen: true,
      totalSeats: 30,
      cohort: 'Cohort 08 (Execution Phase)',
    });

    console.log('[Seeder] Programs created (Program 01 & Program 02)');

    // 3. Create Workshops connected to their parent programs
    // PROGRAM 01 WORKSHOPS
    await Workshop.create([
      {
        title: 'Design Thinking & Grand Challenges',
        slug: 'design-thinking-and-grand-challenges',
        description:
          'Learn the full user interview framework to identify underserved engagement trends in emerging market and deep-tech sectors. Real-world case studies from Sri Lankan healthcare and agricultural automation.',
        coverImage:
          'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
        programId: program1._id,
        programSlug: program1.slug,
        programTitle: program1.title,
        date: 'Saturday, May 24, 2025',
        startTime: '09:30 AM',
        endTime: '12:30 PM',
        venue: 'TRACE Auditorium A, Bay 05, Maradana',
        isOnline: false,
        meetingLink: '',
        speakerName: 'Eng. Dimuthu Perera',
        speakerDescription:
          'Senior Innovation Architect at TRACE Studio with 14+ years in design thinking systems.',
        speakerAvatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
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
        rsvps: 45,
      },
      {
        title: 'User Empathy & Problem Validation Sprint',
        slug: 'user-empathy-and-problem-validation',
        description:
          'Hands-on field synthesis workshop. Translate live feedback from industry partners into structured customer journey maps and validation metrics.',
        coverImage:
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        programId: program1._id,
        programSlug: program1.slug,
        programTitle: program1.title,
        date: 'Saturday, May 31, 2025',
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        venue: 'Maker Space Studio 2, TRACE Expert City',
        isOnline: false,
        meetingLink: '',
        speakerName: 'Tharushi Perera',
        speakerDescription:
          'Lead UX Researcher and Product Strategist with experience scaling enterprise Fintech squads.',
        speakerAvatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
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
        rsvps: 38,
      },
      {
        title: 'Idea Pitching & Storytelling Masterclass',
        slug: 'idea-pitching-and-storytelling',
        description:
          'Interactive pitching clinic. Master narrative arcs, concise 3-minute executive summaries, and slide composition for national innovation showcases.',
        coverImage:
          'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
        programId: program1._id,
        programSlug: program1.slug,
        programTitle: program1.title,
        date: 'Saturday, June 07, 2025',
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        venue: 'Online Virtual Studio (Google Meet)',
        isOnline: true,
        meetingLink: 'https://meet.google.com/trc-dt-masterclass',
        speakerName: 'Dilshan Perera',
        speakerDescription:
          'Head of Programs & Incubation at TRACE Sri Lanka.',
        speakerAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
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
        rsvps: 42,
      },
    ]);

    // PROGRAM 02 WORKSHOPS
    await Workshop.create([
      {
        title: 'Rapid Prototyping & Proof of Concept (PoC)',
        slug: 'rapid-prototyping-and-proof-of-concept',
        description:
          'Move from wireframe or schematic to physical functional prototype with early debugging tools, SLA 3D printing, and bench testing in TRACE Hardware Labs.',
        coverImage:
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        programId: program2._id,
        programSlug: program2.slug,
        programTitle: program2.title,
        date: 'Wednesday, May 28, 2025',
        startTime: '10:00 AM',
        endTime: '01:30 PM',
        venue: 'Robotics & Sensor Lab, Bay 05, Maradana',
        isOnline: false,
        meetingLink: '',
        speakerName: 'Dr. Anura Fernando',
        speakerDescription:
          'Director of Hardware Engineering at TRACE Labs, specializing in embedded IoT sensors and mechatronics.',
        speakerAvatar:
          'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
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
        rsvps: 28,
      },
      {
        title: 'Go-To-Market (GTM) Strategy & Unit Economics',
        slug: 'go-to-market-gtm-strategy-unit-economics',
        description:
          'Solve the customer profitability equation for early-stage B2B ventures and formulate initial sales manipulation strategies for local and international markets.',
        coverImage:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        programId: program2._id,
        programSlug: program2.slug,
        programTitle: program2.title,
        date: 'Monday, June 02, 2025',
        startTime: '05:30 PM',
        endTime: '08:00 PM',
        venue: 'Executive Boardroom, TRACE Expert City',
        isOnline: false,
        meetingLink: '',
        speakerName: 'Kasthula Jayasuriya',
        speakerDescription:
          'Principal Partner at Colombo Venture Partners and Angel Investor.',
        speakerAvatar:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
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
        rsvps: 30,
      },
      {
        title: 'Pitch Deck Architecture & Investment Readiness',
        slug: 'pitch-deck-architecture-investment-readiness',
        description:
          'Structure 10-slide venture investor decks, prepare data rooms, and rehearse cap-table scenarios for institutional pre-seed and seed rounds.',
        coverImage:
          'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
        programId: program2._id,
        programSlug: program2.slug,
        programTitle: program2.title,
        date: 'Thursday, June 12, 2025',
        startTime: '04:00 PM',
        endTime: '07:00 PM',
        venue: 'TRACE Auditorium B, Bay 05, Maradana',
        isOnline: false,
        meetingLink: '',
        speakerName: 'Mano Sekaram',
        speakerDescription:
          'Founding Member of TRACE Sri Lanka, Tech Pioneer, and Angel Investor.',
        speakerAvatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
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
        rsvps: 27,
      },
    ]);

    console.log('[Seeder] Workshops created for both programs');

    // 4. Create Program Registrations (enrolling participant in Program 01)
    await ProgramRegistration.create({
      referenceNumber: 'REG-TRC-2025-0101',
      userId: participantUser._id,
      programId: program1._id,
      programSlug: program1.slug,
      programTitle: program1.title,
      fullName: participantUser.name,
      email: participantUser.email,
      phoneNumber: participantUser.phone,
      organization: participantUser.organization,
      additionalInformation:
        'Enrolled in Cohort 12 to commercialize robotics and computer vision research.',
      status: 'Active',
      reviewedBy: 'Dilshan Perera (Head of Admissions)',
      reviewedAt: new Date(),
    });

    await ProgramRegistration.create({
      referenceNumber: 'REG-TRC-2025-0201',
      userId: participantUser2._id,
      programId: program2._id,
      programSlug: program2.slug,
      programTitle: program2.title,
      fullName: participantUser2.name,
      email: participantUser2.email,
      phoneNumber: participantUser2.phone,
      organization: participantUser2.organization,
      additionalInformation:
        'Agritech seed prototype looking for Bay 05 incubation and sensor testing.',
      status: 'Active',
      reviewedBy: 'Dilshan Perera (Head of Admissions)',
      reviewedAt: new Date(),
    });

    console.log('[Seeder] Program Registrations seeded (automatically granting workshop access)');

    // 5. Create Sample Industry Visit Requests
    await VisitRequest.create([
      {
        referenceNumber: 'VIS-TRC-801',
        userId: participantUser._id,
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
      },
      {
        referenceNumber: 'VIS-TRC-802',
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
      },
      {
        referenceNumber: 'VIS-TRC-803',
        organizationName: 'Brandix i3 Technology & Digital R&D',
        organizationType: 'Corporate Enterprise',
        contactPerson: 'Menaka Jayawardena',
        email: 'menaka.j@brandix.com',
        phone: '+94 76 444 3322',
        numberOfParticipants: 18,
        participantAgeGroup: 'Professionals / Researchers (25+)',
        preferredVisitDate: '2025-07-04',
        preferredTime: '02:00 PM - 05:00 PM',
        visitPurpose:
          'Explore potential enterprise pilot partnerships with TRACE Pre-Incubation startup cohorts.',
        areasOfInterest: [
          'Incubation Studios',
          'TRACE Auditorium & History',
        ],
        additionalRequirements: 'Private boardroom for executive discussion with founders.',
        status: 'Approved',
        allocatedHost: 'Dilshan Perera (Head of Incubation)',
      },
    ]);

    console.log('[Seeder] Industry Visit Requests seeded');

    // 6. Create Contact Messages
    await ContactMessage.create([
      {
        name: 'Dr. Senaka Rajapaksha',
        email: 'senaka.r@res.cmb.ac.lk',
        subject: 'Faculty Research Collaboration Inquiry',
        programOfInterest: 'Innovation & Design Thinking Masterclass',
        message:
          'We have 6 postgraduate biomedical researchers seeking to participate in your upcoming Innovation & Design Thinking Masterclass to prototype diagnostic sensors.',
        status: 'Unread',
      },
      {
        name: 'Amila Dharmasiri',
        email: 'amila@synapse.lk',
        subject: 'Bay 05 Hardware Lab Access for Seed Startup',
        programOfInterest: 'Pre-Incubation Program on Startup Innovation',
        message:
          'Our team has built an IoT smart grid telemetry device and we would like to know the application deadline for Cohort 08 pre-incubation and hardware lab bench usage.',
        status: 'Replied',
        replyNotes: 'Replied with syllabus and invited for walk-in tour at Bay 05.',
      },
    ]);

    // 7. Notifications (No demo notifications - real notifications only)
    console.log('[Seeder] Notifications and Contact Messages seeded successfully!');
    return true;
  } catch (error) {
    console.error('[Seeder Error]:', error);
    return false;
  }
};

// If run directly from CLI
if (process.argv[1]?.includes('seeder.js')) {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trace_sri_lanka';
  mongoose
    .connect(mongoURI)
    .then(async () => {
      console.log('Connected to MongoDB. Running seeder...');
      await seedData();
      console.log('Seeding complete. Exiting...');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeder connection error:', err);
      process.exit(1);
    });
}

