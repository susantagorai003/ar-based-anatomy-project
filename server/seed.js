import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import User from './models/User.js';
import AnatomyModel from './models/AnatomyModel.js';
import Organ from './models/Organ.js';
import Quiz from './models/Quiz.js';
import Module from './models/Module.js';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

// Sample data
const users = [
    {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@anatomyar.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
    },
    {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@student.edu',
        password: 'student123',
        role: 'student',
        institution: 'Medical University',
        yearOfStudy: 2,
        isActive: true,
    },
    {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@student.edu',
        password: 'student123',
        role: 'student',
        institution: 'Health Sciences College',
        yearOfStudy: 3,
        isActive: true,
    },
];

const anatomyModels = [
    {
        name: 'Human Heart',
        slug: 'human-heart',
        description: 'A detailed 3D model of the human heart showing all four chambers, major vessels, and valves.',
        system: 'circulatory',
        category: 'organ',
        modelFile: '/uploads/models/heart.glb',
        difficulty: 'intermediate',
        isActive: true,
        isFeatured: true,
        tags: ['heart', 'circulatory', 'cardiology'],
        hotspots: [
            { id: 1, name: 'Left Ventricle', position: { x: 0.1, y: 0, z: 0 }, normal: { x: 0, y: 1, z: 0 } },
            { id: 2, name: 'Right Atrium', position: { x: -0.1, y: 0.1, z: 0 }, normal: { x: 0, y: 1, z: 0 } },
        ],
    },
    {
        name: 'Human Brain',
        slug: 'human-brain',
        description: 'Complete 3D model of the human brain with labeled lobes, cortex regions, and major structures.',
        system: 'nervous',
        category: 'organ',
        modelFile: '/uploads/models/brain.glb',
        difficulty: 'advanced',
        isActive: true,
        isFeatured: true,
        tags: ['brain', 'nervous', 'neurology'],
    },
    {
        name: 'Full Skeleton',
        slug: 'full-skeleton',
        description: 'Complete human skeletal system with all 206 bones labeled and interactive.',
        system: 'skeletal',
        category: 'full-body',
        modelFile: '/uploads/models/skeleton.glb',
        difficulty: 'beginner',
        isActive: true,
        isFeatured: true,
        tags: ['skeleton', 'bones', 'skeletal system'],
    },
    {
        name: 'Lungs',
        slug: 'human-lungs',
        description: '3D model of the respiratory system showing both lungs, bronchi, and alveoli.',
        system: 'respiratory',
        category: 'organ',
        modelFile: '/uploads/models/lungs.glb',
        difficulty: 'intermediate',
        isActive: true,
        tags: ['lungs', 'respiratory', 'pulmonology'],
    },
    {
        name: 'Human Skull',
        slug: 'human-skull',
        description: 'Detailed skull model with all cranial bones and sutures labeled.',
        system: 'skeletal',
        category: 'bone',
        modelFile: '/uploads/models/skull.glb',
        difficulty: 'intermediate',
        isActive: true,
        tags: ['skull', 'cranium', 'skeletal'],
    },
    {
        name: 'Liver',
        slug: 'human-liver',
        description: 'Hepatic system model showing liver lobes, gallbladder, and bile ducts.',
        system: 'digestive',
        category: 'organ',
        modelFile: '/uploads/models/liver.glb',
        difficulty: 'intermediate',
        isActive: true,
        tags: ['liver', 'hepatic', 'digestive'],
    },
];

