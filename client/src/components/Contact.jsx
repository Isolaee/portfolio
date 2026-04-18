import { useRef } from 'react';
import useInView from '../hooks/useInView';
import './Contact.css';

export default function Contact({ profile }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  const email = profile?.email ?? 'eero.isola@gmail.com';
  const linkedin = profile?.linkedin ?? 'https://www.linkedin.com/in/eero-isola-78b8561b5/';

  return (
    <section id="contact" className={`contact${inView ? ' visible' : ''}`} ref={ref}>
      <div className="container contact__inner">
        <p className="section-label">// contact</p>
        <h2 className="section-title">Get in touch</h2>
        <p className="contact__desc">
          Feel free to reach out via email or connect with me on LinkedIn.
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
      </div>
    </section>
  );
}
