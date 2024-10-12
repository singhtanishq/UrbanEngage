import React, { useState, useEffect } from 'react';
import './Issues.css';
import upvoteIcon from '../assets/upvote.png';
import commentIcon from '../assets/comment.png';
import sendIcon from '../assets/send.png';

const Issues = () => {
    const [issues, setIssues] = useState([]);
    const [issueContent, setIssueContent] = useState('');
    const [category, setCategory] = useState('General');
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const [commentContent, setCommentContent] = useState('');
    const [currentIssueId, setCurrentIssueId] = useState(null);

    useEffect(() => {
        const fetchIssues = () => {
            fetch(`${process.env.REACT_APP_PORT_URL}/issues?sortBy=${sortBy}&order=${order}`)
                .then(res => res.json())
                .then(data => setIssues(data))
                .catch(err => console.error('Error fetching issues:', err));
        };

        fetchIssues();
    }, [sortBy, order]);

    const handleAddIssue = () => {
        if (issueContent.trim()) {
            const newIssue = { content: issueContent, category };

            fetch(`${process.env.REACT_APP_PORT_URL}/issues/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newIssue),
            })
                .then(() => {
                    setIssueContent('');
                    fetch(`${process.env.REACT_APP_PORT_URL}/issues?sortBy=${sortBy}&order=${order}`)
                        .then(res => res.json())
                        .then(data => setIssues(data))
                        .catch(err => console.error('Error fetching issues:', err));
                })
                .catch(err => console.error('Error adding issue:', err));
        }
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handleOrderChange = (e) => {
        setOrder(e.target.value);
    };

    const handleUpvote = (id) => {
        fetch(`${process.env.REACT_APP_PORT_URL}/issues/upvote/${id}`, {
            method: 'POST',
        })
            .then(() => {
                fetch(`${process.env.REACT_APP_PORT_URL}/issues?sortBy=${sortBy}&order=${order}`)
                    .then(res => res.json())
                    .then(data => setIssues(data))
                    .catch(err => console.error('Error fetching issues:', err));
            })
            .catch(err => console.error('Error upvoting issue:', err));
    };

    const handleAddComment = (issueId) => {
        if (commentContent.trim()) {
            const newComment = { author: 'Anonymous', content: commentContent };

            fetch(`${process.env.REACT_APP_PORT_URL}/issues/comment/${issueId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComment),
            })
                .then(() => {
                    setCommentContent('');
                    fetch(`${process.env.REACT_APP_PORT_URL}/issues?sortBy=${sortBy}&order=${order}`)
                        .then(res => res.json())
                        .then(data => setIssues(data))
                        .catch(err => console.error('Error fetching issues:', err));
                    setCurrentIssueId(null);
                })
                .catch(err => console.error('Error adding comment:', err));
        }
    };

    return (
        <div className="issues-container">
            <div className="issues-page-header">
                <h1 className="issues-page-title">Reported Issues</h1>
            </div>

            <div className="issues-add-container">
                <textarea
                    value={issueContent}
                    onChange={(e) => setIssueContent(e.target.value)}
                    placeholder="Describe the issue..."
                    className="issue-input-textarea"
                ></textarea>

                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="issue-category-select"
                >
                    <option value="General">General</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Safety">Safety</option>
                    <option value="Environment">Environment</option>
                </select>

                <button onClick={handleAddIssue} className="issue-submit-btn">
                    Report Issue
                </button>
            </div>

            <div className="issues-sort-filter">
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

            <div className="issues-list-container">
                <div className="issues-list">
                    {issues.map((issue, index) => (
                        <div key={index} className="issue-card">
                            <div className="issue-category-tag" style={{ backgroundColor: getCategoryColor(issue.category) }}>
                                {issue.category}
                            </div>
                            <h3 className="issue-card-title">{issue.content}</h3>
                            <p className="issue-card-status">Status: {issue.status}</p>
                            <div className="issue-card-upvotes">
                                <span>Upvotes {issue.upvotes}</span>
                                <img 
                                    src={upvoteIcon} 
                                    alt="Upvote" 
                                    onClick={() => handleUpvote(issue._id)} 
                                    className="upvote-icon" 
                                />
                            </div>

                            <p className="issue-card-date">
                                Reported on: {new Date(issue.createdAt).toLocaleDateString()}
                            </p>
                        
                            <h4>Comments</h4>
                            <div className="issue-comments">
                                <div className="comments-list">
                                    {issue.comments.length > 0 ? (
                                        issue.comments.map((comment, idx) => (
                                            <div key={idx} className="comment">
                                                <strong>{comment.author}:</strong> {comment.content}
                                                <p className="comment-timestamp">{new Date(comment.timestamp).toLocaleString()}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No comments yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="comment-form">
                                <img src={commentIcon} alt="Comment" className="comment-icon" />
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={currentIssueId === issue._id ? commentContent : ''}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    onFocus={() => setCurrentIssueId(issue._id)}
                                    className="comment-input"
                                />
                                <img 
                                    src={sendIcon} 
                                    alt="Send" 
                                    onClick={() => handleAddComment(issue._id)} 
                                    className="send-icon" 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const getCategoryColor = (category) => {
    switch (category) {
        case 'General': return '#3498db';
        case 'Infrastructure': return '#e67e22';
        case 'Safety': return '#2ecc71';
        case 'Environment': return '#9b59b6';
        default: return '#bdc3c7';
    }
};

export default Issues;
