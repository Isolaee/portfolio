import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { profile } from './data/profile';
import { experience } from './data/experience';
import { projects } from './data/projects';
import { posts } from './data/posts';
import './App.css';

function App() {
  return (
    <>
      <Navbar name={profile.name} />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <Experience experience={experience} />
        <Projects projects={projects} />
        <Skills />
        <Blog posts={posts} />
        <Contact profile={profile} />
      </main>
      <Footer profile={profile} />
    </>
  );
}

export default App;
