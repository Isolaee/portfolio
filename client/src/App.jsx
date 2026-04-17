import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => setProfile({
        name: 'Eero Isola',
        title: 'Software Developer',
        email: 'eero.isola@gmail.com',
        github: 'https://github.com/Isolaee',
        linkedin: 'https://www.linkedin.com/in/eero-isola-78b8561b5/',
        bio: 'Software developer open to work. Code is just a tool. Learn, build, repeat.',
      }));

    fetch('/api/projects')
      .then((r) => r.json())
      .then(setProjects)
      .catch(() => setProjects([]));

    fetch('/api/posts')
      .then((r) => r.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  return (
    <>
      <Navbar name={profile?.name} />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <Skills />
        <Projects projects={projects} />
        <Blog posts={posts} />
        <Contact profile={profile} />
      </main>
      <Footer profile={profile} />
    </>
  );
}

export default App;
