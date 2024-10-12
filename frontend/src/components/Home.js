import React, { useState, useEffect, useMemo } from 'react';
import './Home.css';

const Home = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  // Format the date with suffix for the day (e.g., 1st, 2nd, etc.)
  const getDayWithSuffix = (day) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  // Set the time every second
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

  // UseMemo for the slides array to prevent re-creating it on every render
  const slides = useMemo(() => [
    <>Stay engaged with your <span className="highlight-box">community</span>!</>,
    <>Upcoming <span className="highlight-box">events</span> are just a click away!</>,
    <>Share your <span className="highlight-box">voice</span> on issues and polls.</>,
    <>Join <span className="highlight-box">discussions</span> in our forums.</>
  ], []);

  // Handle the carousel slide interval
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Track the mouse movement
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

        {/* Carousel container for the slides */}
        <div className="carousel-container">
          {slides.map((slide, index) => (
            <div key={index} className={`carousel-slide ${index === currentSlideIndex ? 'active' : ''}`}>
              {slide}
            </div>
          ))}
        </div>

        {/* Navigation boxes */}
        <div className="main-container">
          <a href='/issues' className="box normal">Issues</a>
          <a href='/dashboard' className="box double">Dashboard</a>
          <a href='/petitions' className="box normal">Petitions</a>
          <a href='/forums' className="box normal">Forums</a>
          <a href='/events' className="box normal">Events</a>
          <a href='/volunteers' className="box normal">Volunteers</a>
          <a href='/polls' className="box normal">Polls</a>
        </div>

        {/* Search box */}
        <div className="search-container">
          <input type="text" placeholder="Search..." />
        </div>

        {/* Time display */}
        <div className="time-display">
          <p>Current Time: {currentTime}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
