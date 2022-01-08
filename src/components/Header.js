import React from 'react'
import { Link } from "gatsby"
import PropTypes from 'prop-types'
import { trackCustomEvent } from 'gatsby-plugin-google-analytics'

const Header = props => (
  <header id="header" style={props.timeout ? { display: 'none' } : {}}>
    <div className="logo">
      <span className="icon fa-terminal"></span>
    </div>
    <div className="content">
      <div className="inner">
        <h1>Spencer Pollock</h1>
        <p>
          Programmer, Developer and Project Enthusiast. <br />
          Feel free to contact me by email.
        </p>
      </div>
    </div>
    <nav>
      <ul>
        <li>
          <a
            href="javascript:;"
            onClick={() => {
              props.onOpenArticle('projects')
              trackCustomEvent({
                // string - required - The object that was interacted with (e.g.video)
                category: 'projects',
                // string - required - Type of interaction (e.g. 'play')
                action: 'Click',
                // string - optional - Useful for categorizing events (e.g. 'Spring Campaign')
                label: 'article',
                // number - optional - Numeric value associated with the event. (e.g. A product ID)
                // value: 43,
              })
            }}
          >
            Projects
          </a>
        </li>
        <li>
          <a
            href="javascript:;"
            onClick={() => {
              props.onOpenArticle('work')
              trackCustomEvent({
                // string - required - The object that was interacted with (e.g.video)
                category: 'work',
                // string - required - Type of interaction (e.g. 'play')
                action: 'Click',
                // string - optional - Useful for categorizing events (e.g. 'Spring Campaign')
                label: 'article',
                // number - optional - Numeric value associated with the event. (e.g. A product ID)
                // value: 43,
              })
            }}
          >
            Work
          </a>
        </li>
        <li>
          <a href="https://srepollock.medium.com">Blog</a>
        </li>
        <li>
          <a
            href="javascript:;"
            onClick={() => {
              props.onOpenArticle('about')
              trackCustomEvent({
                // string - required - The object that was interacted with (e.g.video)
                category: 'about',
                // string - required - Type of interaction (e.g. 'play')
                action: 'Click',
                // string - optional - Useful for categorizing events (e.g. 'Spring Campaign')
                label: 'article',
                // number - optional - Numeric value associated with the event. (e.g. A product ID)
                // value: 43,
              })
            }}
          >
            About
          </a>
        </li>
        <li>
          <a
            href="javascript:;"
            onClick={() => {
              props.onOpenArticle('contact')
              trackCustomEvent({
                // string - required - The object that was interacted with (e.g.video)
                category: 'contact',
                // string - required - Type of interaction (e.g. 'play')
                action: 'Click',
                // string - optional - Useful for categorizing events (e.g. 'Spring Campaign')
                label: 'article',
                // number - optional - Numeric value associated with the event. (e.g. A product ID)
                // value: 43,
              })
            }}
          >
            Contact
          </a>
        </li>
      </ul>
    </nav>
  </header>
)

Header.propTypes = {
  onOpenArticle: PropTypes.func,
  timeout: PropTypes.bool,
}

export default Header
