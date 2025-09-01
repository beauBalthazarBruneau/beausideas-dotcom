import './App.css'

function App() {
  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>Hey there! I'm Beau and these are my ideas</h1>
      </header>

      {/* Contact Links */}
      <section className="contact-links">
        <div className="link-item">
          <span className="icon">💼</span>
          <a href="https://www.linkedin.com/in/beau-bruneau/" target="_blank" rel="noopener noreferrer">
            Connect with me on LinkedIn
          </a>
        </div>
        <div className="link-item">
          <span className="icon">📩</span>
          <a href="mailto:beauroccobruneau@gmail.com">
            Email me
          </a>
        </div>
        <div className="link-item">
          <span className="icon">📅</span>
          <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2MDysrFxx7lqbj8j-bWnXrCRSwO1PUpvun-HDkA9N9E27tX7JjFsKqkWZ_-aB-XfgH6g_kF2iE" target="_blank" rel="noopener noreferrer">
            Steal time on my calendar
          </a>
        </div>
        <div className="link-item">
          <span className="icon">🎧</span>
          <a href="https://open.spotify.com/show/0Sh00wNlVkh305ri6HnSgS?si=0a8110d9d06643f8" target="_blank" rel="noopener noreferrer">
            Listen to my podcast
          </a>
        </div>
        <div className="link-item">
          <span className="icon">📤</span>
          <a href="https://jorisbaker.medium.com/" target="_blank" rel="noopener noreferrer">
            Subscribe
          </a>
        </div>
      </section>

      <hr className="divider" />

      {/* About Section */}
      <section className="about">
        <h2>Product Strategy | Industry Analysis</h2>
        <p>
          I'm a major dork. I love networking, I love software, and I love solving problems in healthcare and clinical trials. 
          While my day job is ideating and testing new software products in clinical research, I am consistently exploring 
          problems that could be solved with software across healthcare, product management, and even choosing a movie to watch with friends!
        </p>
        <p>
          As a curious and user-centric product professional with a passion for customer stakeholder discovery, I thrive on 
          engaging with users and cross-functional teams to ensure that product decisions are driven by the voice of the customer. 
          My enthusiasm for end user discovery is met with a tactical skill set and engineering background that propels me to ask 
          the right questions, break down problems effectively, and deliver quality insights.
        </p>
      </section>

      <hr className="divider" />

      {/* Apps Section */}
      <section className="apps">
        <h2>Apps by Beau</h2>
        <div className="app-item">
          <h3>Movie Party</h3>
          <p>
            For the past two years, my friends and I have chosen what movie we were going to watch with a simple method. 
            One person is the judge, and everyone submits a movie for consideration.
          </p>
          <p>
            So I used this concept to create my a web app using only AI to do the coding. You can check it out{' '}
            <a href="https://www.moviepick.me" target="_blank" rel="noopener noreferrer">here</a>.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="content">
        <h2>Content By Beau</h2>
        
        <div className="content-item">
          <h3>Laymen's Lab Podcast</h3>
          <p>
            A clinical research podcast with a fresh lens. Hosted by Beau Balthazar Bruneau, this show breaks from the norm 
            by featuring young voices and those recently transitioned into this field. Laymen's Lab is all about challenging 
            the status quo with radical candor and honest discussions. Whether you're exploring career options in clinical research, 
            seeking to learn more about the sector, or simply tired of the conventional chatter, this podcast is for you. 
            New episodes every other week.
          </p>
        </div>

        <div className="content-item">
          <h3>Clinical Trial Technology Landscape</h3>
          <p>
            I helped catalogued and categorized over 250 vendors in clinical research with over 900 products with my team at 
            Florence Healthcare (Andrea Bastek, Ph.D. & Alice Xu). This catalogue is filterable and searchable.
          </p>
          <p>
            <a href="https://researchrevolution.com/tech-vendor-map/" target="_blank" rel="noopener noreferrer">
              View the Tech Vendor Map
            </a>
          </p>
        </div>

        <div className="content-item">
          <h3>Networking Content</h3>
          <p>
            <a href="https://widget.taggbox.com/156805" target="_blank" rel="noopener noreferrer">
              View my networking content
            </a>
          </p>
        </div>

        <div className="content-item">
          <h3>HealthTech Investment Thesis</h3>
          <p>
            My thoughts and analysis on HealthTech investments and market opportunities.
          </p>
        </div>
      </section>

      <hr className="divider" />

      {/* Contact Section */}
      <section className="contact">
        <h2>Contact</h2>
        <div className="contact-grid">
          <a href="https://www.linkedin.com/in/beau-bruneau/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:beauroccobruneau@gmail.com">Personal email</a>
          <a href="mailto:beau.bruneau@florencehc.com">Work email</a>
          <a href="https://calendar.app.google/tvMw6EJxnPZKPDMS9" target="_blank" rel="noopener noreferrer">Calendar scheduler</a>
        </div>
      </section>
    </div>
  )
}

export default App
