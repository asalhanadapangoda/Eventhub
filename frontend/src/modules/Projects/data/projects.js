import expertCityImg from '../assets/expert-city.jpg';
import angelXImg from '../assets/angel-x.jpg';
import researchPlusImg from '../assets/research-plus.jpg';
import researchPlusVisionImg from '../assets/research-plus-vision.jpg';
import breadCenterImg from '../assets/bread-center.jpg';
import theoryToTradeImg from '../assets/theory-to-trade.jpg';
import unicornsImg from '../assets/unicorns.jpg';
import speakupImg from '../assets/speakup-sri-lanka.jpg';

export const projects = [
  {
    id: 'expert-city',
    slug: 'expert-city',
    name: 'Expert City',
    shortDescription: 'Technology and Innovation Park.',
    category: 'Innovation Park',
    statusLabel: 'Active Hub',
    eyebrow: 'TRACE Flagship • Technology & Innovation Park',
    image: expertCityImg,
    intro:
      'Sri Lanka’s premier technology and innovation park dedicated to catalyzing world-class R&D, enterprise collaboration, and high-impact digital ventures.',
    heroStats: [
      { icon: 'Building2', label: 'Location', value: 'Maradana, Colombo 10' },
      { icon: 'Layers', label: 'Footprint', value: '200,000+ Sq. Ft. Campus' },
      { icon: 'Cpu', label: 'Core Focus', value: 'Enterprise & Incubation' },
    ],
    about: {
      title: 'Physical & Intellectual Epicentre',
      paragraphs: [
        'Expert City serves as the physical and intellectual epicentre of TRACE Sri Lanka. Built within a revitalized heritage framework combined with modern corporate architecture, the park creates an environment where technological ingenuity thrives.',
        'By bringing together multinational tech leaders, agile scale-ups, premier academic institutions, and national policy architects, Expert City diminishes the friction between conceptual breakthrough and cross-border commercial realization.',
      ],
    },
    whatWeDo: [
      {
        icon: 'Building2',
        title: 'State-of-the-Art Infrastructure',
        description:
          'Collaborative open-plan floorplates, redundant power systems, low-latency fibre connectivity, and specialized hardware fabrication laboratories designed for agile engineering teams.',
      },
      {
        icon: 'Network',
        title: 'Ecosystem Clustering',
        description:
          'Deliberate proximity that places multinational engineering centres alongside high-growth startups, university fellows, and research cells to spark organic breakthroughs.',
      },
      {
        icon: 'Globe',
        title: 'IP & R&D Commercialization',
        description:
          'Facilitating applied research transformation through structured intellectual property guidance, regulatory sandboxing, and commercial spin-off support.',
      },
      {
        icon: 'Users',
        title: 'Global Technology Networking',
        description:
          'Hosting international innovation delegations, developer symposia, venture matchmaking summits, and hackathons connecting local talent to global markets.',
      },
    ],
    keyFeatures: [
      {
        icon: 'Microscope',
        title: 'High-Tech R&D Facilities',
        description:
          'Advanced hardware and software rapid-prototyping spaces, IoT test rigs, and collaborative engineering labs.',
      },
      {
        icon: 'Zap',
        title: '24/7 Enterprise Resiliency',
        description:
          'Tier-grade dual power redundancy, climate-controlled server environments, and continuous campus security.',
      },
      {
        icon: 'Users',
        title: 'Community & Hub Spaces',
        description:
          'High-capacity auditoriums, executive meeting suites, maker spaces, and landscaped outdoor collaboration zones.',
      },
      {
        icon: 'Handshake',
        title: 'Capital & Mentorship Access',
        description:
          'Direct institutional connections to venture partners, angel networks, and seasoned industry advisors.',
      },
    ],
    targetAudience: [
      {
        number: '01',
        title: 'Tech Exporters & Scaleups',
        description:
          'High-growth enterprise technology vendors seeking turnkey global connectivity, collaborative workspaces, and a prestigious innovation address.',
        tag: 'Global Scale',
      },
      {
        number: '02',
        title: 'Deep-Tech R&D Teams',
        description:
          'Pioneers developing machine learning, robotics, embedded microelectronics, and specialized hardware solutions.',
        tag: 'Engineering Edge',
      },
      {
        number: '03',
        title: 'Academic Researchers',
        description:
          'University faculty and fellows converting empirical research breakthroughs into market-validated commercial ventures.',
        tag: 'Commercialization',
      },
      {
        number: '04',
        title: 'Engineering Talent',
        description:
          'Software developers, designers, and systems architects thriving in a progressive workplace culture with continuous learning.',
        tag: 'Talent Pipeline',
      },
    ],
    impact: {
      title: 'Growing at Velocity',
      subtitle:
        'Continuous acceleration in high-value technology exports, international collaborations, and institutional venture growth.',
      metrics: [
        { value: '3,500+', label: 'Engineers & Researchers' },
        { value: '$150M+', label: 'Annual Tech Exports' },
      ],
      progressLabel: 'Park Occupancy',
      progressValue: 94,
    },
    cta: {
      title: 'Ready to innovate at Expert City?',
      description:
        'Schedule a campus walk-through or discuss ecosystem partnership opportunities with the TRACE Sri Lanka leadership team.',
      email: 'expertcity@tracesrilanka.org',
      learnMoreSummary:
        'Expert City offers flexible enterprise suites, co-working innovation bays, and dedicated lab modules at the heart of Colombo 10.',
      highlights: [
        'Turnkey enterprise floorplates and startup incubation pods',
        'On-site auditoriums, boardrooms, and event hosting spaces',
        'Direct linkage to TRACE Sri Lanka industry and university networks',
      ],
    },
  },
  {
    id: 'angel-x',
    slug: 'angel-x',
    name: 'Angel X',
    shortDescription: 'Investment Platform for Startups and Angel Investors.',
    category: 'Venture Capital',
    statusLabel: 'Active Platform',
    eyebrow: 'TRACE Venture Network • Capital & Angel Syndication',
    image: angelXImg,
    imageFit: 'contain',
    imageBg: '#242426',
    intro:
      'A curated early-stage investment platform bridging Sri Lanka’s most promising founders with seasoned angel investors, diaspora capital, and institutional syndicates.',
    heroStats: [
      { icon: 'Handshake', label: 'Network', value: '80+ Angel Investors' },
      { icon: 'TrendingUp', label: 'Focus Stage', value: 'Pre-Seed & Seed' },
    ],
    about: {
      title: 'TRACE ANGEL X : Investment Forum',
      paragraphs: [
        'TRACE ANGEL X is an elite, private investment showcase connecting curated, investment ready startups with both a premier network of angel investors and corporate capital. In this investment forum, TRACE actively co invests alongside angel networks, offering direct funding and equity partnerships to scalable ventures.',
        'By bypassing general tech hype, the program serves as a transactional gateway where founders secure the strategic capital and institutional backing needed to accelerate growth.',
      ],
      applyNow: {
        label: 'Apply Now',
        // Paste your Google Drive link below when ready
        url: '',
      },
    },
    spotlight: {
      eyebrow: 'Executive Insight',
      title: 'The Investment Opportunity Every Startup Should Know About',
      description:
        'What is TRACE Angel X, and why should entrepreneurs apply for the TRACE Angel X investment round. Let’s hear it from TRACE Executive Director Mr. Heminda Jayaweera.',
      speaker: 'Mr. Heminda Jayaweera',
      role: 'Executive Director, TRACE Sri Lanka',
    },
    whatWeDo: [
      {
        icon: 'Target',
        title: 'Curated Deal Flow Sourcing',
        description:
          'Screening and preparing high-potential technology and innovation startups across Sri Lanka for investor-ready pitch showcases.',
      },
      {
        icon: 'Users',
        title: 'Angel Syndicate Formation',
        description:
          'Enabling local and diaspora angel investors to co-invest seamlessly through structured SPVs and pooled syndication models.',
      },
      {
        icon: 'BarChart3',
        title: 'Due Diligence & Valuation',
        description:
          'Providing standardized financial modeling, IP verification, and market validation memos to de-risk early-stage angel decisions.',
      },
      {
        icon: 'Rocket',
        title: 'Post-Investment Growth Support',
        description:
          'Connecting portfolio founders with advisory boards, regional expansion channels, and Series A institutional investors.',
      },
    ],
    keyFeatures: [
      {
        icon: 'ShieldCheck',
        title: 'Vetted Startup Pipeline',
        description:
          'Multi-stage technical and commercial screening ensuring investors review high-conviction opportunities.',
      },
      {
        icon: 'FileText',
        title: 'Standardized Term Sheets',
        description:
          'Founder-friendly, transparent investment instruments aligned with international venture benchmarks.',
      },
      {
        icon: 'Globe',
        title: 'Diaspora Capital Bridge',
        description:
          'Frictionless participation pathways for Sri Lankan professionals and investors worldwide.',
      },
      {
        icon: 'Lightbulb',
        title: 'Quarterly Pitch Summits',
        description:
          'Closed-door demo days and thematic sector briefings uniting founders and active capital allocators.',
      },
    ],
    targetAudience: [
      {
        number: '01',
        title: 'Early-Stage Founders',
        description:
          'Scalable tech startups with validated MVPs seeking their first institutional or angel capital round.',
        tag: 'Seed Capital',
      },
      {
        number: '02',
        title: 'Angel Investors',
        description:
          'High-net-worth individuals and senior executives looking to back vetted Sri Lankan innovation.',
        tag: 'Deal Access',
      },
      {
        number: '03',
        title: 'Global Diaspora',
        description:
          'International professionals eager to invest capital and expertise into Sri Lanka’s digital economy.',
        tag: 'Cross-Border',
      },
      {
        number: '04',
        title: 'Co-Investment Partners',
        description:
          'Family offices and early-stage funds seeking credible local co-investment syndicates.',
        tag: 'Syndication',
      },
    ],
    impact: {
      title: 'Catalyzing Venture Velocity',
      subtitle:
        'Expanding access to smart early-stage capital while building disciplined investor-founder partnerships.',
      metrics: [
        { value: '45+', label: 'Startups Pitched' },
        { value: '$4.2M+', label: 'Committed Syndicate Capital' },
      ],
      progressLabel: 'Cohort Follow-On Rate',
      progressValue: 78,
    },
    cta: {
      title: 'Join the Angel X Investment Network',
      description:
        'Whether you are a founder raising pre-seed capital or an investor seeking curated deal flow, connect with our venture desk.',
      email: 'angelx@tracesrilanka.org',
      learnMoreSummary:
        'Angel X runs quarterly investment cohorts and private investor briefings backed by TRACE Sri Lanka’s mentor guild.',
      highlights: [
        'Pitch readiness workshops and financial data-room coaching',
        'Quarterly syndicate demo days in Colombo and virtually',
        'Co-investment opportunities alongside experienced lead angels',
      ],
    },
  },
  {
    id: 'research-plus',
    slug: 'research-plus',
    name: 'Research Plus',
    shortDescription:
      'Research and Development Grant together with Leadership and Innovation Skills Development Program.',
    category: 'R&D & Leadership',
    statusLabel: 'Grant Open',
    eyebrow: 'Our Research and Development Fund • TRACE Research Plus',
    image: researchPlusImg,
    intro:
      'TRACE Research and Development Grant: Fuelling Ideas That Shape the Future — a flagship national initiative empowering innovators ready to turn applied research into real-world impact.',
    heroStats: [
      { icon: 'Wallet', label: 'Grant Funding', value: 'Up to LKR 500,000' },
      { icon: 'Compass', label: 'Monitoring', value: '3 – 6 Months Milestone' },
      { icon: 'TrendingUp', label: '2026 Target', value: 'Up to 30 Projects' },
    ],
    about: {
      title: 'The R&D Grant',
      paragraphs: [
        'The TRACE Research and Development (R&D) Grant is a flagship national initiative led by TRACE (Technologically Re-Awakening Culture of Excellence) to support applied research that addresses pressing challenges while strengthening Sri Lanka’s innovation ecosystem.',
        'The grant exists to bridge the gap between research and commercialization, encouraging bold, practical ideas and nurturing a culture of creativity, entrepreneurship, and collaboration. It is open to researchers, university teams, startups, and independent innovators who have progressed beyond the idea stage and are prepared to scale their solutions.',
        'Selected projects can receive up to LKR 500,000, along with structured milestone-based monitoring over three to six months. Beyond funding, winners gain access to mentorship, industry exposure, and direct connections to pre-seed investors, angel networks, and venture capital platforms—unlocking opportunities to transform research into scalable startups with national and global potential.',
      ],
      applyNow: {
        label: 'Apply Now',
        url: 'https://forms.gle/1DnjpNpBqCGBeEX47',
      },
    },
    spotlight: {
      eyebrow: 'Our Vision & Pledge • LKR 100 Million Fund by 2027',
      title: 'Empowering Researchers to Build Scalable Startups',
      description:
        '“To empower researchers in transforming their innovative ideas into scalable startups, driving economic growth and advancing the nation’s prosperity through cutting-edge solutions. Our goal is to establish a LKR 100 million fund by 2027 to support the nation’s researchers in achieving impactful, sustainable outcomes for the economy.”',
      secondaryNote:
        'As a non-profit organization, TRACE is committed to the betterment of our nation, demonstrated by our pledge of LKR 3 million out of a LKR 15 million initiative to foster economic and social progress. We seek your generous support to amplify our impact and drive transformative change for the country.',
      speaker: 'TRACE Sri Lanka',
      role: 'TRACE Research & Development Fund',
    },
    gallery: {
      eyebrow: 'Awards Ceremony & Gallery',
      title: 'Winners of the R&D Grant 2026',
      paragraphs: [
        'The initiative reached a major milestone with the final R&D Grant winners being awarded on 18th December in the presence of the TRACE Director Board and Board Members. The awards ceremony was further elevated by the participation of the Guest Speaker, Mr. Manju Gunawardane, Chief Executive Officer of the LOLC Group Innovation and Research, reinforcing the project’s strong industry relevance and national significance.',
        'In 2025, TRACE funded seven selected research projects through the R&D Grant. Looking ahead, TRACE plans to significantly expand the initiative in 2026, with the goal of funding up to 30 similar research projects, further accelerating innovation and technology-driven solutions across Sri Lanka.',
      ],
      websiteUrl: 'https://tracesrilanka.lk/',
      photos: [
        {
          src: researchPlusImg,
          title: 'R&D Grant Awards Ceremony',
          caption:
            'Final R&D Grant winners awarded on 18th December alongside the TRACE Director Board and Guest Speaker Mr. Manju Gunawardane.',
        },
        {
          src: researchPlusVisionImg,
          title: 'LKR 100M R&D Fund Vision & Pledge',
          caption:
            'TRACE’s pledge of LKR 3 million out of a LKR 15 million initiative toward establishing a LKR 100 million fund by 2027.',
        },
        {
          placeholder: true,
          title: '2026 Cohort Highlights',
          caption: 'Add additional award ceremony, lab prototype, or research showcase photos here.',
        },
        // Add more gallery photos here:
        // { src: yourImportedPhoto, title: 'Photo Title', caption: 'Short description' },
      ],
    },
    whatWeDo: [
      {
        icon: 'Wallet',
        title: 'Applied R&D Grant Funding',
        description:
          'Providing up to LKR 500,000 per selected project for researchers, university teams, startups, and independent innovators ready to move beyond the idea stage.',
      },
      {
        icon: 'Compass',
        title: 'Milestone-Based Monitoring',
        description:
          'Structured 3-to-6-month technical and commercial milestone tracking alongside leadership and innovation skills development.',
      },
      {
        icon: 'FlaskConical',
        title: 'Mentorship & Industry Exposure',
        description:
          'Connecting grant recipients with industry leaders, technical advisors, and corporate R&D champions to validate real-world impact.',
      },
      {
        icon: 'TrendingUp',
        title: 'Investor & VC Pathways',
        description:
          'Direct links to pre-seed investors, angel networks (including Angel X), and venture capital platforms to scale research into global startups.',
      },
    ],
    keyFeatures: [
      {
        icon: 'Award',
        title: 'Up to LKR 500,000 Grant',
        description:
          'Direct non-dilutive financial support for applied research prototypes and commercialization readiness.',
      },
      {
        icon: 'Users',
        title: 'Executive Mentorship',
        description:
          'Guidance from TRACE Board Members, industry executives, and innovation specialists.',
      },
      {
        icon: 'Cpu',
        title: '3–6 Month Acceleration',
        description:
          'Milestone-driven monitoring to keep projects progressing from lab validation to market launch.',
      },
      {
        icon: 'Sparkles',
        title: 'Angel & VC Access',
        description:
          'Warm introductions to pre-seed backers, angel syndicates, and follow-on venture capital.',
      },
    ],
    targetAudience: [
      {
        number: '01',
        title: 'Applied Researchers',
        description:
          'Researchers moving beyond initial concepts to validate and commercialize practical solutions.',
        tag: 'R&D Grants',
      },
      {
        number: '02',
        title: 'University Teams',
        description:
          'Academic and postgraduate teams turning laboratory breakthroughs into scalable national innovations.',
        tag: 'Lab to Market',
      },
      {
        number: '03',
        title: 'Early-Stage Startups',
        description:
          'Science and tech startups seeking milestone funding, mentorship, and pre-seed investor connections.',
        tag: 'Scale Ready',
      },
      {
        number: '04',
        title: 'Independent Innovators',
        description:
          'Inventors and builders tackling pressing national and global challenges through applied R&D.',
        tag: 'Ecosystem Support',
      },
    ],
    impact: {
      title: 'Scaling National R&D Impact',
      subtitle:
        'Expanding from 7 funded projects in 2025 toward up to 30 projects in 2026 and a LKR 100M fund by 2027.',
      metrics: [
        { value: '7 → 30', label: 'Funded Projects (2025 → 2026 Goal)' },
        { value: 'LKR 100M', label: 'Target R&D Fund by 2027' },
      ],
      progressLabel: 'TRACE Initial Pledge (LKR 3M / LKR 15M)',
      progressValue: 20,
    },
    cta: {
      title: 'Apply or Partner with the TRACE R&D Grant',
      description:
        'Submit your applied research proposal for the R&D Grant or support TRACE’s LKR 100 million fund initiative.',
      email: 'researchplus@tracesrilanka.org',
      learnMoreSummary:
        'The TRACE Research and Development Grant empowers researchers, university teams, startups, and independent innovators with funding up to LKR 500,000, milestone monitoring, and investor access.',
      highlights: [
        'Up to LKR 500,000 in milestone-based grant funding over 3–6 months',
        'Mentorship, industry exposure, and connections to angel & VC networks',
        'Expanding to up to 30 funded research projects in 2026',
      ],
    },
  },
  {
    id: 'bread-center',
    slug: 'bread-center',
    name: 'Bread Center',
    shortDescription: 'Business Research and Development Center for Food Tech Startups.',
    category: 'Food Tech R&D',
    statusLabel: 'National Hub',
    eyebrow: 'TRACE Sector Hub • Food & Agriculture Innovation',
    image: breadCenterImg,
    intro:
      'The Business Research and Development (BREAD) Center is a pioneering national incubation and innovation facility dedicated to enhancing Sri Lanka’s food and agriculture entrepreneurship ecosystem. Jointly owned by the National Enterprise Development Authority (NEDA) and Wayamba University of Sri Lanka, and operating under the Ministry of Industries, the center is currently managed by TRACE Sri Lanka.',
    heroStats: [
      { icon: 'Building2', label: 'Joint Owners', value: 'NEDA & Wayamba Univ.' },
      { icon: 'Landmark', label: 'Ministry', value: 'Ministry of Industries' },
      { icon: 'TrendingUp', label: 'Managed By', value: 'TRACE Sri Lanka (2023+)' },
    ],
    about: {
      title: 'About TRACE BREAD Center',
      paragraphs: [
        'The Business Research and Development (BREAD) Center is a national incubation and innovation facility dedicated to strengthening Sri Lanka’s food and agriculture entrepreneurship ecosystem. Jointly owned by the National Enterprise Development Authority (NEDA) and Wayamba University of Sri Lanka, the center operates under the Ministry of Industries and is currently managed by TRACE Sri Lanka.',
        'Established to support entrepreneurs, startups, and small and medium enterprises (SMEs), the TRACE BREAD Center focuses on transforming research and ideas into market ready products. The center provides a structured environment where innovators can access incubation support, technical guidance, business development assistance, and product research opportunities—helping them move beyond experimentation towards commercialization.',
        'In 2023, TRACE assumed management of the BREAD Center to revitalize its operations and unlock its full potential. Since then, the center has evolved into an active innovation hub, supporting applied research, industry collaborations, and startup incubation across food technology and agri-based industries.',
        'The TRACE BREAD Center plays a strong role in academic and industry engagement, hosting university research activities, student training programs, workshops, and knowledge-sharing sessions. Undergraduate and postgraduate researchers from multiple universities have utilized the center’s facilities to conduct final-year research and product trials, gaining valuable exposure to real industrial environments.',
        'Collaboration is a key pillar of the center’s impact. TRACE BREAD actively works with private companies, government institutions, international development organizations, and foreign trade bodies to foster innovation, technology transfer, and sustainable growth. A major milestone was achieved when the center reached operational breakeven in December 2023, followed by successful export activities in 2024—positioning Sri Lanka as a competitive player in the regional and global food and agribusiness landscape.',
      ],
      applyNow: {
        label: 'Our Social Media',
        url: 'https://tracesrilanka.lk/',
      },
    },
    upcomingEvents: {
      eyebrow: 'Workshops & Technical Programs',
      title: 'Latest Upcoming Events',
      subtitle: 'You can find all the latest upcoming events here.',
      items: [
        {
          id: 'bread-event-1',
          badge: 'Technical Program 2026',
          title: 'ආහාර ආශ්රිත නිශ්පාදන ටින් කිරීමේ තාක්ෂණික වැඩසටහන',
          url: 'https://docs.google.com/.../1FAIpQLSelmFIDSMKmcD.../viewform',
          poster: null,
        },
        {
          id: 'bread-event-2',
          badge: 'Theory + Practical',
          title: 'කේක් හා කුකීස් වර්ග නිෂ්පාදනය පිළිබඳ තාක්ෂණික වැඩසටහන',
          url: 'https://drive.google.com/.../1FAIpQLSe4Zd2qulL.../viewform?fbclid=IwY2xjawPicBBleHRuA2FlbQIxMABicmlkETFKQXVWenV2N1phd2NiaGFac3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHhJudoHmAqpWti3CO2A4TEobzlpXkGLoLwbvaJCAcLWTuQtn6pjeeoXALT6h_aem_Jox2EpiF1FOyEnR4uxwrow&ddrp=1#',
          poster: null,
        },
        {
          id: 'bread-event-3',
          badge: 'Dairy Tech Workshop',
          title: 'දේශිය සහ විදේශිය වෙළඳපොල සඳහා කිරි අශ්රිත නිෂ්පාදන තාක්යෂණය හා සම්බන්ධ වැඩමුළුව',
          url: 'https://drive.google.com/.../1FAIpQLSe4Zd2qulL.../viewform?fbclid=IwY2xjawPicBBleHRuA2FlbQIxMABicmlkETFKQXVWenV2N1phd2NiaGFac3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHhJudoHmAqpWti3CO2A4TEobzlpXkGLoLwbvaJCAcLWTuQtn6pjeeoXALT6h_aem_Jox2EpiF1FOyEnR4uxwrow&ddrp=1#',
          poster: null,
        },
        {
          id: 'bread-event-4',
          badge: 'Theory + Practical',
          title: 'කේක් හා කුකීස් වර්ග නිෂ්පාදනය පිළිබඳ තාක්ෂණික වැඩසටහන',
          url: 'https://drive.google.com/.../1FAIpQLSe4Zd2qulL.../viewform?fbclid=IwY2xjawPicBBleHRuA2FlbQIxMABicmlkETFKQXVWenV2N1phd2NiaGFac3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHhJudoHmAqpWti3CO2A4TEobzlpXkGLoLwbvaJCAcLWTuQtn6pjeeoXALT6h_aem_Jox2EpiF1FOyEnR4uxwrow&ddrp=1#',
          poster: null,
        },
        {
          id: 'bread-event-5',
          badge: 'Theory + Practical',
          title: 'කේක් හා කුකීස් වර්ග නිෂ්පාදනය පිළිබඳ තාක්ෂණික වැඩසටහන',
          url: 'https://drive.google.com/.../1FAIpQLSe4Zd2qulL.../viewform?fbclid=IwY2xjawPicBBleHRuA2FlbQIxMABicmlkETFKQXVWenV2N1phd2NiaGFac3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHhJudoHmAqpWti3CO2A4TEobzlpXkGLoLwbvaJCAcLWTuQtn6pjeeoXALT6h_aem_Jox2EpiF1FOyEnR4uxwrow&ddrp=1#',
          poster: null,
        },
      ],
    },
    gallery: {
      eyebrow: 'Facility & Workshop Gallery',
      title: 'BREAD Center Photos',
      paragraphs: [
        'Explore highlights from the TRACE BREAD Center incubation facility, technical training workshops, university research trials, and export-ready food products.',
      ],
      photos: [
        {
          src: breadCenterImg,
          title: 'TRACE BREAD Center Facility',
          caption:
            'Business Research and Development (BREAD) Center jointly owned by NEDA and Wayamba University of Sri Lanka, managed by TRACE Sri Lanka.',
        },
        {
          placeholder: true,
          title: 'Workshops & Training Moments',
          caption: 'Add additional workshop, pilot lab, or food-tech showcase photos here.',
        },
        {
          placeholder: true,
          title: 'Research & Export Products',
          caption: 'Add university product trial and export-ready enterprise photos here.',
        },
        // Add permanent gallery photos here:
        // { src: yourImportedPhoto, title: 'Workshop Title', caption: 'Short description' },
      ],
    },
    whatWeDo: [
      {
        icon: 'FlaskConical',
        title: 'Product Research & Trials',
        description:
          'Hands-on food science support, pilot processing, and university-backed product trials transforming ideas into market-ready food innovations.',
      },
      {
        icon: 'ShieldCheck',
        title: 'Incubation & Business Development',
        description:
          'Structured incubation, technical guidance, and commercialization pathways tailored for SMEs, startups, and agri-entrepreneurs.',
      },
      {
        icon: 'GraduationCap',
        title: 'Workshops & Academic Training',
        description:
          'Hosting practical food technology workshops, final-year undergraduate/postgraduate research trials, and industry knowledge sessions.',
      },
      {
        icon: 'Globe',
        title: 'Partnerships & Export Scaling',
        description:
          'Collaborating with private companies, government agencies, and foreign trade bodies to take local food products into international markets.',
      },
    ],
    keyFeatures: [
      {
        icon: 'Utensils',
        title: 'Incubation & Pilot Facility',
        description:
          'Industrial food-processing environment enabling product formulation and trial runs without heavy capital cost.',
      },
      {
        icon: 'Microscope',
        title: 'University Research Hub',
        description:
          'Active partnership with Wayamba University and multiple faculties for applied food-tech R&D.',
      },
      {
        icon: 'Globe',
        title: 'Export-Ready Pathways',
        description:
          'Proven track record helping center-processed food products enter global export markets since 2024.',
      },
      {
        icon: 'Handshake',
        title: 'Public-Private Synergy',
        description:
          'Backed by NEDA, Ministry of Industries, and TRACE Sri Lanka’s private-sector and international partner network.',
      },
    ],
    targetAudience: [
      {
        number: '01',
        title: 'Food & Agri Startups',
        description:
          'Innovators moving beyond experimentation toward commercialized, market-ready food products.',
        tag: 'Incubation',
      },
      {
        number: '02',
        title: 'Local SMEs',
        description:
          'Small and medium food processors seeking technical workshops, product refinement, and export scale.',
        tag: 'SME Growth',
      },
      {
        number: '03',
        title: 'University Researchers',
        description:
          'Undergraduate and postgraduate teams conducting final-year research and real industrial trials.',
        tag: 'Academic R&D',
      },
      {
        number: '04',
        title: 'Industry & Trade Partners',
        description:
          'Private firms, development agencies, and buyers collaborating on technology transfer and exports.',
        tag: 'Global Trade',
      },
    ],
    impact: {
      title: 'Operational Breakeven to Global Exports',
      subtitle:
        'Achieving operational breakeven in December 2023 under TRACE management and launching successful export activities in 2024.',
      metrics: [
        { value: 'Dec 2023', label: 'Operational Breakeven' },
        { value: '2024+', label: 'Global Export Market Entry' },
      ],
      progressLabel: 'Commercialization & Export Readiness',
      progressValue: 90,
    },
    cta: {
      title: 'Collaborate or Innovate with TRACE BREAD Center',
      description:
        'Join an upcoming technical workshop, reserve pilot research facilities, or partner with us on food-tech commercialization.',
      email: 'breadcenter@tracesrilanka.org',
      learnMoreSummary:
        'Managed by TRACE Sri Lanka since 2023 under NEDA, Wayamba University of Sri Lanka, and the Ministry of Industries, BREAD Center turns food research into export-ready ventures.',
      highlights: [
        'Jointly owned by NEDA & Wayamba University under the Ministry of Industries',
        'Technical food-processing workshops, incubation, and university R&D trials',
        'Proven path from operational breakeven (Dec 2023) to international exports (2024)',
      ],
    },
  },
  {
    id: 'theory-to-trade',
    slug: 'theory-to-trade',
    name: 'Theory to Trade',
    shortDescription:
      'Career-readiness and industry-immersion initiative designed to bridge the gap between university education and real-world workplace expectations.',
    category: 'Career Readiness',
    statusLabel: 'Talent Pipeline',
    eyebrow: 'TRACE Talent Initiative • Industry Immersion & Careers',
    image: theoryToTradeImg,
    imagePosition: 'center 22%',
    intro:
      'A structured career-readiness and industry-immersion initiative bridging academic foundations with live engineering, product, and corporate workplace expectations.',
    heroStats: [
      { icon: 'GraduationCap', label: 'Model', value: 'Live Project Immersion' },
      { icon: 'Briefcase', label: 'Mentors', value: 'Industry Practitioners' },
      { icon: 'Code2', label: 'Outcome', value: 'Day-One Job Readiness' },
    ],
    about: {
      title: 'Closing the Academia-to-Industry Gap',
      paragraphs: [
        'Theory to Trade directly tackles the transition challenge faced by university undergraduates and recent graduates entering fast-moving technology and business environments.',
        'Through real-world industry sprints, agile team simulations, code and design reviews, and workplace communication coaching led by active practitioners at TRACE Sri Lanka, participants graduate with verified applied portfolios and professional confidence.',
      ],
    },
    whatWeDo: [
      {
        icon: 'Briefcase',
        title: 'Real-World Industry Sprints',
        description:
          'Students tackle authentic technical and business briefs curated by partner companies using modern workflows and tools.',
      },
      {
        icon: 'Users',
        title: 'Practitioner Mentorship',
        description:
          'Direct feedback from senior engineers, product managers, and HR leaders on code quality, architecture, and teamwork.',
      },
      {
        icon: 'GraduationCap',
        title: 'Professional Readiness Labs',
        description:
          'Workshops covering technical interviews, stakeholder communication, agile collaboration, and workplace ethics.',
      },
      {
        icon: 'Handshake',
        title: 'Employer Talent Matching',
        description:
          'Connecting top-performing cohort graduates with internships and full-time roles across TRACE’s corporate ecosystem.',
      },
    ],
    keyFeatures: [
      {
        icon: 'Code2',
        title: 'Production Workflows',
        description:
          'Hands-on experience with version control, CI/CD pipelines, design systems, and collaborative project boards.',
      },
      {
        icon: 'Target',
        title: 'Competency Assessments',
        description:
          'Structured skill rubrics that give students actionable feedback and employers verified capability signals.',
      },
      {
        icon: 'Layers',
        title: 'Portfolio Capstone',
        description:
          'Every participant completes a real-world capstone deliverable reviewed by industry panels.',
      },
      {
        icon: 'Briefcase',
        title: 'Career Placement Days',
        description:
          'Direct hiring showcases linking graduates with high-growth startups and enterprise tech teams.',
      },
    ],
    targetAudience: [
      {
        number: '01',
        title: 'Final-Year Undergraduates',
        description:
          'University students preparing for industry internships and entry-level engineering or business roles.',
        tag: 'Skill Transition',
      },
      {
        number: '02',
        title: 'Recent Graduates',
        description:
          'Early-career talent seeking hands-on production exposure and verified industry project experience.',
        tag: 'Placement Ready',
      },
      {
        number: '03',
        title: 'University Faculties',
        description:
          'Academic departments aligning curricula and capstone programmes with evolving industry standards.',
        tag: 'Curriculum Sync',
      },
      {
        number: '04',
        title: 'Hiring Enterprises',
        description:
          'Technology and corporate employers looking for pre-vetted, day-one-ready graduate talent.',
        tag: 'Verified Talent',
      },
    ],
    impact: {
      title: 'Accelerating Early-Career Success',
      subtitle:
        'Reducing employer onboarding time while empowering Sri Lankan graduates to excel in global-standard teams.',
      metrics: [
        { value: '1,200+', label: 'Graduates Immersed' },
        { value: '40+', label: 'Hiring Partner Companies' },
      ],
      progressLabel: '90-Day Placement Rate',
      progressValue: 91,
    },
    cta: {
      title: 'Bridge Theory to Trade with Us',
      description:
        'Partner as a hiring organization, volunteer as an industry mentor, or enroll your university cohort in our next cycle.',
      email: 'theorytotrade@tracesrilanka.org',
      learnMoreSummary:
        'Theory to Trade partners with Sri Lankan universities and leading tech employers to deliver 8-to-12-week industry immersion tracks.',
      highlights: [
        'Simulated agile product teams led by practicing industry mentors',
        'Mock technical & behavioral interviews with detailed scorecards',
        'Direct talent showcase to 40+ TRACE ecosystem employers',
      ],
    },
  },
  {
    id: 'unicorns',
    slug: 'unicorns',
    name: 'Unicorns',
    shortDescription: 'University Incubator Network for Startups.',
    category: 'Incubator Network',
    statusLabel: 'National Network',
    eyebrow: 'TRACE Campus Ecosystem • University Incubator Network',
    image: unicornsImg,
    intro:
      'A connected University Incubator Network for Startups uniting campus entrepreneurship cells across Sri Lanka to nurture student-led ventures from ideation to investment.',
    heroStats: [
      { icon: 'Network', label: 'Coverage', value: 'Multi-University Grid' },
      { icon: 'Rocket', label: 'Stage', value: 'Ideation to Pre-Seed' },
      { icon: 'Lightbulb', label: 'Ventures', value: 'Student-Led Startups' },
    ],
    about: {
      title: 'Unlocking Campus-Born Innovation',
      paragraphs: [
        'Unicorns (University Incubator Network for Startups) connects university incubators, innovation clubs, and student founders across Sri Lanka into one shared national acceleration backbone.',
        'Instead of isolated campus initiatives reinventing playbooks, Unicorns provides shared venture curricula, cross-university founder matchmaking, seed demo days, and direct progression pathways into TRACE Expert City and Angel X.',
      ],
    },
    whatWeDo: [
      {
        icon: 'Network',
        title: 'Inter-University Hub Linking',
        description:
          'Connecting technical, business, and design faculties across campuses so student founders build balanced founding teams.',
      },
      {
        icon: 'Lightbulb',
        title: 'Zero-to-One Venture Bootcamps',
        description:
          'Practical workshops on customer discovery, lean validation, MVP building, and unit economics for first-time founders.',
      },
      {
        icon: 'Users',
        title: 'Alumni & Founder Mentorship',
        description:
          'Pairing student teams with successful startup founders and TRACE ecosystem operators for weekly office hours.',
      },
      {
        icon: 'Rocket',
        title: 'National Demo Day Pipeline',
        description:
          'Elevating top campus startups onto national stages with micro-grants, cloud credits, and investor introductions.',
      },
    ],
    keyFeatures: [
      {
        icon: 'Layers',
        title: 'Standardized Playbooks',
        description:
          'Shared incubation toolkits, legal templates, and cohort milestones for every partner university hub.',
      },
      {
        icon: 'Sparkles',
        title: 'Cross-Campus Co-Founding',
        description:
          'Matching engineering builders with business, design, and domain specialists from sister campuses.',
      },
      {
        icon: 'Wallet',
        title: 'Micro-Grants & Perks',
        description:
          'Prototype stipends, software credits, and co-working passes at TRACE Expert City.',
      },
      {
        icon: 'TrendingUp',
        title: 'Angel X Fast-Track',
        description:
          'Top graduating student ventures receive direct pitch pathways to the Angel X investor network.',
      },
    ],
    targetAudience: [
      {
        number: '01',
        title: 'Student Entrepreneurs',
        description:
          'Undergraduates and postgraduates turning hackathon concepts and thesis projects into viable startups.',
        tag: 'Campus Founders',
      },
      {
        number: '02',
        title: 'University Incubators',
        description:
          'Campus entrepreneurship centres seeking national connectivity, mentor access, and shared resources.',
        tag: 'Hub Partners',
      },
      {
        number: '03',
        title: 'Student Builders & Designers',
        description:
          'Technical and creative talent eager to join high-energy early-stage founding teams.',
        tag: 'Co-Founder Match',
      },
      {
        number: '04',
        title: 'Ecosystem Sponsors',
        description:
          'Corporates and technology providers backing the next generation of Sri Lankan startup builders.',
        tag: 'Youth Innovation',
      },
    ],
    impact: {
      title: 'Building Tomorrow’s Category Leaders',
      subtitle:
        'Empowering student innovators nationwide with the networks, skills, and launchpad to build enduring companies.',
      metrics: [
        { value: '14+', label: 'Partner University Hubs' },
        { value: '110+', label: 'Student Startups Incubated' },
      ],
      progressLabel: 'Annual Cohort Growth',
      progressValue: 84,
    },
    cta: {
      title: 'Connect your campus to the Unicorns Network',
      description:
        'Launch an incubator chapter, mentor student founders, or apply with your campus startup team.',
      email: 'unicorns@tracesrilanka.org',
      learnMoreSummary:
        'Unicorns unites university innovation hubs under a shared national framework powered by TRACE Sri Lanka.',
      highlights: [
        'Cross-campus hackathons and founder-matching summits',
        'Co-working access and prototyping support for student teams',
        'Seamless graduation pathway into TRACE and Angel X',
      ],
    },
  },
  {
    id: 'speakup-sri-lanka',
    slug: 'speakup-sri-lanka',
    name: 'SpeakUp Sri Lanka (SHED)',
    shortDescription: 'Platform to connect professionals and policy lobbying.',
    category: 'Policy & Civic Tech',
    statusLabel: 'Advocacy Platform',
    eyebrow: 'TRACE Civic Tech Platform • Citizen Voice & Policy Action',
    image: speakupImg,
    imageFit: 'contain',
    imageBg: '#F8F8F8',
    intro:
      'SpeakUp Sri Lanka empowers citizens to create petitions, gather verified public support, and connect directly with relevant authorities to drive meaningful change across Sri Lanka.',
    heroStats: [
      { icon: 'ShieldCheck', label: 'Trust & Integrity', value: 'Verified Signatures' },
      { icon: 'BarChart3', label: 'Transparency', value: 'Real-Time Progress' },
      { icon: 'Landmark', label: 'Action', value: 'Direct Authority Links' },
    ],
    about: {
      title: 'SpeakUp Sri Lanka',
      paragraphs: [
        'SpeakUp Sri Lanka empowers citizens to create petitions, gather verified public support, and connect directly with relevant authorities.',
        'With real-time progress tracking, secure signature verification, and a mobile-first experience, the platform makes civic participation simple, transparent, and accessible—helping communities drive meaningful change across Sri Lanka.',
      ],
    },
    whatWeDo: [
      {
        icon: 'FileText',
        title: 'Citizen Petition Creation',
        description:
          'Enabling individuals and community groups to launch clear, structured petitions around civic, policy, and local priorities.',
      },
      {
        icon: 'ShieldCheck',
        title: 'Verified Public Support',
        description:
          'Using secure signature verification so every petition reflects genuine, credible community backing.',
      },
      {
        icon: 'Landmark',
        title: 'Direct Authority Connection',
        description:
          'Routing verified petitions and collective feedback directly to relevant decision-makers, ministries, and public authorities.',
      },
      {
        icon: 'BarChart3',
        title: 'Transparent Progress Tracking',
        description:
          'Providing real-time signature milestones, status updates, and response visibility for full public accountability.',
      },
    ],
    keyFeatures: [
      {
        icon: 'ShieldCheck',
        title: 'Secure Verification',
        description:
          'Robust signature verification safeguards petition authenticity and prevents duplicate or automated entries.',
      },
      {
        icon: 'BarChart3',
        title: 'Real-Time Tracking',
        description:
          'Live progress indicators showing signature counts, authority reviews, and resolution milestones.',
      },
      {
        icon: 'Zap',
        title: 'Mobile-First Experience',
        description:
          'Fast, lightweight design making civic participation effortless from any smartphone across Sri Lanka.',
      },
      {
        icon: 'MessageSquare',
        title: 'Transparent Dialogue',
        description:
          'Clear status timelines connecting citizens, professionals, and relevant authorities in one place.',
      },
    ],
    targetAudience: [
      {
        number: '01',
        title: 'Citizens & Communities',
        description:
          'Everyday Sri Lankans raising local or national issues and mobilizing verified public support.',
        tag: 'Civic Voice',
      },
      {
        number: '02',
        title: 'Professionals & Advocates',
        description:
          'Domain experts and civic groups championing transparent, solution-oriented policy reform.',
        tag: 'Policy Advocacy',
      },
      {
        number: '03',
        title: 'Relevant Authorities',
        description:
          'Public institutions and policy makers receiving verified citizen priorities and responding transparently.',
        tag: 'Direct Action',
      },
      {
        number: '04',
        title: 'Youth & Civil Society',
        description:
          'Student organizations and community networks driving constructive, accessible civic participation.',
        tag: 'Community Impact',
      },
    ],
    impact: {
      title: 'Simple, Transparent Civic Participation',
      subtitle:
        'Making verified petitions, real-time tracking, and constructive engagement with authorities accessible nationwide.',
      metrics: [
        { value: '100%', label: 'Verified Signature Flow' },
        { value: 'Mobile-First', label: 'Island-Wide Accessibility' },
      ],
      progressLabel: 'Platform Transparency & Verification',
      progressValue: 95,
    },
    cta: {
      title: 'Drive meaningful change with SpeakUp Sri Lanka',
      description:
        'Start a community initiative, connect with civic working groups, or collaborate with TRACE Sri Lanka on public engagement.',
      email: 'speakup@tracesrilanka.org',
      learnMoreSummary:
        'SpeakUp Sri Lanka empowers citizens to create petitions, gather verified public support, and connect directly with relevant authorities through a mobile-first, transparent platform.',
      highlights: [
        'Create petitions and mobilize verified public support effortlessly',
        'Real-time progress tracking and secure signature verification',
        'Direct, transparent pathways connecting communities with relevant authorities',
      ],
    },
  },
];

