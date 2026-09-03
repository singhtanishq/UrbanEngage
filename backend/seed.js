/**
 * Seeds the local database with realistic demo data.
 * Usage: node seed.js  (add --reset to wipe collections first)
 */
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/accounts.model');
const Issue = require('./models/issues.model');
const Event = require('./models/events.model');
const Petition = require('./models/petitions.model');
const Poll = require('./models/polls.model');
const Volunteer = require('./models/volunteers.model');
const Forum = require('./models/forums.model');

const days = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/UrbanEngageDB');
    console.log('Connected. Seeding...');

    if (process.argv.includes('--reset')) {
        await Promise.all([
            User.deleteMany({}), Issue.deleteMany({}), Event.deleteMany({}),
            Petition.deleteMany({}), Poll.deleteMany({}), Volunteer.deleteMany({}), Forum.deleteMany({}),
        ]);
        console.log('Existing collections cleared.');
    }

    if (await User.countDocuments() === 0) {
        await User.create({
            name: 'Demo Citizen',
            email: 'demo@urbanengage.dev',
            password: await bcrypt.hash('demopass123', 10),
        });
    }

    if (await Issue.countDocuments() === 0) {
        await Issue.create([
            { content: 'Potholes on Main Street damaging vehicles near the 4th avenue crossing', category: 'Infrastructure', author: 'Riya Sharma', status: 'In Progress', upvotes: 42, comments: [{ author: 'City Works', content: 'Crew scheduled for Friday morning. Thank you for reporting!' }] },
            { content: 'Street lights out along Riverside Park pathway — unsafe after dusk', category: 'Safety', author: 'Marcus Lee', upvotes: 31, comments: [{ author: 'Priya N.', content: 'Noticed this too on my evening run.' }] },
            { content: 'Overflowing garbage bins at the Central Market every weekend', category: 'Environment', author: 'Anonymous', upvotes: 27 },
            { content: 'Broken swing in the children\'s playground at Oakwood Park', category: 'Infrastructure', author: 'Elena Petrova', status: 'Resolved', upvotes: 19, comments: [{ author: 'Parks Dept', content: 'Replaced on Monday. Thanks for the report!' }] },
            { content: 'Need a pedestrian crossing near the new school on Elm Street', category: 'Safety', author: 'David Kim', upvotes: 55 },
        ]);
    }

    if (await Event.countDocuments() === 0) {
        await Event.create([
            { content: 'Community Tree Plantation Drive', description: 'Join 200+ neighbours in planting native saplings along the riverfront. Gloves and saplings provided.', location: 'Riverfront Park, Gate 3', category: 'Environment', date: days(6), attendees: 87 },
            { content: 'Town Hall: Budget Priorities 2027', description: 'Share your input on next year\'s city budget with council members.', location: 'City Hall Assembly Room', category: 'Governance', date: days(12), attendees: 143 },
            { content: 'Neighbourhood Cleanup Morning', description: 'Two-hour cleanup of the market district followed by free breakfast.', location: 'Central Market Square', category: 'Community', date: days(3), attendees: 56 },
            { content: 'Free Health & Wellness Camp', description: 'Free check-ups, dental screening, and yoga sessions open to all residents.', location: 'Community Centre, Hall B', category: 'Health', date: days(20), attendees: 34 },
        ]);
    }

    if (await Petition.countDocuments() === 0) {
        await Petition.create([
            { content: 'Better Public Transport on Route 12', description: 'We request the city increase evening bus frequency on Route 12 to every 15 minutes.', goal: 500, signatures: 342, deadline: days(30) },
            { content: 'Install Solar Panels on All Public Schools', description: 'Proposal to fund rooftop solar installations across the district\'s 14 public schools.', goal: 1000, signatures: 761 },
            { content: 'More Recycling Bins in Downtown', description: 'Add paired recycling bins next to every public waste bin downtown.', goal: 250, signatures: 187 },
        ]);
    }

    if (await Poll.countDocuments() === 0) {
        await Poll.create([
            { description: 'What should the vacant lot on 5th Street become?', category: 'General', options: ['Community garden', 'Public library', 'Skate park', 'Affordable housing'], votes: [84, 67, 45, 112] },
            { description: 'Preferred timing for the weekend farmers market', category: 'General', options: ['Saturday morning', 'Sunday morning', 'Saturday evening'], votes: [156, 89, 40] },
            { description: 'Should the city adopt e-bike sharing?', category: 'Technology', options: ['Yes', 'No', 'Need more study'], votes: [201, 34, 77] },
        ]);
    }

    if (await Volunteer.countDocuments() === 0) {
        await Volunteer.create([
            { name: 'Alice Johnson', email: 'alice.j@example.com', category: 'Education', experience: 'Tutored maths at the community centre for 2 years.', availability: 'Weekends' },
            { name: 'Rohit Verma', email: 'rohit.v@example.com', category: 'Healthcare', experience: 'Certified first-aid volunteer with the Red Cross.', availability: 'Weekday evenings' },
            { name: 'Maria Gonzalez', email: 'maria.g@example.com', category: 'Community Service', experience: 'Organised 6 neighbourhood cleanup drives.', availability: 'Sundays' },
            { name: 'Sam O\'Neill', email: 'sam.o@example.com', category: 'Education', experience: '', availability: 'Flexible' },
        ]);
    }

    if (await Forum.countDocuments() === 0) {
        await Forum.create({
            content: 'Discussions',
            threads: [
                {
                    title: 'Ideas for the old railway yard?',
                    postedAt: days(-2),
                    posts: [
                        { author: 'Nina Patel', content: 'The city is asking for community proposals before Q1. What would you love to see there?' },
                        { author: 'Tom Becker', content: 'A mix of green space and a covered market would serve everyone.' },
                        { author: 'Fatima Noor', content: 'Plus housing near the transit stop — that corner is perfect for it.' },
                    ],
                },
                {
                    title: 'Weekly runners group — routes that avoid Main St construction?',
                    postedAt: days(-1),
                    posts: [
                        { author: 'Jordan Blake', content: 'We usually do the 6am loop but the footpath is closed. Alternatives?' },
                        { author: 'Sofia Rossi', content: 'The riverfront trail adds 1km but is fully open and prettier anyway.' },
                    ],
                },
                {
                    title: 'How do I request a new waste bin for my street?',
                    postedAt: days(-4),
                    posts: [
                        { author: 'Grace Liu', content: 'Report it under Issues with the Environment category — public works responds within a week.' },
                    ],
                },
            ],
        });
    }

    const counts = {
        users: await User.countDocuments(),
        issues: await Issue.countDocuments(),
        events: await Event.countDocuments(),
        petitions: await Petition.countDocuments(),
        polls: await Poll.countDocuments(),
        volunteers: await Volunteer.countDocuments(),
        forums: await Forum.countDocuments(),
    };
    console.log('Seed complete:', counts);
    await mongoose.connection.close();
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
