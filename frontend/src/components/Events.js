import React, { useEffect, useState } from 'react';
import './Events.css';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');

    useEffect(() => {
        fetchEvents();
    }, [sortBy, order]);

    const fetchEvents = () => {
        fetch(`http://localhost:5000/events?sortBy=${sortBy}&order=${order}`)
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(err => console.error('Error fetching events:', err));
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handleOrderChange = (e) => {
        setOrder(e.target.value);
    };

    const handleRSVP = (id) => {
        fetch(`http://localhost:5000/events/rsvp/${id}`, {
            method: 'POST',
        })
            .then(() => fetchEvents())
            .catch(err => console.error('Error RSVPing:', err));
    };

    return (
        <div className="events-page">
            <h1 className="page-title">Upcoming Events</h1>

            <div className="sort-filter">
                <label>
                    Sort By:
                    <select value={sortBy} onChange={handleSortChange}>
                        <option value="content">A-Z</option>
                        <option value="createdAt">Date</option>
                    </select>
                </label>

                <label>
                    Order:
                    <select value={order} onChange={handleOrderChange}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </label>
            </div>

            <div className="events-list-container">
                <div className="events-list">
                    {events.map((event, index) => (
                        <div key={index} className="event-card">
                            <h3>{event.content}</h3>
                            <p>Date: {new Date(event.createdAt).toLocaleDateString()}</p>
                            <p>{event.attendees} attending</p>
                            <button onClick={() => handleRSVP(event._id)} className="rsvp-button">RSVP</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Events;
