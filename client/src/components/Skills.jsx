import { useRef } from 'react';
import useInView from '../hooks/useInView';
import './Skills.css';

const SKILL_GROUPS = [
  {
    category: 'Languages',
    skills: ['Python', 'Rust', 'TypeScript', 'JavaScript','PHP', 'R'],
  },
  {
    category: 'AI & ML',
    skills: ['PyTorch','Tensorflow', 'Ollama', 'YOLOv8', 'InsightFace', 'LSTM', 'Transformers'],
  },
  {
    category: 'Web & Backend',
    skills: ['React', 'Node.js', 'Express', 'REST APIs', 'WordPress', 'WooCommerce','Shopify'],
  },
  {
    category: 'Tools & Infra',
    skills: ['Docker', 'PostgreSQL','SQLite', 'Redis', 'Traefik', 'GitHub Actions', 'GCP Vertex AI', 'Git'],
  },
];

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <section id="skills" className={`skills${inView ? ' visible' : ''}`} ref={ref}>
      <div className="container">
        <p className="section-label">// skills</p>
        <h2 className="section-title">What I work with</h2>
        <p className="section-subtitle">
          A selection of technologies I reach for when building products.
        </p>
        <div className="skills__grid">
          {SKILL_GROUPS.map((group, gi) => (
            <div
              className="skills__group"
              key={group.category}
              style={{ animationDelay: `${gi * 0.1}s` }}
            >
              <h3 className="skills__category">{group.category}</h3>
              <ul className="skills__list">
                {group.skills.map((s) => (
                  <li key={s} className="skills__item">
                    <span className="skills__bullet" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
