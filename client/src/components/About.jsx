import { useRef } from 'react';
import useInView from '../hooks/useInView';
import './About.css';

const AVATAR = 'https://avatars.githubusercontent.com/u/134635378?v=4';

export default function About({ profile }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <section id="about" className={`about${inView ? ' visible' : ''}`} ref={ref}>
      <div className="container about__inner">
        <div className="about__text">
          <p className="section-label">// about me</p>
          <h2 className="section-title">A bit about myself</h2>
          <p className="about__para">
            Software developer based in Finland, open to work. I build across the full
            stack — from Rust TCP game servers and Python ML pipelines to React frontends
            and cloud deployments. I reach for the right tool rather than a favourite one.
          </p>
          <p className="about__para">
            Recent projects span AI agents, computer vision, game development, and
            financial modelling. I believe code is just a tool: what matters is the
            problem you're solving and how well you solve it.
          </p>
          <div className="about__actions">
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="btn btn-outline">
                <MailIcon /> {profile.email}
              </a>
            )}
            {profile?.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn btn-outline">
                <LinkedInIcon /> LinkedIn
              </a>
            )}
          </div>
        </div>

        <div className="about__right">
          <div className="about__avatar-wrap">
            <img
              src={AVATAR}
              alt="Eero Isola"
              className="about__avatar"
              width="240"
              height="240"
            />
          </div>
          <div className="about__stat-grid">
            {[
              { value: '32', label: 'GitHub repositories' },
              { value: '5+', label: 'Languages used' },
              { value: 'AI', label: 'Current focus' },
              { value: 'FI', label: 'Based in Finland' },
            ].map((s) => (
              <div className="about__stat" key={s.label}>
                <span className="about__stat-value">{s.value}</span>
                <span className="about__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