const organs = [
    {
        name: 'Heart',
        slug: 'heart',
        latinName: 'Cor',
        description: 'The heart is a muscular organ that pumps blood throughout the body via the circulatory system.',
        function: 'Pumps oxygenated blood to the body and deoxygenated blood to the lungs. Maintains blood pressure and circulation.',
        location: 'Located in the thoracic cavity, slightly left of center, between the lungs.',
        system: 'circulatory',
        category: 'major-organ',
        difficulty: 'intermediate',
        clinicalRelevance: 'Essential for understanding cardiovascular diseases, heart attacks, and cardiac surgery.',
        keyFacts: [
            'Beats approximately 100,000 times per day',
            'Pumps about 5 liters of blood per minute at rest',
            'Has four chambers: two atria and two ventricles',
            'Weighs approximately 250-350 grams',
        ],
        relatedDisorders: [
            { name: 'Coronary Artery Disease', description: 'Plaque buildup in coronary arteries', symptoms: ['Chest pain', 'Shortness of breath', 'Fatigue'] },
            { name: 'Heart Failure', description: 'Heart cannot pump blood effectively', symptoms: ['Shortness of breath', 'Swelling', 'Fatigue'] },
        ],
        bloodSupply: {
            arteries: ['Left Coronary Artery', 'Right Coronary Artery'],
            veins: ['Coronary Sinus', 'Great Cardiac Vein'],
        },
    },
    {
        name: 'Brain',
        slug: 'brain',
        latinName: 'Encephalon',
        description: 'The brain is the central organ of the nervous system and controls most body activities.',
        function: 'Controls all body functions, processes sensory information, enables cognition, memory, and consciousness.',
        location: 'Located within the cranial cavity, protected by the skull and meninges.',
        system: 'nervous',
        category: 'major-organ',
        difficulty: 'advanced',
        clinicalRelevance: 'Critical for understanding neurological disorders, stroke, and brain surgery.',
        keyFacts: [
            'Contains approximately 86 billion neurons',
            'Weighs about 1.4 kg (3 pounds)',
            'Uses 20% of the body\'s oxygen',
            'Divided into frontal, parietal, temporal, and occipital lobes',
        ],
        relatedDisorders: [
            { name: 'Stroke', description: 'Interrupted blood supply to brain', symptoms: ['Sudden weakness', 'Confusion', 'Vision problems'] },
            { name: 'Alzheimer\'s Disease', description: 'Progressive neurodegenerative disease', symptoms: ['Memory loss', 'Confusion', 'Behavioral changes'] },
        ],
        bloodSupply: {
            arteries: ['Internal Carotid Arteries', 'Vertebral Arteries', 'Circle of Willis'],
            veins: ['Cerebral Veins', 'Dural Venous Sinuses'],
        },
    },
    {
        name: 'Lungs',
        slug: 'lungs',
        latinName: 'Pulmo',
        description: 'The lungs are the primary organs of the respiratory system, responsible for gas exchange.',
        function: 'Exchange oxygen and carbon dioxide between air and blood. Essential for cellular respiration.',
        location: 'Located in the thoracic cavity, on either side of the heart.',
        system: 'respiratory',
        category: 'major-organ',
        difficulty: 'intermediate',
        clinicalRelevance: 'Understanding pulmonary diseases, respiratory failure, and mechanical ventilation.',
        keyFacts: [
            'Right lung has 3 lobes, left lung has 2 lobes',
            'Contains approximately 300 million alveoli',
            'Surface area of about 70 square meters',
            'We breathe approximately 12-20 times per minute at rest',
        ],
        relatedDisorders: [
            { name: 'Pneumonia', description: 'Infection causing lung inflammation', symptoms: ['Cough', 'Fever', 'Difficulty breathing'] },
            { name: 'Asthma', description: 'Chronic inflammatory airway disease', symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness'] },
        ],
        bloodSupply: {
            arteries: ['Pulmonary Arteries', 'Bronchial Arteries'],
            veins: ['Pulmonary Veins', 'Bronchial Veins'],
        },
    },
];

const quizzes = [
    {
        title: 'Cardiovascular System Basics',
        slug: 'cardiovascular-basics',
        description: 'Test your knowledge of the heart and circulatory system.',
        system: 'circulatory',
        difficulty: 'beginner',
        timeLimit: 10,
        passingScore: 70,
        totalPoints: 30,
        isPublished: true,
        isActive: true,
        questions: [
            {
                question: 'How many chambers does the human heart have?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: 'Two' },
                    { id: 'b', text: 'Three' },
                    { id: 'c', text: 'Four', isCorrect: true },
                    { id: 'd', text: 'Five' },
                ],
                explanation: 'The heart has four chambers: two atria and two ventricles.',
            },
            {
                question: 'Which blood vessel carries oxygenated blood from the lungs to the heart?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: 'Pulmonary Artery' },
                    { id: 'b', text: 'Pulmonary Vein', isCorrect: true },
                    { id: 'c', text: 'Aorta' },
                    { id: 'd', text: 'Vena Cava' },
                ],
                explanation: 'Pulmonary veins carry oxygenated blood from the lungs to the left atrium.',
            },
            {
                question: 'The heart is located in the center of the chest.',
                type: 'true-false',
                points: 10,
                correctAnswer: 'false',
                explanation: 'The heart is located slightly to the left of center in the chest.',
            },
        ],
    },
    {
        title: 'Nervous System Fundamentals',
        slug: 'nervous-system-fundamentals',
        description: 'Explore the brain, spinal cord, and nervous system.',
        system: 'nervous',
        difficulty: 'intermediate',
        timeLimit: 15,
        passingScore: 70,
        totalPoints: 40,
        isPublished: true,
        isActive: true,
        questions: [
            {
                question: 'Which lobe of the brain is primarily responsible for vision?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: 'Frontal Lobe' },
                    { id: 'b', text: 'Parietal Lobe' },
                    { id: 'c', text: 'Temporal Lobe' },
                    { id: 'd', text: 'Occipital Lobe', isCorrect: true },
                ],
                explanation: 'The occipital lobe, located at the back of the brain, processes visual information.',
            },
            {
                question: 'Approximately how many neurons are in the human brain?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: '86 million' },
                    { id: 'b', text: '86 billion', isCorrect: true },
                    { id: 'c', text: '86 trillion' },
                    { id: 'd', text: '8.6 billion' },
                ],
                explanation: 'The human brain contains approximately 86 billion neurons.',
            },
            {
                question: 'The cerebellum controls voluntary muscle movement and posture.',
                type: 'true-false',
                points: 10,
                correctAnswer: 'true',
                explanation: 'The cerebellum coordinates voluntary movements, balance, and posture.',
            },
            {
                question: 'Which part of the brain controls breathing and heart rate?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: 'Cerebrum' },
                    { id: 'b', text: 'Cerebellum' },
                    { id: 'c', text: 'Brainstem', isCorrect: true },
                    { id: 'd', text: 'Thalamus' },
                ],
                explanation: 'The brainstem controls vital functions like breathing, heart rate, and blood pressure.',
            },
        ],
    },
    {
        title: 'Skeletal System Overview',
        slug: 'skeletal-system-overview',
        description: 'Learn about bones, joints, and the skeletal system.',
        system: 'skeletal',
        difficulty: 'beginner',
        timeLimit: 10,
        passingScore: 60,
        totalPoints: 30,
        isPublished: true,
        isActive: true,
        questions: [
            {
                question: 'How many bones are in the adult human body?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: '106' },
                    { id: 'b', text: '156' },
                    { id: 'c', text: '206', isCorrect: true },
                    { id: 'd', text: '256' },
                ],
                explanation: 'The adult human body has 206 bones.',
            },
            {
                question: 'Which is the longest bone in the human body?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: 'Tibia' },
                    { id: 'b', text: 'Femur', isCorrect: true },
                    { id: 'c', text: 'Humerus' },
                    { id: 'd', text: 'Fibula' },
                ],
                explanation: 'The femur (thigh bone) is the longest and strongest bone in the human body.',
            },
            {
                question: 'Bones produce blood cells in the bone marrow.',
                type: 'true-false',
                points: 10,
                correctAnswer: 'true',
                explanation: 'Red bone marrow produces red blood cells, white blood cells, and platelets.',
            },
        ],
    },
    {
        title: 'Muscular System Basics',
        slug: 'muscular-system-basics',
        description: 'Test your knowledge of the muscles and muscular system.',
        system: 'muscular',
        difficulty: 'beginner',
        timeLimit: 10,
        passingScore: 60,
        totalPoints: 50,
        isPublished: true,
        isActive: true,
        questions: [
            {
                question: 'How many muscles are in the human body?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: 'Around 200' },
                    { id: 'b', text: 'Around 400' },
                    { id: 'c', text: 'Around 600', isCorrect: true },
                    { id: 'd', text: 'Around 800' },
                ],
                explanation: 'The human body has around 600 muscles.',
            },
            {
                question: 'Which is the largest muscle in the human body?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: 'Biceps' },
                    { id: 'b', text: 'Gluteus Maximus', isCorrect: true },
                    { id: 'c', text: 'Quadriceps' },
                    { id: 'd', text: 'Latissimus Dorsi' },
                ],
                explanation: 'The Gluteus Maximus (buttock muscle) is the largest muscle in the body.',
            },
            {
                question: 'What are the three types of muscle tissue?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: 'Skeletal, Smooth, Cardiac', isCorrect: true },
                    { id: 'b', text: 'Fast, Slow, Mixed' },
                    { id: 'c', text: 'Red, White, Pink' },
                    { id: 'd', text: 'Voluntary, Involuntary, Automatic' },
                ],
                explanation: 'The three types are skeletal (voluntary), smooth (involuntary), and cardiac (heart) muscle.',
            },
            {
                question: 'Cardiac muscle is under voluntary control.',
                type: 'true-false',
                points: 10,
                correctAnswer: 'false',
                explanation: 'Cardiac muscle is involuntary - you cannot consciously control your heart beat.',
            },
            {
                question: 'Muscles can only pull, not push.',
                type: 'true-false',
                points: 10,
                correctAnswer: 'true',
                explanation: 'Muscles work by contracting (pulling). They work in pairs to create opposing movements.',
            },
        ],
    },
    {
        title: 'Respiratory System Fundamentals',
        slug: 'respiratory-system-fundamentals',
        description: 'Learn about the lungs and breathing system.',
        system: 'respiratory',
        difficulty: 'intermediate',
        timeLimit: 10,
        passingScore: 60,
        totalPoints: 50,
        isPublished: true,
        isActive: true,
        questions: [
            {
                question: 'How many lobes does the right lung have?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: '2' },
                    { id: 'b', text: '3', isCorrect: true },
                    { id: 'c', text: '4' },
                    { id: 'd', text: '5' },
                ],
                explanation: 'The right lung has 3 lobes (superior, middle, inferior). The left lung has 2 lobes.',
            },
            {
                question: 'Where does gas exchange occur in the lungs?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: 'Bronchi' },
                    { id: 'b', text: 'Trachea' },
                    { id: 'c', text: 'Alveoli', isCorrect: true },
                    { id: 'd', text: 'Bronchioles' },
                ],
                explanation: 'Alveoli are tiny air sacs where oxygen and carbon dioxide are exchanged with the blood.',
            },
            {
                question: 'How many alveoli are in the lungs approximately?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: '3 million' },
                    { id: 'b', text: '30 million' },
                    { id: 'c', text: '300 million', isCorrect: true },
                    { id: 'd', text: '3 billion' },
                ],
                explanation: 'There are approximately 300 million alveoli in the lungs.',
            },
            {
                question: 'The diaphragm is a muscle used for breathing.',
                type: 'true-false',
                points: 10,
                correctAnswer: 'true',
                explanation: 'The diaphragm is the primary muscle of respiration, separating the chest from the abdomen.',
            },
            {
                question: 'We exhale more oxygen than we inhale.',
                type: 'true-false',
                points: 10,
                correctAnswer: 'false',
                explanation: 'We inhale about 21% oxygen and exhale about 16% - we use oxygen and produce CO2.',
            },
        ],
    },
    {
        title: 'Digestive System Overview',
        slug: 'digestive-system-overview',
        description: 'Explore the organs and processes of digestion.',
        system: 'digestive',
        difficulty: 'beginner',
        timeLimit: 10,
        passingScore: 60,
        totalPoints: 50,
        isPublished: true,
        isActive: true,
        questions: [
            {
                question: 'How long is the average adult small intestine?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: '3 feet' },
                    { id: 'b', text: '10 feet' },
                    { id: 'c', text: '20 feet', isCorrect: true },
                    { id: 'd', text: '35 feet' },
                ],
                explanation: 'The small intestine is about 20 feet (6 meters) long in an adult.',
            },
            {
                question: 'Which organ produces bile?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: 'Stomach' },
                    { id: 'b', text: 'Liver', isCorrect: true },
                    { id: 'c', text: 'Gallbladder' },
                    { id: 'd', text: 'Pancreas' },
                ],
                explanation: 'The liver produces bile, which is stored in the gallbladder.',
            },
            {
                question: 'How long does food typically stay in the stomach?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: '30 minutes' },
                    { id: 'b', text: '2-4 hours', isCorrect: true },
                    { id: 'c', text: '8-10 hours' },
                    { id: 'd', text: '24 hours' },
                ],
                explanation: 'Food stays in the stomach for 2-4 hours depending on the meal composition.',
            },
            {
                question: 'The stomach produces hydrochloric acid.',
                type: 'true-false',
                points: 10,
                correctAnswer: 'true',
                explanation: 'The stomach produces HCl to break down food and kill bacteria.',
            },
            {
                question: 'Digestion begins in the stomach.',
                type: 'true-false',
                points: 10,
                correctAnswer: 'false',
                explanation: 'Digestion begins in the mouth with mechanical (chewing) and chemical (saliva) breakdown.',
            },
        ],
    },
    {
        title: 'Urinary System Basics',
        slug: 'urinary-system-basics',
        description: 'Learn about kidneys and the urinary system.',
        system: 'urinary',
        difficulty: 'beginner',
        timeLimit: 10,
        passingScore: 60,
        totalPoints: 50,
        isPublished: true,
        isActive: true,
        questions: [
            {
                question: 'How many kidneys does a healthy person have?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: '1' },
                    { id: 'b', text: '2', isCorrect: true },
                    { id: 'c', text: '3' },
                    { id: 'd', text: '4' },
                ],
                explanation: 'Most people have 2 kidneys, located on either side of the spine.',
            },
            {
                question: 'What is the functional unit of the kidney called?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: 'Neuron' },
                    { id: 'b', text: 'Nephron', isCorrect: true },
                    { id: 'c', text: 'Alveoli' },
                    { id: 'd', text: 'Capillary' },
                ],
                explanation: 'Nephrons are the functional units of the kidney - each kidney has about 1 million nephrons.',
            },
            {
                question: 'How much blood do the kidneys filter per day?',
                type: 'multiple-choice',
                points: 10,
                options: [
                    { id: 'a', text: '50 liters' },
                    { id: 'b', text: '100 liters' },
                    { id: 'c', text: '180 liters', isCorrect: true },
                    { id: 'd', text: '300 liters' },
                ],
                explanation: 'Kidneys filter about 180 liters of blood daily, producing 1-2 liters of urine.',
            },
            {
                question: 'The ureters carry urine from the kidneys to the bladder.',
                type: 'true-false',
                points: 10,
                correctAnswer: 'true',
                explanation: 'Each kidney has a ureter that transports urine to the urinary bladder.',
            },
            {
                question: 'Kidneys only filter waste from the blood.',
                type: 'true-false',
                points: 10,
                correctAnswer: 'false',
                explanation: 'Kidneys also regulate blood pressure, pH, electrolyte balance, and produce hormones.',
            },
        ],
    },
];

