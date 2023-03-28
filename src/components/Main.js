import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import { StaticImage } from 'gatsby-plugin-image'
import { RiFacebookBoxFill } from '@react-icons/all-files/ri/RiFacebookBoxFill'
import { RiTwitterFill } from '@react-icons/all-files/ri/RiTwitterFill'
import { RiInstagramFill } from '@react-icons/all-files/ri/RiInstagramFill'
import { RiGithubFill } from '@react-icons/all-files/ri/RiGithubFill'
import { RiYoutubeFill } from '@react-icons/all-files/ri/RiYoutubeFill'
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
                Director, Developer Box Inc.
                <br />
                June 2022 - Present
              </p>
            </li>
            <li>
              <p>
                DevOps Engineer, Standard Fusion
                <br />
                October 2022 - Present
              </p>
            </li>
            <li>
              <p>
                Senior Systems Architect, WhitecapRSC
                <br />
                October 2021 - June 2022
              </p>
            </li>
            <li>
              <p>
                Director of Gaming, <i>Gaming Company Startup</i>
                <br />
                September 2021 - December 2021
              </p>
            </li>
            <li>
              <p>
                Junior Engineer, Night Garden Studio
                <br />
                June 2020 - September 2021
              </p>
            </li>
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
          <a href="https://srepollock.medium.com">
            <h2 className="major">Blog</h2>
          </a>
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
            💻 Software Engineer | Game Developer | DevOps | Project Enthusiest
            | Technical Writer
          </p>
          <h3>🤔𝙒𝙝𝙖𝙩 𝙞𝙨 𝙎𝙥𝙚𝙣𝙘𝙚𝙧 𝙖𝙗𝙤𝙪𝙩❓</h3>
          <p>
            Spencer is a motivated, hard-working individual that is working to
            make thing simpler through automation and integration. They are
            constantly seeking new challenges to approach knowing that the
            experience earned through them is worth more than gold. He believes
            that keeping up to date with emerging technologies is a great way to
            see new perspectives and a way to invest in future success. He also
            appreciates analyzing an issue from multiple perspectives, testing
            different solutions, before settling and saying that one is better
            than another.
          </p>
          <h3>💪𝙎𝙩𝙧𝙚𝙣𝙜𝙩𝙝𝙨💻</h3>
          <p>
            Spencer pushes himself to constantly look forward and experiment
            with new and innovative technologies to arrive at creative
            solutions. He is a detail-oriented person, able to communicate
            complex ideas to both business and technical audiences. He is well
            versed in time management, constantly able to juggle multiple
            responsibilities and ongoing projects. He believes utilizing not
            only his own knowledge but the knowledge of other teammates to
            tackle issues will yield the best results and develop connections to
            continue to grow and move forward as a team. Spencer specializes in
            Git, C#, Python, JavaScript, DevOps, Docker, AWS, C++ as well as
            soft- and hard-communication skills. He constantly works to improve
            these skills and is always willing to try new things to advance.
          </p>
          <h3>👱‍♂️𝙋𝙚𝙧𝙨𝙤𝙣𝙖𝙡 𝙇𝙞𝙛𝙚👾</h3>
          <p>
            Outside of work, Spencer has found new passions through, hiking,
            cooking, music, and philosophy. He works hard in his hobbies and
            tries to relate skills learned through them into his programming. He
            is a family-oriented individual, always making time to visit and
            make memories.
          </p>
          <h3>🎖𝘼𝙘𝙘𝙤𝙢𝙥𝙡𝙞𝙨𝙝𝙢𝙚𝙣𝙩𝙨🏆</h3>
          <p>
            🔴Has a bachelors degree in Computer Systems from BCIT 🟠Was an
            executive member of the BCIT Student Association 🟡Has his name in
            Spiderman: Far From Home 🟢Has completed iPhone, Mac, Windows
            hardware repairs 🔵Has four Referee of the Year awards split among
            Hockey and Lacrosse 🟣Can type at ~75 wpm
          </p>
          <h3>💥𝙒𝙝𝙖𝙩 𝙮𝙤𝙪 𝙜𝙚𝙩👍</h3>
          <p>
            🔥A highly driven and curious individual questioning process and
            striving to achieve more 🔥A detail-oriented professional that
            strives to constantly improve the process 🔥A team player 🔥Ability
            to communicate with both business and technical teams 🔥Ability to
            manage multiple high-profile projects at once 🔥Willing to travel
            🔥A person that can brew an amazing cup of coffee (it’s all in the
            beans)
          </p>
          <p>
            🤖Working to make things simpler through automation. 📝I’ll tell you
            my story as it unfolds.
          </p>
          <h3>⌨️Languages</h3>
          <p>C, C++, C#, Python, JavaScript, TypeScript, HTML, Shell</p>
          <h3>💪Skills</h3>
          <p>
            Project Management, Continuous Integration/Continuous Development
            integration, Test Driven Development, Behaviour Driven Development,
            Automated Systems, System Administration, Agile development, UI/UX
            design, Photoshop, Game Development, ElectronJS, NodeJS, REST API,
            ReactJS
          </p>
          <h3>🏕Hobbies</h3>
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
                href="https://github.com/srepollock/"
                className="icon fa-github"
              >
                <span className="label">GitHub</span>
              </a>
            </li>
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
