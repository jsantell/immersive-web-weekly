#!/bin/node

const path = require('path');
const Metalsmith  = require('metalsmith');
const layouts     = require('metalsmith-layouts');
const dateFormatter = require('metalsmith-date-formatter');
const markdown    = require('metalsmith-markdown');
const perma = require('metalsmith-perma');

function build (type) {
  const isEmail = type === 'email';
  const destination = isEmail ? './emails' : './public';
  const layout = isEmail ? 'email.hbs' : 'issue.hbs';

  return new Promise((resolve, reject) => {
    Metalsmith(path.join(__dirname, '..'))
      .metadata({
        sitename: "My Static Site & Blog",
        siteurl: "http://example.com/",
        description: "It's about saying »Hello« to the world.",
      })
      .source('./content')
      .destination(destination)
      .clean(false)
      .use(dateFormatter({
        dates: [{
          key: 'date',
          format: 'MMMM DD, YYYY'
        }]
      }))
      .use(markdown())
      .use(isEmail ? function(){ return function(){} } : perma({
        pattern: 'issues/:issue'
      }))
      .use(layouts({
        default: layout,
      }))
      .build(err => err ? reject(err) : resolve());
  });
}

build('archive').then(() => build('email')).then(() => console.log('done')).catch(console.error);
