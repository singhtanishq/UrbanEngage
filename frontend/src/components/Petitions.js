import React, { useState, useEffect } from 'react';
import './Petitions.css';
import signIcon from '../assets/sign.png';

const Petitions = () => {
    const [petitions, setPetitions] = useState([]);
    const [petitionContent, setPetitionContent] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');

    useEffect(() => {
        const fetchPetitions = () => {
            fetch(`${process.env.REACT_APP_PORT_URL}/petitions?sortBy=${sortBy}&order=${order}`)
                .then(res => res.json())
                .then(data => setPetitions(data))
                .catch(err => console.error('Error fetching petitions:', err));
        };

        fetchPetitions();
    }, [sortBy, order]);

    const handleAddPetition = () => {
        if (petitionContent.trim()) {
            const newPetition = { content: petitionContent };

            fetch(`${process.env.REACT_APP_PORT_URL}/petitions/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPetition),
            })
                .then(() => {
                    setPetitionContent('');
                    fetch(`${process.env.REACT_APP_PORT_URL}/petitions?sortBy=${sortBy}&order=${order}`)
                        .then(res => res.json())
                        .then(data => setPetitions(data))
                        .catch(err => console.error('Error fetching petitions:', err));
                })
                .catch(err => console.error('Error adding petition:', err));
        }
    };

    const handleSignPetition = (id) => {
        fetch(`${process.env.REACT_APP_PORT_URL}/petitions/sign/${id}`, {
            method: 'POST',
        })
            .then(() => {
                fetch(`${process.env.REACT_APP_PORT_URL}/petitions?sortBy=${sortBy}&order=${order}`)
                    .then(res => res.json())
                    .then(data => setPetitions(data))
                    .catch(err => console.error('Error fetching petitions:', err));
            })
            .catch(err => console.error('Error signing petition:', err));
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handleOrderChange = (e) => {
        setOrder(e.target.value);
    };

    return (
        <div className="petitions-container">
            <div className="petitions-header">
                <h1 className="petitions-title">Petitions</h1>
            </div>

            <div className="petition-add-container">
                <textarea
                    value={petitionContent}
                    onChange={(e) => setPetitionContent(e.target.value)}
                    placeholder="Describe the petition..."
                    className="petition-input"
                ></textarea>

                <button onClick={handleAddPetition} className="petition-submit-btn">
                    Add Petition
                </button>
            </div>

            <div className="petitions-sort-filter">
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

            <div className="petitions-list-container">
                <div className="petitions-list">
                    {petitions.map((petition, index) => (
                        <div key={index} className="petition-card">
                            <h3 className="petition-content">{petition.content}</h3>
                            <p className="petition-signatures">Signatures {petition.signatures}</p>

                            <button onClick={() => handleSignPetition(petition._id)} className="sign-btn">
                                <img src={signIcon} alt="Sign Petition" className="sign-icon" /> Sign Petition
                            </button>

                            <p className="petition-date">Created on {new Date(petition.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Petitions;
