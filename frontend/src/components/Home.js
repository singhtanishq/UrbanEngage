import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const getDayWithSuffix = (day) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const day = getDayWithSuffix(now.getDate());
      const month = now.toLocaleString('default', { month: 'long' });
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const time = `${hours}:${minutes} UTC`;
      const formattedDateTime = `${day} ${month}, ${year} ${time}`;

      setCurrentTime(formattedDateTime);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const slides = useMemo(() => [
    <>Stay engaged with your <span className="highlight-box">community</span>!</>,
    <>Upcoming <span className="highlight-box">events</span> are just a click away!</>,
    <>Share your <span className="highlight-box">voice</span> on issues and polls.</>,
    <>Join <span className="highlight-box">discussions</span> in our forums.</>
  ], []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, [slides.length]);

  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div
      className="home-container"
      onMouseMove={handleMouseMove}
      style={{ '--x': `${mousePosition.x}%`, '--y': `${mousePosition.y}%` }}
    >
      <div className="home-content">
        <h2>Welcome to <span className="urban-engage-title">Urban Engage</span></h2>
        <p className="home-tagline"><strong>Your platform for community engagement and local governance.</strong></p>

        <div className="carousel-container">
          {slides.map((slide, index) => (
            <div key={index} className={`carousel-slide ${index === currentSlideIndex ? 'active' : ''}`}>
              {slide}
            </div>
          ))}
        </div>

        <div className="main-container">
          <Link to='/issues' className="box normal">Issues</Link>
          <Link to='/dashboard' className="box double">Dashboard</Link>
          <Link to='/petitions' className="box normal">Petitions</Link>
          <Link to='/forums' className="box normal">Forums</Link>
          <Link to='/events' className="box normal">Events</Link>
          <Link to='/volunteers' className="box normal">Volunteers</Link>
          <Link to='/polls' className="box normal">Polls</Link>
        </div>

        <div className="search-container">
          <input type="text" placeholder="Search..." />
        </div>

        <div className="time-display">
          <p>{currentTime}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
