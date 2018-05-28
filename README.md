# immersivewebweekly.com

## Structure

* `content/` Where YAML files live of issues
* `layouts/` Handlebars templates that the YAML files are passed in to
* `emails/` Output of email template for sending via Mailchimp
* `public/` Directory to be statically hosted (immersivewebweekly.com)
* `public/issues/` directory where output of issue template
* `demo/` Source files for demo on landing page
* `build/` Build scripts for wrapping up issues and rendering as email/issues

## Commands

* `npm run build` Builds issues in `content/` using templates from `layouts/` as HTML emails (`emails/`) and full HTML issues (`public/issues/`)
* `npm run build-demo` Builds the demo for the landing page in `demo/` to `public/index.js`
