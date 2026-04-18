import { useRef, useState } from 'react';
import useInView from '../hooks/useInView';
import './Blog.css';

export default function Blog({ posts }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <section id="blog" className={`blog${inView ? ' visible' : ''}`} ref={ref}>
      <div className="container">
        <p className="section-label">// blog</p>
        <h2 className="section-title">Writing</h2>
        <p className="section-subtitle">
          Notes on things I've built, learned, or found interesting.
        </p>

        {posts.length === 0 && (
          <div className="blog__empty">
            <span className="blog__empty-icon">✏️</span>
            <p className="blog__empty-title">No posts yet</p>
            <p className="blog__empty-hint">
              To add a post, open <code>server/src/index.js</code> and append an entry
              to the <code>posts</code> array in the <code>/api/posts</code> handler.
            </p>
            <pre className="blog__empty-code">{`{
  id:       1,
  slug:     'my-first-post',
  title:    'Post title',
  excerpt:  'Short summary shown in the card.',
  date:     'YYYY-MM-DD',
  readTime: '5 min',
  tags:     ['Tag1', 'Tag2'],
}`}</pre>
          </div>
        )}

        <div className="blog__list">
          {posts.map((post, i) => (
            <article
              key={post.id}
              className={`blog-card${expanded === post.id ? ' blog-card--open' : ''}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <button
                className="blog-card__header"
                onClick={() => toggle(post.id)}
                aria-expanded={expanded === post.id}
              >
                <div className="blog-card__meta">
                  <time className="blog-card__date">{formatDate(post.date)}</time>
                  <span className="blog-card__read-time">{post.readTime} read</span>
                </div>
                <div className="blog-card__title-row">
                  <h3 className="blog-card__title">{post.title}</h3>
                  <ChevronIcon open={expanded === post.id} />
                </div>
                <ul className="blog-card__tags">
                  {post.tags.map((t) => (
                    <li key={t} className="blog-card__tag">{t}</li>
                  ))}
                </ul>
              </button>

              <div className="blog-card__body" aria-hidden={expanded !== post.id}>
                <p className="blog-card__excerpt">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`blog-card__chevron${open ? ' blog-card__chevron--open' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

