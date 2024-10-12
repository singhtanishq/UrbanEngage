import React, { useState, useEffect, useMemo } from 'react';
import './Home.css';

const Home = () => {
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
          <a href='/issues' className="box normal">Issues</a>
          <a href='/dashboard' className="box double">Dashboard</a>
          <a href='/petitions' className="box normal">Petitions</a>
          <a href='/forums' className="box normal">Forums</a>
          <a href='/events' className="box normal">Events</a>
          <a href='/volunteers' className="box normal">Volunteers</a>
          <a href='/polls' className="box normal">Polls</a>
        </div>

        <div className="search-container">
          <input type="text" placeholder="Search..." />
        </div>
      </div>
    </div>
  );
};

export default Home;
