import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About Aveo Cafe</h1>
        <p>Where passion meets perfection</p>
      </div>
      
      <div className="about-content">
        <section className="story-section">
          <h2>Our Story</h2>
          <p>
            Founded in 2024, Aveo Cafe has been serving the community with the finest coffee
            and delicious food. Our journey began with a simple mission: to create a space
            where people can enjoy quality coffee in a comfortable environment.
          </p>
        </section>

        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <h3>Quality</h3>
              <p>We source the finest ingredients and maintain high standards in everything we do.</p>
            </div>
            <div className="value-item">
              <h3>Community</h3>
              <p>We believe in creating a welcoming space for everyone in our community.</p>
            </div>
            <div className="value-item">
              <h3>Sustainability</h3>
              <p>We're committed to environmentally responsible practices.</p>
            </div>
          </div>
        </section>

        <section className="team-section">
          <h2>Our Team</h2>
          <p>
            Our team of passionate baristas and chefs work together to create
            the perfect experience for our customers. Each member brings their
            unique expertise and dedication to making Aveo Cafe special.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About; 