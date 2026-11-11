const { User, Job, Proposal, Contract, Wallet, Transaction, Message } = require('../models');

const seedData = async () => {
  try {
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log('🌱 Database already populated. Skipping seeder.');
      return;
    }

    console.log('🌱 Seeding initial demo data for evaluation...');

    // 1. Create Users
    const admin = await User.create({
      email: 'admin@uniwork.local',
      password: 'AdminPass123!',
      firstName: 'System',
      lastName: 'Admin',
      isAdmin: true,
      isClient: true,
      isFreelancer: true,
      location: 'UniWork HQ',
    });

    const clientSarah = await User.create({
      email: 'client.sarah@uniwork.local',
      password: 'Password123!',
      firstName: 'Sarah',
      lastName: 'Chen',
      isClient: true,
      location: 'Stanford Campus',
      clientProfile: {
        companyName: 'Stanford Health AI Lab',
        description: 'Pioneering healthcare ML solutions for clinical trial coordination.',
        totalSpent: 1200,
      },
    });

    const clientDavid = await User.create({
      email: 'client.david@uniwork.local',
      password: 'Password123!',
      firstName: 'David',
      lastName: 'Miller',
      isClient: true,
      location: 'Silicon Valley Incubator',
      clientProfile: {
        companyName: 'EduTech Ventures',
        description: 'Next-generation adaptive learning platform for STEM universities.',
        totalSpent: 850,
      },
    });

    const freelancerAlex = await User.create({
      email: 'freelancer.alex@uniwork.local',
      password: 'Password123!',
      firstName: 'Alex',
      lastName: 'Rivera',
      isFreelancer: true,
      location: 'UC Berkeley',
      freelancerProfile: {
        title: 'Full-Stack Developer & ML Researcher',
        overview: 'CS senior with 3 years building React Native, Node.js, and PyTorch solutions for research labs.',
        hourlyRate: 35,
        skills: ['React Native', 'Node.js', 'Express', 'MongoDB', 'Python', 'PyTorch'],
        portfolioUrl: 'https://github.com/alexrivera-demo',
        connects: 24,
        completedJobsCount: 4,
        totalEarned: 2450,
      },
    });

    const freelancerPriya = await User.create({
      email: 'freelancer.priya@uniwork.local',
      password: 'Password123!',
      firstName: 'Priya',
      lastName: 'Sharma',
      isFreelancer: true,
      location: 'MIT Media Lab',
      freelancerProfile: {
        title: 'UI/UX Designer & Mobile App Engineer',
        overview: 'Specializing in accessible design systems, mobile apps, and interactive prototyping.',
        hourlyRate: 40,
        skills: ['Figma', 'UI/UX', 'React Native', 'CSS Design Systems', 'Design Tokens'],
        portfolioUrl: 'https://dribbble.com/priyasharma-demo',
        connects: 18,
        completedJobsCount: 6,
        totalEarned: 3100,
      },
    });

    // 2. Wallets & Initial Balances
    const walletSarah = await Wallet.create({ user: clientSarah._id, balance: 3500, escrowHeld: 850 });
    const walletDavid = await Wallet.create({ user: clientDavid._id, balance: 2200, escrowHeld: 600 });
    const walletAlex = await Wallet.create({ user: freelancerAlex._id, balance: 1450, escrowHeld: 0 });
    const walletPriya = await Wallet.create({ user: freelancerPriya._id, balance: 1980, escrowHeld: 0 });
    await Wallet.create({ user: admin._id, balance: 9999, escrowHeld: 0 });

    // 3. Jobs
    const job1 = await Job.create({
      client: clientSarah._id,
      title: 'Full-Stack Clinical Portal with Role-Based Access',
      description: 'Develop a modern, responsive web application for oncology research trials. Must support secure patient telemetry views, clinician approval workflows, and audit exports.',
      category: 'Software Development',
      budgetType: 'fixed',
      budgetMin: 850,
      budgetMax: 1200,
      experienceLevel: 'intermediate',
      status: 'in_progress',
      skillsRequired: ['React Native', 'Node.js', 'MongoDB', 'Express', 'JWT'],
      proposalsCount: 2,
    });

    const job2 = await Job.create({
      client: clientDavid._id,
      title: 'Adaptive Learning Quiz Generator using NLP',
      description: 'Build an automated question generator from PDF textbooks using transformer pipelines and fine-tuned open-source models for university STEM courses.',
      category: 'Data Science & AI',
      budgetType: 'fixed',
      budgetMin: 600,
      budgetMax: 900,
      experienceLevel: 'expert',
      status: 'in_progress',
      skillsRequired: ['Python', 'NLP', 'PyTorch', 'Transformers', 'FastAPI'],
      proposalsCount: 3,
    });

    const job3 = await Job.create({
      client: clientSarah._id,
      title: 'University Campus Ride-Share UI/UX Mobile App Design',
      description: 'Design high-fidelity interactive wireframes and design system components for an eco-friendly student carpooling application.',
      category: 'Design & Creative',
      budgetType: 'hourly',
      budgetMin: 30,
      budgetMax: 45,
      experienceLevel: 'entry',
      status: 'open',
      skillsRequired: ['Figma', 'UI/UX Design', 'Design Systems', 'Mobile Prototyping'],
      proposalsCount: 4,
    });

    const job4 = await Job.create({
      client: clientDavid._id,
      title: 'Literature Review on Zero-Knowledge Proofs in Decentralized Identity',
      description: 'Synthesize 25 peer-reviewed papers on zk-SNARKs vs zk-STARKs scalability in university credential verification systems with benchmark comparison tables.',
      category: 'Academic Writing & Research',
      budgetType: 'fixed',
      budgetMin: 450,
      budgetMax: 600,
      experienceLevel: 'intermediate',
      status: 'open',
      skillsRequired: ['Academic Writing', 'Cryptography', 'Zero Knowledge', 'LaTeX'],
      proposalsCount: 1,
    });

    // 4. Proposals
    const prop1 = await Proposal.create({
      job: job1._id,
      freelancer: freelancerAlex._id,
      coverLetter: 'I have extensive experience building research portals using MERN. I can deliver clean architecture with full test coverage and interactive dashboards within 10 days.',
      bidAmount: 850,
      estimatedDays: 10,
      status: 'accepted',
    });

    await Proposal.create({
      job: job1._id,
      freelancer: freelancerPriya._id,
      coverLetter: 'I can design clean interfaces and implement the responsive views for the oncology dashboard.',
      bidAmount: 950,
      estimatedDays: 12,
      status: 'pending',
    });

    const prop2 = await Proposal.create({
      job: job2._id,
      freelancer: freelancerAlex._id,
      coverLetter: 'I built NLP question answering systems during my undergraduate thesis. Excited to implement this for your edtech venture.',
      bidAmount: 600,
      estimatedDays: 14,
      status: 'accepted',
    });

    // 5. Active Contract 1 (Sarah & Alex on Job 1)
    const contract1 = await Contract.create({
      job: job1._id,
      client: clientSarah._id,
      freelancer: freelancerAlex._id,
      totalAmount: 850,
      amountPaid: 350,
      status: 'active',
      milestones: [
        {
          title: 'Milestone 1: Database Schema & Authentication API',
          description: 'Define Mongoose models, role-based JWT middleware, and initial automated test suite.',
          amount: 350,
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
          isApproved: true,
          status: 'approved',
          submissions: [
            {
              freelancer: freelancerAlex._id,
              workNotes: 'Completed JWT authentication and Mongoose schema models. All API routes tested and working.',
              attachmentUrl: 'https://github.com/alexrivera-demo/clinical-portal-v1',
            },
          ],
        },
        {
          title: 'Milestone 2: Clinician Dashboard & Audit Logs',
          description: 'Frontend views, real-time telemetry charts, and CSV/PDF export capability.',
          amount: 500,
          dueDate: new Date(Date.now() + 8 * 86400000).toISOString(),
          isApproved: false,
          status: 'submitted',
          submissions: [
            {
              freelancer: freelancerAlex._id,
              workNotes: 'Frontend views are ready and connected to the backend API. Please review the deliverable demo.',
              attachmentUrl: 'https://demo.uniwork.local/submissions/portal-v2.zip',
            },
          ],
        },
      ],
    });

    // 6. Messages for Contract 1
    await Message.create({
      contract: contract1._id,
      sender: clientSarah._id,
      content: 'Welcome to the project, Alex! Let me know if you need access to the sample clinical telemetry schemas.',
    });

    await Message.create({
      contract: contract1._id,
      sender: freelancerAlex._id,
      content: 'Hi Sarah, thank you! I have started on Milestone 1. The initial database models and JWT authentication are underway.',
    });

    await Message.create({
      contract: contract1._id,
      sender: clientSarah._id,
      content: '[ESCROW RELEASED] Approved Milestone 1 ($350). Great progress!',
      isSystem: true,
    });

    await Message.create({
      contract: contract1._id,
      sender: freelancerAlex._id,
      content: 'Thank you Sarah! I have just submitted the work for Milestone 2. You can inspect the deliverable.',
    });

    // 7. Ledger Transactions
    await Transaction.create({
      wallet: walletSarah._id,
      transactionType: 'deposit',
      amount: 4000,
      description: 'Initial project fund deposit',
    });

    await Transaction.create({
      wallet: walletSarah._id,
      transactionType: 'escrow_lock',
      amount: -850,
      description: `Escrow hold for Contract #${contract1._id}: ${job1.title}`,
      contractId: contract1._id,
    });

    await Transaction.create({
      wallet: walletAlex._id,
      transactionType: 'escrow_release',
      amount: 350,
      description: `Payment for approved Milestone 1: Database Schema & Authentication API`,
      contractId: contract1._id,
    });

    console.log('✅ Demo data seeded successfully into in-memory/file database!');
  } catch (err) {
    console.error('❌ Seeder error:', err);
  }
};

module.exports = seedData;
