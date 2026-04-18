import { useRef, useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useInView from '../hooks/useInView';
import './Projects.css';

const TABS = ['All', 'AI & ML', 'Finance & Quant', 'Games', 'WordPress', 'Tools & Web'];

export default function Projects({ projects }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [activeTab, setActiveTab] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(
    () =>
      activeTab === 'All'
        ? projects
        : projects.filter((p) => p.category === activeTab),
    [projects, activeTab]
  );

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => e.key === 'Escape' && setSelected(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <>
    <section id="projects" className={`projects${inView ? ' visible' : ''}`} ref={ref}>
      <div className="container">
        <p className="section-label">// projects</p>
        <h2 className="section-title">Things I've built</h2>
        <p className="section-subtitle">
          A selection of projects from my{' '}
          <a href="https://github.com/Isolaee" target="_blank" rel="noreferrer">
            GitHub
          </a>
          . Source code available for everything listed.
        </p>

        <div className="projects__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`projects__tab${activeTab === tab ? ' projects__tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="projects__tab-count">
                {tab === 'All'
                  ? projects.length
                  : projects.filter((p) => p.category === tab).length}
              </span>
            </button>
          ))}
        </div>

        <div className="projects__grid" key={activeTab}>
          {filtered.map((p, i) => (
            <article
              className="project-card"
              key={p.id}
              style={{ animationDelay: `${i * 0.06}s` }}
              onClick={() => setSelected(p)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelected(p)}
            >
              <div className="project-card__header">
                <FolderIcon />
                <div className="project-card__links" onClick={(e) => e.stopPropagation()}>
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noreferrer" title="Source code">
                      <GitHubIcon />
                    </a>
                  )}
                  {p.demo && (
                    <a href={p.demo} target="_blank" rel="noreferrer" title="Live demo">
                      <ExternalIcon />
                    </a>
                  )}
                </div>
              </div>
              <div className="project-card__category">{p.category}</div>
              <h3 className="project-card__title">{p.title}</h3>
              <p className="project-card__desc">{p.description}</p>
              <ul className="project-card__tags">
                {p.tags.map((t) => (
                  <li key={t} className="project-card__tag">{t}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

    </section>

      {selected && createPortal(
        <div className="project-modal__backdrop" onClick={() => setSelected(null)}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button className="project-modal__close" onClick={() => setSelected(null)} aria-label="Close">✕</button>

            <div className="project-modal__header">
              <FolderIcon />
              <span className="project-modal__category">{selected.category}</span>
            </div>

            <h2 className="project-modal__title">{selected.title}</h2>
            <div className="project-modal__desc">
              {Array.isArray(selected.longDescription)
                ? selected.longDescription.map((para, i) => <p key={i}>{para}</p>)
                : <p>{selected.longDescription ?? selected.description}</p>}
            </div>

            <ul className="project-card__tags project-modal__tags">
              {selected.tags.map((t) => (
                <li key={t} className="project-card__tag">{t}</li>
              ))}
            </ul>

            <div className="project-modal__actions">
              {selected.github && (
                <a href={selected.github} target="_blank" rel="noreferrer" className="btn btn-primary">
                  <GitHubIcon /> View on GitHub
                </a>
              )}
              {selected.demo && (
                <a href={selected.demo} target="_blank" rel="noreferrer" className="btn btn-secondary">
                  <ExternalIcon /> Live demo
                </a>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function FolderIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
