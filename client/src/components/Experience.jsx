import { useRef } from 'react';
import useInView from '../hooks/useInView';
import './Experience.css';

export default function Experience({ experience }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <section id="experience" className={`experience${inView ? ' visible' : ''}`} ref={ref}>
      <div className="container">
        <p className="section-label">// experience</p>
        <h2 className="section-title">Professional work</h2>
        <p className="section-subtitle">
          Products I've owned and built as product owner and lead developer.
        </p>

        <div className="experience__list">
          {experience.map((job, i) => (
            <article
              className="experience-card"
              key={job.id}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <p className="experience-card__role">{job.role}</p>
              <h3 className="experience-card__company">{job.company}</h3>
              <p className="experience-card__summary">{job.summary}</p>
              <ul className="experience-card__points">
                {job.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
              <ul className="project-card__tags">
                {job.tags.map((t) => (
                  <li key={t} className="project-card__tag">{t}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
