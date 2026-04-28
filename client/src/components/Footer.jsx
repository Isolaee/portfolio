import './Footer.css';

export default function Footer({ profile }) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__copy">
          &copy; {new Date().getFullYear()} {profile?.name ?? 'Your Name'}. Built with React &amp; Cloudflare.
        </p>
        <div className="footer__links">
          {profile?.github && (
            <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
          )}
          {profile?.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          )}
          {profile?.email && (
            <a href={`mailto:${profile.email}`}>Email</a>
          )}
        </div>
      </div>
    </footer>
  );
}
