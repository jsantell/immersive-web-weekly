#!/bin/node

const path = require('path');
const fs = require('fs').promises;
const util = require('util');
const yaml = require('js-yaml');
const Handlebars = require('handlebars');
const moment = require('moment');
const markdown = require('./parse-markdown');
const links = require('../links.json').links;
const parseDomain = require('parse-domain');
const DOMParser = require('xmldom').DOMParser;

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const EMAIL_OUTPUT_DIR = path.join(__dirname, '..', 'emails');
const ISSUE_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'issues');
const TEMPLATE_DIR = path.join(__dirname, '..', 'layouts');

// Length of `overviewShort` in a post, used for social graph descriptions.
const OVERVIEW_SHORT_LENGTH = 200;

const issueTemplate = Handlebars.compile(path.join(TEMPLATE_DIR, 'issue.hbs'));

async function build (type) {
  const emailTemplateSrc = await fs.readFile(path.join(TEMPLATE_DIR, 'email.hbs'), 'utf8');
  const issueTemplateSrc = await fs.readFile(path.join(TEMPLATE_DIR, 'issue.hbs'), 'utf8');
  const emailTemplate = Handlebars.compile(emailTemplateSrc);
  const issueTemplate = Handlebars.compile(issueTemplateSrc);

  const files = await fs.readdir(CONTENT_DIR);

  for (let file of files) {
    // Skip files that are not of format `###.yaml`
    if (!/^\d\d\d\.yaml$/.test(file)) {
      continue;
    }
    const pathToFile = path.join(CONTENT_DIR, file);
    const yamlContents = await fs.readFile(pathToFile, 'utf8');
    const meta = yaml.safeLoad(yamlContents);
    const issue = file.match(/\d\d\d/)[0];

    // Update meta with some more values for our templates
    meta.issue = issue;
    meta.permalink = `https://immersivewebweekly.com/issues/${meta.issue}`;
    meta.date = moment.utc(meta.date).format('MMMM DD, YYYY');

    if (meta.overview) {
      meta.overview = markdown(meta.overview);
      // Strip out the markdown for the description
      meta.overviewShort = new DOMParser().parseFromString(meta.overview, 'text/html').documentElement.textContent;
      meta.overviewShort = meta.overviewShort.substr(0, OVERVIEW_SHORT_LENGTH);
      meta.overviewShort += meta.overview.length > OVERVIEW_SHORT_LENGTH ? '...' : '';
    }

    meta.links.map(link => {
      // Reference an authorLink from links.json if we can
      if (!link.authorLink) {
        const authorLink = links[link.author.toLowerCase()];
        if (!authorLink) {
          // throw new Error(`Link for ${link.title} does not have a valid authorLink.`);
        }
        link.authorLink = authorLink;
      }

      // Add domain
      const { domain, tld } = parseDomain(link.url);
      link.domain = `${domain}.${tld}`;

      // Build markdown
      link.content = markdown(link.content)
    });

    const emailMarkup = emailTemplate(meta);
    const issueMarkup = issueTemplate(meta);

    await fs.writeFile(path.join(EMAIL_OUTPUT_DIR, `${meta.issue}.html`), emailMarkup);
    try {
      await fs.mkdir(path.join(ISSUE_OUTPUT_DIR, meta.issue));
    } catch (e) {}
    await fs.writeFile(path.join(ISSUE_OUTPUT_DIR, meta.issue, 'index.html'), issueMarkup);
  }
}

build();
