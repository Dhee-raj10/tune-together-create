
import React from "react";
import { Navbar } from "@/components/Navbar";

const About = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">About TuneTogether</h1>
        
        <div className="prose prose-lg">
          <p className="mb-4">
            TuneTogether is a collaborative platform for musicians to create, share, and collaborate on music projects together.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p className="mb-4">
            We believe in the power of music to bring people together. Our mission is to create 
            a space where musicians of all backgrounds and skill levels can connect, collaborate, 
            and create beautiful music together.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Features</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Create solo or collaborative music projects</li>
            <li>Upload and share tracks with collaborators</li>
            <li>Find musicians based on their instruments and skills</li>
            <li>Collaborate in real-time on music projects</li>
            <li>Build your musical portfolio and connect with like-minded artists</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Join Our Community</h2>
          <p className="mb-4">
            Whether you're a vocalist looking for a producer, a guitarist seeking a drummer, 
            or a composer looking for performers, TuneTogether helps you connect with the right 
            people to bring your musical vision to life.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
