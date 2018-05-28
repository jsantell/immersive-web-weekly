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

## Markdown

Some fields in the issue YAML may be parsed as markdown (`overview`, `links.content`) via `showdown` parser. In `build/parse-markdown.js`, all reference links, (e.g. `Welcome to [markdown]!`) will be linked using the `links.json` reference in the project root. This allows referencing the same entity/link multiple times over several issues or links. All links are compared as lower casae, hence all keys in `links.json` being lowercase. Not tested that well, could break for non-english/non-alphanumeric characters.
