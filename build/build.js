#!/bin/node

const path = require('path');
const fs = require('fs').promises;
const util = require('util');
const yaml = require('js-yaml');
const Handlebars = require('handlebars');
const moment = require('moment');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const EMAIL_OUTPUT_DIR = path.join(__dirname, '..', 'emails');
const ISSUE_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'issues');
const TEMPLATE_DIR = path.join(__dirname, '..', 'layouts');

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
    meta.date = moment(meta.date).format('MMMM DD, YYYY');

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
