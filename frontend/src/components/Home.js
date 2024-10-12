import React, { useState, useEffect, useMemo } from 'react';

const Home = () => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const slides = useMemo(() => [
    <>Stay engaged with your <span className="highlight-box">community</span>!</>,
    <>Upcoming <span className="highlight-box">events</span> are just a click away!</>,
    <>Share your <span className="highlight-box">voice</span> on issues and polls.</>,
    <>Join <span className="highlight-box">discussions</span> in our forums.</>
  ], []);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  return (
    <div className="home-container">
      <div className="time-display">
        <p>Current Time: {currentTime}</p>
      </div>
      <div className="slide-show">
        <h2>Announcements</h2>
        <div className="slide">{slides[currentSlideIndex]}</div>
      </div>
      <div className="other-content">
        <h3>Welcome to Our Platform!</h3>
        <p>Stay updated and connect with the community.</p>
      </div>
    </div>
  );
};

export default Home;
