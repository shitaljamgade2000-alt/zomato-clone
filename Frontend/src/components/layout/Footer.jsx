import { FOOTER_LINKS, CITIES } from '../../utils/constants';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">🍽️ Zomato</div>
            <p className="footer-tagline">
              Order food online from the best restaurants and get it delivered to your doorstep.
            </p>
            <div className="footer-social">
              {[
                ['Facebook', 'f'],
                ['Twitter', '𝕏'],
                ['Instagram', '📷'],
                ['LinkedIn', 'in'],
              ].map(([label, icon]) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'inherit',
                    font: 'inherit',
                  }}
                  onClick={() => {}}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {[
            ['Company', FOOTER_LINKS.company],
            ['Zomaverse', FOOTER_LINKS.zomaverse],
            ['Contact', FOOTER_LINKS.contact],
            ['Legal', FOOTER_LINKS.legal],
          ].map(([title, links]) => (
            <div key={title} className="footer-col">
              <h4>{title}</h4>
              <ul>
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-cities">
          <h4>Cities we deliver to</h4>
          <div className="footer-city-list">
            {CITIES.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} Zomato Clone. All rights reserved.</p>
          <p className="footer-note">
            By continuing past this page, you agree to our Terms of Service, Cookie Policy and Privacy Policy.
          </p>
          <button
            type="button"
            className="footer-back-top"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            ↑ Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
