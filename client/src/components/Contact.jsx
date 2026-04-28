import { useRef, useState } from 'react';
import useInView from '../hooks/useInView';
import './Contact.css';

const CONTACT_URL = import.meta.env.VITE_CONTACT_URL;

export default function Contact({ profile }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  const email = profile?.email ?? 'eero.isola@gmail.com';
  const linkedin = profile?.linkedin ?? 'https://www.linkedin.com/in/eero-isola-78b8561b5/';

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!CONTACT_URL) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(CONTACT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className={`contact${inView ? ' visible' : ''}`} ref={ref}>
      <div className="container contact__inner">
        <p className="section-label">// contact</p>
        <h2 className="section-title">Get in touch</h2>
        <p className="contact__desc">
          Feel free to reach out via email, LinkedIn, or the form below.
        </p>

        <div className="contact__links">
          <a href={`mailto:${email}`} className="contact__link">
            <span className="contact__link-icon">✉</span>
            {email}
          </a>
          <a href={linkedin} className="contact__link" target="_blank" rel="noopener noreferrer">
            <span className="contact__link-icon">in</span>
            LinkedIn
          </a>
        </div>

        {CONTACT_URL && (
          <form className="contact__form" onSubmit={handleSubmit} noValidate>
            <div className="contact__form-row">
              <label className="contact__label" htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                className="contact__input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={status === 'sending'}
                placeholder="Your name"
              />
            </div>
            <div className="contact__form-row">
              <label className="contact__label" htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                className="contact__input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={status === 'sending'}
                placeholder="your@email.com"
              />
            </div>
            <div className="contact__form-row">
              <label className="contact__label" htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                className="contact__input contact__textarea"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                disabled={status === 'sending'}
                placeholder="What's on your mind?"
                rows={5}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary contact__submit"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>

            {status === 'success' && (
              <p className="contact__feedback contact__feedback--ok">
                Message sent — I'll be in touch soon.
              </p>
            )}
            {status === 'error' && (
              <p className="contact__feedback contact__feedback--err">
                Something went wrong. Please email me directly.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
