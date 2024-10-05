import React, { useEffect, useState } from 'react';
import './Forums.css';

const Forums = () => {
    const [forums, setForums] = useState([]);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        fetchForums();
    }, []);

    const fetchForums = () => {
        fetch(`${process.env.REACT_APP_PORT_URL}/forums`)
            .then(res => res.json())
            .then(data => setForums(data))
            .catch(err => console.error('Error fetching forums:', err));
    };

    const handlePostSubmit = (e) => {
        e.preventDefault();
        const newPost = { title, author, content };

        fetch(`${process.env.REACT_APP_PORT_URL}/forums/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPost),
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to add thread');
                }
                return res.json();
            })
            .then(() => {
                fetchForums();
                setTitle('');
                setAuthor('');
                setContent('');
            })
            .catch(err => {
                console.error('Error posting thread:', err);
            });
    };

    return (
        <div className="forums">
            <div className="forums-container">
                <div className="post-thread-container">
                    <h2>Post a New Thread</h2>
                    <form onSubmit={handlePostSubmit}>
                        <div className="input-group">
                            <input
                                className="input-title"
                                type="text"
                                placeholder="Thread Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                className="input-author"
                                type="text"
                                placeholder="Your Name"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <textarea
                                className="input-content"
                                placeholder="Your Post"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit">Post</button>
                    </form>
                </div>
                <div className="discussion-container">
                    <div className="discussion-header">
                        <h2>Discussions</h2>
                    </div>
                    <div className="discussion-content">
                        {forums.map((forum, index) => (
                            forum.content === "Discussions" && forum.threads.map((thread, tIndex) => (
                                <div key={tIndex} className="thread">
                                    <h3>{thread.title}</h3>
                                    {thread.posts.map((post, pIndex) => (
                                        <div key={pIndex} className="post">
                                            <strong>{post.author}:</strong> {post.content}
                                        </div>
                                    ))}
                                </div>
                            ))
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Forums;
