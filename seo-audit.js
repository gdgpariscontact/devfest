const fs = require('fs');
const path = require('path');

const root = __dirname;
const routes = ['sponsoring', 'speakers', 'coc'];
const requiredRootSignals = [
  '<meta name="robots" content="index, follow',
  '<link rel="canonical" href="https://devfest.gdgparis.fr/">',
  'id="page-schema"',
  '"@type": "Event"'
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assertIncludes(content, expected, location) {
  if (!content.includes(expected)) {
    throw new Error(`${location} is missing required SEO signal: ${expected}`);
  }
}

const index = read('index.html');
requiredRootSignals.forEach(signal => assertIncludes(index, signal, 'index.html'));

assertIncludes(read('robots.txt'), 'Sitemap: https://devfest.gdgparis.fr/sitemap.xml', 'robots.txt');
const sitemap = read('sitemap.xml');
routes.forEach(route => {
  const page = read(path.join(route, 'index.html'));
  assertIncludes(sitemap, `<loc>https://devfest.gdgparis.fr/${route}</loc>`, 'sitemap.xml');
  assertIncludes(page, `<link rel="canonical" href="https://devfest.gdgparis.fr/${route}">`, `${route}/index.html`);
  assertIncludes(page, 'id="page-schema"', `${route}/index.html`);
  if (!/<h1\b[^>]*data-i18n=/.test(page)) {
    throw new Error(`${route}/index.html is missing a crawlable primary heading.`);
  }
});

console.log('SEO audit passed.');