const modules = [
    {
        title: 'Introduction to Human Anatomy',
        slug: 'intro-human-anatomy',
        description: 'A comprehensive introduction to human body systems and anatomical terminology.',
        system: 'skeletal',
        difficulty: 'beginner',
        estimatedTime: 60,
        isActive: true,
        isPublished: true,
        order: 1,
        sections: [
            {
                title: 'Anatomical Terminology',
                order: 1,
                content: 'Learn the basic anatomical terms used to describe body positions, regions, and planes.',
            },
            {
                title: 'Body Systems Overview',
                order: 2,
                content: 'Introduction to the major organ systems of the human body.',
            },
        ],
        prerequisites: [],
    },
    {
        title: 'The Cardiovascular System',
        slug: 'cardiovascular-system',
        description: 'Deep dive into the heart, blood vessels, and circulatory system.',
        system: 'circulatory',
        difficulty: 'intermediate',
        estimatedTime: 90,
        isActive: true,
        isPublished: true,
        order: 2,
        sections: [
            {
                title: 'Heart Anatomy',
                order: 1,
                content: 'Detailed study of the heart structure, chambers, and valves.',
            },
            {
                title: 'Blood Circulation',
                order: 2,
                content: 'Understanding systemic and pulmonary circulation.',
            },
        ],
    },
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await AnatomyModel.deleteMany({});
        await Organ.deleteMany({});
        await Quiz.deleteMany({});
        await Module.deleteMany({});

        // Create users
        console.log('Creating users...');
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
        }
        console.log(`Created ${users.length} users`);

        // Create anatomy models
        console.log('Creating anatomy models...');
        await AnatomyModel.insertMany(anatomyModels);
        console.log(`Created ${anatomyModels.length} anatomy models`);

        // Create organs
        console.log('Creating organs...');
        await Organ.insertMany(organs);
        console.log(`Created ${organs.length} organs`);

        // Create quizzes
        console.log('Creating quizzes...');
        await Quiz.insertMany(quizzes);
        console.log(`Created ${quizzes.length} quizzes`);

        // Create modules
        console.log('Creating modules...');
        await Module.insertMany(modules);
        console.log(`Created ${modules.length} modules`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest Accounts:');
        console.log('  Admin: admin@anatomyar.com / admin123');
        console.log('  Student: john@student.edu / student123');
        console.log('  Student: jane@student.edu / student123');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
};

seedDatabase();
