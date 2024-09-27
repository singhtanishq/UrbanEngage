import React, { useState, useEffect } from 'react';
import './Volunteers.css';

const Volunteers = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [formVisible, setFormVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [newVolunteer, setNewVolunteer] = useState({
        name: '',
        email: '',
        category: '',
        experience: '',
        availability: ''
    });
    const [filterCategory, setFilterCategory] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');

    useEffect(() => {
        fetchVolunteers();
    }, [filterCategory, sortBy, order]);

    const fetchVolunteers = () => {
        let url = `${process.env.REACT_APP_BASE_URL}/volunteers?sortBy=${sortBy}&order=${order}`;
        if (filterCategory) url += `&category=${filterCategory}`;

        fetch(url)
            .then(res => res.json())
            .then(data => setVolunteers(data))
            .catch(err => console.error('Error fetching volunteers:', err));
    };

    const handleInputChange = (e) => {
        setNewVolunteer({
            ...newVolunteer,
            [e.target.name]: e.target.value
        });
        setErrorMessage('');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (newVolunteer.name.trim() && newVolunteer.email.trim()) {
            fetch('${process.env.REACT_APP_BASE_URL}/volunteers/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newVolunteer),
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setErrorMessage(data.error);
                    return;
                }
                setSuccessMessage('You have been successfully registered!');
                fetchVolunteers();
                setNewVolunteer({
                    name: '',
                    email: '',
                    category: '',
                    experience: '',
                    availability: ''
                });
                setTimeout(() => setSuccessMessage(''), 3000);
            })
            .catch(err => {
                console.error('Error registering volunteer:', err);
                setErrorMessage('An error occurred while registering. Please try again.');
            });
        }
    };

    return (
        <div className="volunteers-container">
            <div className="volunteers-title">Volunteers</div>

            {successMessage && <div className="success-message">{successMessage}</div>}
            {errorMessage && <div className="error-message">{errorMessage}</div>}

            <div className="controls">
                {formVisible ? (
                    <button onClick={() => setFormVisible(false)}>Back</button>
                ) : (
                    <>
                        <button onClick={() => setFormVisible(true)}>Register as Volunteer</button>
                        <div className="filter-sort">
                            <select onChange={e => setFilterCategory(e.target.value)} value={filterCategory}>
                                <option value="">All Categories</option>
                                <option value="Education">Education</option>
                                <option value="Community Service">Community Service</option>
                                <option value="Healthcare">Healthcare</option>
                            </select>

                            <select onChange={e => setSortBy(e.target.value)} value={sortBy}>
                                <option value="createdAt">Sort by Latest</option>
                                <option value="name">Sort A-Z</option>
                            </select>

                            <select onChange={e => setOrder(e.target.value)} value={order}>
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </>
                )}
        
            </div>
                
            {formVisible ? (
                <form className="volunteer-form" onSubmit={handleFormSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={newVolunteer.name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={newVolunteer.email}
                        onChange={handleInputChange}
                        required
                    />
                    <select name="category" onChange={handleInputChange} value={newVolunteer.category} required>
                        <option value="">Select a Category</option>
                        <option value="Education">Education</option>
                        <option value="Community Service">Community Service</option>
                        <option value="Healthcare">Healthcare</option>
                    </select>
                    <textarea
                        name="experience"
                        placeholder="Previous Experience"
                        value={newVolunteer.experience}
                        onChange={handleInputChange}
                        style={{ resize: 'none' }}
                        maxLength={200}
                    />
                    <input
                        type="text"
                        name="availability"
                        placeholder="Availability (e.g., weekends, evenings)"
                        value={newVolunteer.availability}
                        onChange={handleInputChange}
                        required
                    />
                    <button type="submit">Register</button>
                </form>
            ) : (
                <div className="volunteers-list-container">
                    <div className="volunteers-list">
                        {volunteers.length === 0 ? (
                            <div className="no-volunteers-message">No volunteers found.</div>
                        ) : (
                            <ul>
                                {volunteers.map((volunteer) => (
                                    <li key={volunteer._id}>
                                        <div className="volunteer-details">
                                            <strong>{volunteer.name}</strong>
                                            <br />
                                            <span className="volunteer-registered-on">Registered on: {new Date(volunteer.createdAt).toLocaleDateString()}</span>
                                            <div className="volunteer-tag-container">
                                                <span className={`volunteer-tag category-${volunteer.category.toLowerCase().replace(/ /g, '-')}`}>
                                                    {volunteer.category}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Volunteers;
