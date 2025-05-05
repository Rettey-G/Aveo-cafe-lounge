import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About Aveo Cafe & Lounge</h1>
        <p>Where passion meets perfection</p>
      </div>
      
      <div className="about-container">
        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            Founded in 2024, Aveo Cafe & Lounge has been serving the community with the finest coffee
            and creating memorable experiences for our guests. Our journey began with a simple vision:
            to create a space where people can enjoy exceptional coffee, delicious food, and warm hospitality.
          </p>
        </section>

        <section className="about-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Quality</h3>
              <p>We source the finest ingredients and maintain the highest standards in everything we serve.</p>
            </div>
            <div className="value-card">
              <h3>Community</h3>
              <p>We believe in creating a welcoming space where everyone feels at home.</p>
            </div>
            <div className="value-card">
              <h3>Sustainability</h3>
              <p>We are committed to environmentally responsible practices and supporting local producers.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Team</h2>
          <p>
            Our team of passionate baristas and staff members brings their
            unique expertise and dedication to making Aveo Cafe & Lounge special.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About; 