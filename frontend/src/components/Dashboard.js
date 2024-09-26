import React, { useEffect, useState, useMemo } from 'react';
import './Dashboard.css';

const Dashboard = () => {
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

    const randomizeStats = () => {
        return {
            userCount: Math.floor(Math.random() * 10000) + 1000,
            eventCount: Math.floor(Math.random() * 100) + 10,
            petitionCount: Math.floor(Math.random() * 50) + 5,
            issueCount: Math.floor(Math.random() * 100) + 20,
            volunteerCount: Math.floor(Math.random() * 500) + 50,
        };
    };

    const animateStats = (id, endValue) => {
        let startValue = 0;
        const duration = 2000;
        const increment = Math.ceil(endValue / (duration / 100));
        const element = document.getElementById(id);

        const counter = setInterval(() => {
            startValue += increment;
            if (startValue >= endValue) {
                clearInterval(counter);
                element.innerText = endValue;
            } else {
                element.innerText = startValue;
            }
        }, 100);
    };

    useEffect(() => {
        const randomStats = randomizeStats();

        animateStats('userCount', randomStats.userCount);
        animateStats('eventCount', randomStats.eventCount);
        animateStats('petitionCount', randomStats.petitionCount);
        animateStats('issueCount', randomStats.issueCount);
        animateStats('volunteerCount', randomStats.volunteerCount);
    }, []);

    const recentActivities = useMemo(() => [
        { title: 'User Registered', description: 'John Doe just registered.' },
        { title: 'New Post', description: 'New post: "City Cleanup Event Recap".' },
        { title: 'Event Created', description: 'A new event: "Tree Plantation Drive".' },
        { title: 'Petition Signed', description: '500 signatures on "Better Public Transport".' },
        { title: 'Issue Reported', description: 'New issue: "Potholes on Main Street".' },
        { title: 'Volunteer Joined', description: 'Volunteer "Alice" signed up for the beach cleanup.' },
        { title: 'Event Updated', description: 'Event: "Park Renovation" has been rescheduled.' },
        { title: 'New Forum Post', description: 'Post: "Urban Garden Initiative" created.' },
        { title: 'User Registered', description: 'Jane Smith just registered.' },
        { title: 'New Petition Created', description: 'Petition: "Increase Recycling Bins" created.' },
        { title: 'Post Commented', description: 'John Doe commented on "City Transport Improvements".' },
        { title: 'Event Cancelled', description: 'Event: "Beach Cleanup" was cancelled.' },
        { title: 'Issue Resolved', description: 'Potholes on Main Street have been fixed.' },
        { title: 'Forum Post Liked', description: 'Post: "Green Energy Solutions" liked by 10 users.' },
        { title: 'User Registered', description: 'Robert Green just registered.' }
    ], []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentActivityIndex((prevIndex) =>
                (prevIndex + 1) % (recentActivities.length - 3)
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [recentActivities]);

    return (
        <div className="dashboard">
            <div className="dashboard-title">Dashboard</div>
            <div className="stats-container">
                <div className="stat-box pulse">
                    <div className="stat-value" id="userCount">0</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-box pulse">
                    <div className="stat-value" id="eventCount">0</div>
                    <div className="stat-label">Total Events</div>
                </div>
                <div className="stat-box pulse">
                    <div className="stat-value" id="petitionCount">0</div>
                    <div className="stat-label">Total Petitions</div>
                </div>
                <div className="stat-box pulse">
                    <div className="stat-value" id="issueCount">0</div>
                    <div className="stat-label">Total Issues</div>
                </div>
                <div className="stat-box pulse">
                    <div className="stat-value" id="volunteerCount">0</div>
                    <div className="stat-label">Total Volunteers</div>
                </div>
            </div>
            <br></br>
            <div className="recent-activities-title">Recent Activities</div>
            <div className="activity-feed">
                <div
                    className="activity-slider"
                    style={{
                        transform: `translateX(-${currentActivityIndex * 100}%)`,
                    }}
                >
                    {recentActivities.map((item, index) => (
                        <div key={index} className="activity-item">
                            <div className="activity-title">{item.title}</div>
                            <div className="activity-description">{item.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
