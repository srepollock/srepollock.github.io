import PropTypes from 'prop-types'
import React from 'react'
import Iframe from 'react-iframe'
import srepollock from '../images/srepollock.jpg'

class Main extends React.Component {
  render() {
    const close = (
      <div
        className="close"
        onClick={() => {
          this.props.onCloseArticle()
        }}
      ></div>
    )

    return (
      <div
        ref={this.props.setWrapperRef}
        id="main"
        style={this.props.timeout ? { display: 'flex' } : { display: 'none' }}
      >
        <article
          id="projects"
          className={`${this.props.article === 'projects' ? 'active' : ''} ${
            this.props.articleTimeout ? 'timeout' : ''
          }`}
          style={{ display: 'none' }}
        >
          <h2 className="major">Projects</h2>
          <ul>
            <li>
              <a href="https://example.spollock.xyz">
                Wordpress in Docker on an AWS EC2 instance
              </a>
            </li>
            <li>
              <a href="https://github.com/srepollock/divine-engine">
                Divine Engine: A TypeScript Game Engine
              </a>
            </li>
            <li>
              <a href="https://github.com/srepollock/password-generator">
                iOS Password Generator
              </a>
            </li>
            <li>
              <a href="https://github.com/srepollock/ts-lib-tutorial">
                TypeScript Library Tutorial
              </a>
            </li>
            <li>
              <a href="https://github.com/srepollock/circular-queue">
                Circular Queue in C++
              </a>
            </li>
            <li>
              <a href="https://github.com/srepollock/external-ip">
                External IP via Python script
              </a>
            </li>
            <li>
              <a href="https://github.com/srepollock/Asteroids">3D Asteroids</a>
            </li>
            <li>
              <a href="https://github.com/srepollock/facial-recognition">
                Face recognition
              </a>
            </li>
            <li>
              <a href="https://github.com/srepollock/sound-wave-analyzer">
                Soundwave analyzer
              </a>
            </li>
            <li>
              <a href="https://github.com/srepollock/MPEGCompression">
                MPEG Compression
              </a>
            </li>
          </ul>
          <p>
            I look forward to trying new ideas and implementations. I try and
            stay up to date on new technologies, frameworks, libraries and more
            through projects and testing.
          </p>
          <p>
            Click here if you&apos;d like to follow me on
            <a href="https://github.com/srepollock">GitHub</a>
          </p>
          <p>
            <h4>Games</h4>
            <iframe
              frameBorder="0"
              src="https://itch.io/embed/516922?linkback=true&amp;dark=true"
              width="552"
              height="167"
            ></iframe>
          </p>
          {close}
        </article>

        <article
          id="work"
          className={`${this.props.article === 'work' ? 'active' : ''} ${
            this.props.articleTimeout ? 'timeout' : ''
          }`}
          style={{ display: 'none' }}
        >
          <h2 className="major">Work</h2>
          <ul>
            <li>
              <p>
                Senior Production Services Technician, Sony Pictures Imageworks
                <br />
                September 2018 - July 2019
              </p>
            </li>
            <li>
              <p>
                Chair of the School of Computing and Academic Studies, BCIT
                Student Association
                <br />
                June 2017 - May 2018
              </p>
            </li>
            <li>
              <p>
                Systems Engineer, Sony Pictures Imageworks
                <br />
                May 2017-August 2017, June 2016 - August 2016
              </p>
            </li>
          </ul>
          {close}
        </article>


        <article
          id="blog"
          className={`${this.props.article === 'blog' ? 'active' : ''} ${
            this.props.articleTimeout ? 'timeout' : ''
          }`}
          style={{ display: 'none' }}
        >
          <a href="https://srepollock.medium.com/><h2 className="major">Blog</h2></a>
          {close}
        </article>

        <article
          id="about"
          className={`${this.props.article === 'about' ? 'active' : ''} ${
            this.props.articleTimeout ? 'timeout' : ''
          }`}
          style={{ display: 'none' }}
        >
          <h2 className="major">About</h2>
          <span className="image left">
            <img src={srepollock} alt="" height="20%" />
          </span>
          <p>
            My name is Spencer Pollock. I am an outgoing, energetic software
            developer that is looking to help bring a fresh take on projects. I
            work towards helping the development community remain inclusive and
            full of pride in all projects and teams. Lately, I have been working
            on creating a game engine in TypeScript with NPM and Electron, but I
            specialize in low-level development and tooling. I enjoy hiking,
            playing video games and hanging out with good company. I always look
            forward to a new adventure or challenge.
          </p>
          <h3>Languages</h3>
          <p>C, C++, C#, Python, JavaScript, TypeScript, HTML, Shell</p>
          <h3>Skills</h3>
          <p>
            Project Management, Continuous Integration/Continuous Development
            integration, Test Driven Development, Behaviour Driven Development,
            Automated Systems, System Administration, Agile development, UI/UX
            design, Photoshop, Game Development, ElectronJS, NodeJS, REST API,
            ReactJS
          </p>
          <h3>Hobbies</h3>
          <p>
            Reading, philosophy, projects on new platforms, projects in new
            languages, game development, video games, Lacrosse referee,
            snowboarding, and hiking.
          </p>
          {close}
        </article>

        <article
          id="contact"
          className={`${this.props.article === 'contact' ? 'active' : ''} ${
            this.props.articleTimeout ? 'timeout' : ''
          }`}
          style={{ display: 'none' }}
        >
          <h2 className="major">Contact</h2>
          <form method="post" action="mailto:spencer@spollock.ca">
            <div className="field half first">
              <label htmlFor="name">Name</label>
              <input type="text" name="name" id="name" />
            </div>
            <div className="field half">
              <label htmlFor="email">Email</label>
              <input type="text" name="email" id="email" />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea name="message" id="message" rows="4"></textarea>
            </div>
            <ul className="actions">
              <li>
                <input type="submit" value="Send Message" className="special" />
              </li>
              <li>
                <input type="reset" value="Reset" />
              </li>
            </ul>
          </form>
          <ul className="icons">
            <li>
              <a
                href="https://twitter.com/srepollock"
                className="icon fa-twitter"
              >
                <span className="label">Twitter</span>
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/in/srepollock/"
                className="icon fa-linkedin"
              >
                <span className="label">LinkedIn</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/srepollock/"
                className="icon fa-instagram"
              >
                <span className="label">Instagram</span>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/srepollock/"
                className="icon fa-github"
              >
                <span className="label">GitHub</span>
              </a>
            </li>
          </ul>
          {close}
        </article>
      </div>
    )
  }
}

Main.propTypes = {
  route: PropTypes.object,
  article: PropTypes.string,
  articleTimeout: PropTypes.bool,
  onCloseArticle: PropTypes.func,
  timeout: PropTypes.bool,
  setWrapperRef: PropTypes.func.isRequired,
}

export default Main
