import { useRef, useState } from 'react';
import useInView from '../hooks/useInView';
import './Contact.css';

export default function Contact({ profile }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
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
        <div className="contact__text">
          <p className="section-label">// contact</p>
          <h2 className="section-title">Let's work together</h2>
          <p className="contact__desc">
            Have a project in mind, a question, or just want to say hi?
            My inbox is always open.
          </p>
          {profile?.email && (
            <a href={`mailto:${profile.email}`} className="contact__email">
              {profile.email}
            </a>
          )}
        </div>

        <form className="contact__form" onSubmit={onSubmit}>
          <div className="contact__field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Jane Smith"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>
          <div className="contact__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
          <div className="contact__field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder="Tell me about your project..."
              value={form.message}
              onChange={onChange}
              required
            />
          </div>

          {status === 'success' && (
            <p className="contact__feedback contact__feedback--ok">
              Message sent! I'll be in touch soon.
            </p>
          )}
          {status === 'error' && (
            <p className="contact__feedback contact__feedback--err">
              Something went wrong. Please try emailing directly.
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary contact__submit"
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </div>
    </section>
  );
}
