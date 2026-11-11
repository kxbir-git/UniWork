from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from accounts.models import User, ClientProfile, FreelancerProfile, Wallet, Transaction
from marketplace.models import Category, Skill, Job, Proposal
from contracts.models import Contract, Milestone, WorkSubmission
from messaging.models import Message

class Command(BaseCommand):
    help = 'Populates the database with realistic sample categories, skills, users, jobs, proposals, and contracts.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Seeding UniWork database..."))

        # 1. Superuser
        admin_email = 'admin@uniwork.local'
        admin_user, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'first_name': 'UniWork',
                'last_name': 'Administrator',
                'is_staff': True,
                'is_superuser': True,
                'location': 'University Campus HQ'
            }
        )
        if created:
            admin_user.set_password('AdminPass123!')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f"Created Superuser: {admin_email} / AdminPass123!"))

        # 2. Categories
        categories_data = [
            ("Web & Software Development", "web-software-development", "bi-code-slash", "Web apps, APIs, Django backends, and frontend interfaces."),
            ("AI & Data Science", "ai-data-science", "bi-cpu", "Machine learning, NLP, data pipelines, and analytical dashboards."),
            ("Mobile App Development", "mobile-app-development", "bi-phone", "iOS, Android, Flutter, and cross-platform mobile solutions."),
            ("Design & Creative", "design-creative", "bi-palette", "UI/UX prototypes, branding, graphics, and video editing."),
            ("Content & Academic Writing", "content-academic-writing", "bi-journal-text", "Technical papers, grant proposals, blogs, and documentation."),
            ("Engineering & Embedded Systems", "engineering-embedded-systems", "bi-gear", "IoT, robotics, microcontrollers, and hardware modeling."),
        ]

        cat_objs = {}
        for name, slug, icon, desc in categories_data:
            cat, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'icon': icon, 'description': desc}
            )
            cat_objs[slug] = cat

        # 3. Skills
        skills_data = [
            ("Python", "web-software-development"),
            ("Django", "web-software-development"),
            ("JavaScript", "web-software-development"),
            ("Bootstrap 5", "web-software-development"),
            ("PostgreSQL", "web-software-development"),
            ("REST APIs", "web-software-development"),
            ("PyTorch", "ai-data-science"),
            ("TensorFlow", "ai-data-science"),
            ("Data Analysis", "ai-data-science"),
            ("NLP", "ai-data-science"),
            ("Flutter", "mobile-app-development"),
            ("React Native", "mobile-app-development"),
            ("Figma", "design-creative"),
            ("UI/UX Design", "design-creative"),
            ("Technical Writing", "content-academic-writing"),
            ("Academic Research", "content-academic-writing"),
        ]

        skill_objs = {}
        for skill_name, cat_slug in skills_data:
            skill, _ = Skill.objects.get_or_create(
                name=skill_name,
                defaults={'category': cat_objs[cat_slug]}
            )
            skill_objs[skill_name] = skill

        # 4. Clients
        clients_data = [
            {
                'email': 'client.sarah@uniwork.local',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'company': 'Stanford Health Informatics Lab',
                'location': 'Palo Alto, CA',
                'overview': 'Academic research laboratory developing patient analytics and clinical software solutions.',
                'website': 'https://healthlab.example.edu'
            },
            {
                'email': 'client.david@uniwork.local',
                'first_name': 'David',
                'last_name': 'Thorne',
                'company': 'EduTech Horizons Inc.',
                'location': 'Cambridge, MA',
                'overview': 'EdTech startup building collaborative classroom and tutoring platforms for universities.',
                'website': 'https://edutech.example.com'
            },
            {
                'email': 'client.elena@uniwork.local',
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'company': 'EcoSmart BioEnergy',
                'location': 'Austin, TX',
                'overview': 'Clean energy university incubator project monitoring campus solar microgrids.',
                'website': 'https://ecosmart.example.org'
            }
        ]

        client_users = []
        for c in clients_data:
            user, created = User.objects.get_or_create(
                email=c['email'],
                defaults={
                    'first_name': c['first_name'],
                    'last_name': c['last_name'],
                    'is_client': True,
                    'location': c['location']
                }
            )
            if created:
                user.set_password('Password123!')
                user.save()
            cp, _ = ClientProfile.objects.get_or_create(
                user=user,
                defaults={
                    'company_name': c['company'],
                    'overview': c['overview'],
                    'website': c['website']
                }
            )
            wallet, _ = Wallet.objects.get_or_create(user=user)
            wallet.balance = Decimal('1500.00')
            wallet.save()
            client_users.append(user)

        # 5. Freelancers (Students / Graduates)
        freelancers_data = [
            {
                'email': 'freelancer.alex@uniwork.local',
                'first_name': 'Alex',
                'last_name': 'Rivera',
                'title': 'Senior CS Student & Full-Stack Django Developer',
                'overview': 'Final-year Computer Science undergrad with 3 years of hands-on experience in Django, PostgreSQL, and REST APIs. Top contributor to open-source student portals.',
                'hourly_rate': Decimal('35.00'),
                'portfolio_url': 'https://github.com/alexrivera-dev',
                'location': 'Berkeley, CA',
                'skills': ['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Bootstrap 5']
            },
            {
                'email': 'freelancer.priya@uniwork.local',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'title': 'Data Science Master Candidate & ML Engineer',
                'overview': 'Master student specializing in Natural Language Processing, PyTorch architectures, and predictive analytics. Experienced with sentiment analysis and tabular modeling.',
                'hourly_rate': Decimal('45.00'),
                'portfolio_url': 'https://github.com/priyasharma-ai',
                'location': 'New York, NY',
                'skills': ['Python', 'PyTorch', 'Data Analysis', 'NLP']
            },
            {
                'email': 'freelancer.marcus@uniwork.local',
                'first_name': 'Marcus',
                'last_name': 'Vance',
                'title': 'Digital Product Designer & UI/UX Specialist',
                'overview': 'Human-Computer Interaction graduate student crafting clean web UI, accessible design systems, and responsive Figma prototypes.',
                'hourly_rate': Decimal('30.00'),
                'portfolio_url': 'https://behance.net/marcusvance',
                'location': 'London, UK',
                'skills': ['Figma', 'UI/UX Design', 'Bootstrap 5', 'JavaScript']
            }
        ]

        freelancer_users = []
        for f in freelancers_data:
            user, created = User.objects.get_or_create(
                email=f['email'],
                defaults={
                    'first_name': f['first_name'],
                    'last_name': f['last_name'],
                    'is_freelancer': True,
                    'location': f['location']
                }
            )
            if created:
                user.set_password('Password123!')
                user.save()
            fp, _ = FreelancerProfile.objects.get_or_create(
                user=user,
                defaults={
                    'title': f['title'],
                    'overview': f['overview'],
                    'hourly_rate': f['hourly_rate'],
                    'portfolio_url': f['portfolio_url'],
                    'connects': 25,
                    'total_earned': Decimal('250.00'),
                    'completed_jobs_count': 1
                }
            )
            for skill_name in f['skills']:
                if skill_name in skill_objs:
                    fp.skills.add(skill_objs[skill_name])
            wallet, _ = Wallet.objects.get_or_create(user=user)
            wallet.balance = Decimal('250.00')
            wallet.save()
            freelancer_users.append(user)

        # 6. Sample Jobs
        jobs_data = [
            {
                'client': client_users[0],
                'category': cat_objs['web-software-development'],
                'title': 'Build a Healthcare Lab Research Portal in Django',
                'description': 'We need a full-stack student developer to construct a collaborative research portal where researchers can upload CSV trial data, track experimental benchmarks, and export summarized reports.\n\nKey Deliverables:\n- User role authentication (Lead Researcher vs Lab Assistant)\n- Experiment submission forms with automated validation\n- Dashboard displaying latest experiment results',
                'budget_type': Job.BUDGET_FIXED,
                'budget_min': Decimal('400.00'),
                'budget_max': Decimal('600.00'),
                'experience': Job.EXPERIENCE_INTERMEDIATE,
                'skills': ['Python', 'Django', 'PostgreSQL', 'Bootstrap 5'],
                'status': Job.STATUS_OPEN
            },
            {
                'client': client_users[1],
                'category': cat_objs['ai-data-science'],
                'title': 'Develop NLP Sentiment Analyzer for Student Course Feedback',
                'description': 'Looking for an AI/ML student to develop an NLP classification pipeline that analyzes unstructured university course reviews and flags actionable themes for professors.\n\nDeliverables:\n- Preprocessing pipeline for student feedback texts\n- PyTorch or Scikit-Learn transformer model\n- Inference script and API endpoint',
                'budget_type': Job.BUDGET_FIXED,
                'budget_min': Decimal('350.00'),
                'budget_max': Decimal('500.00'),
                'experience': Job.EXPERIENCE_EXPERT,
                'skills': ['Python', 'PyTorch', 'Data Analysis', 'NLP'],
                'status': Job.STATUS_IN_PROGRESS
            },
            {
                'client': client_users[2],
                'category': cat_objs['design-creative'],
                'title': 'High-Fidelity Figma UI/UX Design for Campus Sustainability App',
                'description': 'Design 12 responsive screens for a student-focused energy conservation app. Deliverables include wireframes, interactive Figma component system, and mobile prototype.',
                'budget_type': Job.BUDGET_HOURLY,
                'budget_min': Decimal('25.00'),
                'budget_max': Decimal('40.00'),
                'experience': Job.EXPERIENCE_ENTRY,
                'skills': ['Figma', 'UI/UX Design'],
                'status': Job.STATUS_OPEN
            },
            {
                'client': client_users[0],
                'category': cat_objs['content-academic-writing'],
                'title': 'Literature Review & Technical Documentation on Telehealth APIs',
                'description': 'Need a science or computer engineering student to synthesize recent 2023-2026 academic literature regarding FHIR and HL7 interoperability standards.',
                'budget_type': Job.BUDGET_FIXED,
                'budget_min': Decimal('150.00'),
                'budget_max': Decimal('250.00'),
                'experience': Job.EXPERIENCE_INTERMEDIATE,
                'skills': ['Technical Writing', 'Academic Research'],
                'status': Job.STATUS_COMPLETED
            }
        ]

        created_jobs = []
        for jd in jobs_data:
            job, created = Job.objects.get_or_create(
                title=jd['title'],
                defaults={
                    'client': jd['client'],
                    'category': jd['category'],
                    'description': jd['description'],
                    'budget_type': jd['budget_type'],
                    'budget_min': jd['budget_min'],
                    'budget_max': jd['budget_max'],
                    'experience_level': jd['experience'],
                    'status': jd['status']
                }
            )
            for sk in jd['skills']:
                if sk in skill_objs:
                    job.skills_required.add(skill_objs[sk])
            created_jobs.append(job)

        # 7. Sample Proposals
        # Job 0 (Open) gets 2 proposals
        p1, _ = Proposal.objects.get_or_create(
            job=created_jobs[0],
            freelancer=freelancer_users[0],
            defaults={
                'bid_amount': Decimal('450.00'),
                'estimated_days': 10,
                'cover_letter': 'Dear Dr. Jenkins, I have built 4 production Django apps at UC Berkeley including our department portal. I can implement the required trial data upload and clean Bootstrap UI with unit test coverage within 10 days.',
                'status': Proposal.STATUS_PENDING
            }
        )
        p2, _ = Proposal.objects.get_or_create(
            job=created_jobs[0],
            freelancer=freelancer_users[2],
            defaults={
                'bid_amount': Decimal('500.00'),
                'estimated_days': 14,
                'cover_letter': 'Hello! I can take care of both the frontend UI design and Django implementation with a high aesthetic bar for your researchers.',
                'status': Proposal.STATUS_PENDING
            }
        )

        # Job 1 (In Progress): contract with freelancer Priya
        p3, _ = Proposal.objects.get_or_create(
            job=created_jobs[1],
            freelancer=freelancer_users[1],
            defaults={
                'bid_amount': Decimal('450.00'),
                'estimated_days': 14,
                'cover_letter': 'Hi David! My master research is specifically in NLP topic modeling and sentiment classification. I can deliver a high-accuracy pipeline with full documentation.',
                'status': Proposal.STATUS_ACCEPTED
            }
        )

        contract1, _ = Contract.objects.get_or_create(
            job=created_jobs[1],
            defaults={
                'client': created_jobs[1].client,
                'freelancer': freelancer_users[1],
                'total_amount': Decimal('450.00'),
                'status': Contract.STATUS_ACTIVE
            }
        )

        m1, _ = Milestone.objects.get_or_create(
            contract=contract1,
            title='Data Preprocessing & EDA Notebook',
            defaults={
                'description': 'Clean student dataset, remove stop words, generate token distribution graphs.',
                'amount': Decimal('200.00'),
                'due_date': (timezone.now() + timedelta(days=5)).date(),
                'status': Milestone.STATUS_APPROVED,
                'is_approved': True,
                'approved_at': timezone.now()
            }
        )

        m2, _ = Milestone.objects.get_or_create(
            contract=contract1,
            title='Model Training, Validation & REST API',
            defaults={
                'description': 'Train RoBERTa/DistilBERT model, benchmark F1 score, and package API service.',
                'amount': Decimal('250.00'),
                'due_date': (timezone.now() + timedelta(days=12)).date(),
                'status': Milestone.STATUS_SUBMITTED,
                'is_approved': False
            }
        )

        # Work submission for m2
        WorkSubmission.objects.get_or_create(
            milestone=m2,
            freelancer=freelancer_users[1],
            defaults={
                'work_notes': 'Hi David! I have completed training the sentiment model with 92.4% validation accuracy. The weights and Dockerized FastAPI microservice are ready for your testing.'
            }
        )

        # Sample messages in contract1
        Message.objects.get_or_create(
            contract=contract1,
            sender=contract1.client,
            recipient=contract1.freelancer,
            content="Welcome to the project, Priya! Looking forward to the NLP deliverables."
        )
        Message.objects.get_or_create(
            contract=contract1,
            sender=contract1.freelancer,
            recipient=contract1.client,
            content="Thank you, David! I have started processing the feedback dataset and will submit Milestone 1 ahead of schedule."
        )

        # Job 3 (Completed): contract with Alex
        contract2, _ = Contract.objects.get_or_create(
            job=created_jobs[3],
            defaults={
                'client': created_jobs[3].client,
                'freelancer': freelancer_users[0],
                'total_amount': Decimal('200.00'),
                'amount_paid': Decimal('200.00'),
                'status': Contract.STATUS_COMPLETED,
                'completed_at': timezone.now()
            }
        )
        Milestone.objects.get_or_create(
            contract=contract2,
            title='Final Academic Review Document',
            defaults={
                'description': '15-page comprehensive survey paper with IEEE citations.',
                'amount': Decimal('200.00'),
                'status': Milestone.STATUS_APPROVED,
                'is_approved': True,
                'approved_at': timezone.now()
            }
        )

        self.stdout.write(self.style.SUCCESS("UniWork database successfully populated!"))
        self.stdout.write(self.style.SUCCESS("Sample Credentials:"))
        self.stdout.write("  Admin:       admin@uniwork.local / AdminPass123!")
        self.stdout.write("  Client:      client.sarah@uniwork.local / Password123!")
        self.stdout.write("  Client:      client.david@uniwork.local / Password123!")
        self.stdout.write("  Freelancer:  freelancer.alex@uniwork.local / Password123!")
        self.stdout.write("  Freelancer:  freelancer.priya@uniwork.local / Password123!")
