import React, { useState, useEffect } from 'react';
import './Polls.css';

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [newPoll, setNewPoll] = useState({
    description: '',
    category: 'General',
    options: ['', ''],
  });
  const [optionCount, setOptionCount] = useState(2);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = () => {
    fetch('${process.env.REACT_APP_BASE_URL}/polls')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        setPolls(data);
      })
      .catch(err => console.error('Error fetching polls:', err));
  };

  const handlePollChange = (e) => {
    setNewPoll({
      ...newPoll,
      [e.target.name]: e.target.value,
    });
  };

  const handleOptionChange = (index, e) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = e.target.value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  const addOption = () => {
    if (optionCount < 5) {
      setOptionCount(optionCount + 1);
      setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
    }
  };

  const createPoll = () => {
    if (
      !newPoll.description.trim() ||
      !newPoll.category.trim() ||
      newPoll.options.some(option => option.trim() === '')
    ) {
      setError('Please fill all the fields to create a poll.');
      return;
    }
    setError('');

    fetch('${process.env.REACT_APP_BASE_URL}/polls/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPoll),
    })
      .then(() => {
        setNewPoll({ description: '', category: 'General', options: ['', ''] });
        setOptionCount(2);
        fetchPolls();
      })
      .catch(err => console.error('Error creating poll:', err));
  };

  const vote = (pollId, optionIndex) => {
    fetch(`${process.env.REACT_APP_BASE_URL}/polls/vote/${pollId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ optionIndex }),
    })
      .then(() => fetchPolls())
      .catch(err => console.error('Error voting:', err));
  };

  const calculateVotePercentage = (votes, totalVotes) => {
    return totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'General':
        return '#3498db';
      case 'Technology':
        return '#e67e22';
      case 'Health':
        return '#2ecc71';
      case 'Education':
        return '#9b59b6';
      default:
        return '#bdc3c7';
    }
  };

  return (
    <div className="polls-page">
      <div className="polls-form-container">
        <h2>Create a New Poll</h2>
        <div className="polls-form">
          {error && <p className="error-message">{error}</p>}
          <div className="polls-inputs-container"> 
            <textarea
              type="text"
              name="description"
              value={newPoll.description}
              placeholder="Description"
              onChange={handlePollChange}
              className="polls-description"
            ></textarea>
            <select
              name="category"
              value={newPoll.category}
              onChange={handlePollChange}
              className="polls-category"
            >
              <option value="General">General</option>
              <option value="Technology">Technology</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
            </select>
          </div>
          <div className="polls-options">
            {newPoll.options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e)}
                placeholder={`Option ${index + 1}`}
                className="polls-option-input"
              />
            ))}
            {optionCount < 5 && (
              <button onClick={addOption} className="polls-add-option">
                Add
              </button>           
            )}
          </div>
          <button onClick={createPoll} className="polls-create-btn">Create Poll</button>
        </div>
      </div>

      <div className="polls-list-container">
        <h2>Available Polls</h2>
        <br />
        <div className="polls-list">
          {Array.isArray(polls) && polls.map((poll, index) => {
            const totalVotes = poll.votes.reduce((sum, vote) => sum + vote, 0);

            return (
              <div key={index} className="polls-item">
                <div className="poll-header">
                  <h3>{poll.description}</h3>
                  <span
                    className="poll-category-box"
                    style={{ backgroundColor: getCategoryColor(poll.category) }}
                  >
                    {poll.category}
                  </span>
                </div>
                <p className="poll-vote-count">{totalVotes} voted</p>
                <div className="polls-options-list">
                  {Array.isArray(poll.options) && poll.options.map((option, idx) => {
                    const percentage = calculateVotePercentage(poll.votes[idx], totalVotes);
                    return (
                      <div key={idx} className="polls-option">
                        <button className="polls-button" onClick={() => vote(poll._id, idx)}>{option}</button>
                        <div className="polls-vote-bar">
                          <div
                            className="polls-vote-fill"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="polls-vote-percentage">{percentage.toFixed(2)}%</span>
                      </div>
                    );
                  })}
                </div>
                <hr className="poll-divider" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Polls;
