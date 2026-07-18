const fs = require('fs');
const path = require('path');
const SITE_URL = 'https://devfest.gdgparis.fr';
const LAST_MODIFIED = '2026-07-18';

const routes = [
  {
    path: 'sponsoring',
    title: 'Devenir Sponsor - DevFest Paris 2026 | GDG Paris',
    description: 'Devenez sponsor du DevFest Paris 2026. Packs Silver, Gold et Premium disponibles. Networking avec 450+ développeurs, visibilité maximale, recrutement de talents tech. Rejoignez la 8ème édition le 27 novembre 2026.',
    keywords: 'Sponsor DevFest, Sponsoring Conférence Tech, GDG Paris, Pack Sponsor, Visibilité Tech, Recrutement Développeurs, DevFest Paris 2026',
    ogDescription: 'Devenez sponsor du DevFest Paris 2026. Packs Silver, Gold et Premium. 450+ développeurs, 30+ speakers experts.',
    twitterDescription: 'Devenez sponsor du DevFest Paris 2026. Packs Silver, Gold et Premium disponibles.',
    headingKey: 'sponsoring.packs_title'
  },
  {
    path: 'speakers',
    title: 'Speakers - DevFest Paris 2026 | GDG Paris',
    description: 'Découvrez les speakers du DevFest Paris 2026. 30+ experts locaux et internationaux en Cloud, IA, Frontend, Backend, Mobile et DevSecOps. Conférences, workshops et lunch talks le 27 novembre 2026.',
    keywords: 'Speakers DevFest, Conférenciers Tech, GDG Paris, Experts Cloud, IA, Frontend, Backend, Mobile, DevFest Paris 2026',
    ogDescription: 'Découvrez les 30+ speakers experts du DevFest Paris 2026. Cloud, IA, Frontend, Backend, Mobile.',
    twitterDescription: 'Découvrez les 30+ speakers experts du DevFest Paris 2026.',
    headingKey: 'speakers.title'
  },
  {
    path: 'coc',
    title: 'Code de Conduite - DevFest Paris 2026 | GDG Paris',
    description: 'Code de conduite et conditions de participation aux événements du DevFest Paris 2026 organisé par le GDG Paris. Règles de bonne conduite, respect et inclusivité.',
    keywords: 'Code de Conduite, DevFest Paris, GDG Paris, Règles, Inclusivité, Événement Tech',
    ogDescription: 'Code de conduite et conditions de participation au DevFest Paris 2026 par GDG Paris.',
    twitterDescription: 'Code de conduite et conditions de participation au DevFest Paris 2026.',
    headingKey: 'coc.title'
  }
];

function buildPageSchema(route) {
  const url = `${SITE_URL}/${route.path}`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: route.title,
        description: route.description,
        inLanguage: 'fr-FR',
        dateModified: LAST_MODIFIED,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#event` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'DevFest Paris 2026', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: route.title.split(' |')[0], item: url }
        ]
      }
    ]
  };

  return `<script id="page-schema" type="application/ld+json">\n    ${JSON.stringify(schema).replace(/</g, '\\u003c')}\n    </script>`;
}

function promotePrimaryHeading(content, translationKey) {
  const expression = new RegExp(`<(h[12])([^>]*data-i18n="${translationKey}"[^>]*)>([\\s\\S]*?)<\\/\\1>`);
  return content.replace(expression, '<h1$2>$3</h1>');
}

function writeSitemap() {
  const pages = [{ path: '', changefreq: 'weekly', priority: '1.0' }]
    .concat(routes.map(route => ({ path: route.path, changefreq: route.path === 'coc' ? 'yearly' : 'monthly', priority: route.path === 'coc' ? '0.5' : '0.8' })));
  const entries = pages.map(page => `  <url>\n    <loc>${SITE_URL}/${page.path}</loc>\n    <lastmod>${LAST_MODIFIED}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`);
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`, 'utf8');
}

function build() {
  const indexContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  routes.forEach(route => {
    let content = indexContent;

    // Replace Title
    content = content.replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`);
    
    // Replace Meta Description
    content = content.replace(/<meta name="description"[\s\n]*content=".*?">/, `<meta name="description" content="${route.description}">`);
    
    // Replace Keywords
    content = content.replace(/<meta name="keywords"[\s\n]*content=".*?">/, `<meta name="keywords" content="${route.keywords}">`);

    // Replace Open Graph / Twitter Tags
    content = content.replace(/<meta property="og:url" content="https:\/\/devfest.gdgparis.fr\/">/, `<meta property="og:url" content="${SITE_URL}/${route.path}">`);
    content = content.replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${route.title.split(' |')[0]}">`);
    content = content.replace(/<meta property="og:description"[\s\n]*content=".*?">/, `<meta property="og:description" content="${route.ogDescription}">`);
    
    content = content.replace(/<meta property="twitter:url" content="https:\/\/devfest.gdgparis.fr\/">/, `<meta property="twitter:url" content="${SITE_URL}/${route.path}">`);
    content = content.replace(/<meta property="twitter:title" content=".*?">/, `<meta property="twitter:title" content="${route.title.split(' |')[0]}">`);
    content = content.replace(/<meta property="twitter:description"[\s\n]*content=".*?">/, `<meta property="twitter:description" content="${route.twitterDescription}">`);

    // Replace Canonical and Hreflang
    content = content.replace(/<link rel="canonical" href="https:\/\/devfest.gdgparis.fr\/">/, `<link rel="canonical" href="${SITE_URL}/${route.path}">`);
    content = content.replace(/<link rel="alternate" hreflang="fr" href="https:\/\/devfest.gdgparis.fr\/\?lang=fr" \/>/, `<link rel="alternate" hreflang="fr" href="${SITE_URL}/${route.path}?lang=fr" />`);
    content = content.replace(/<link rel="alternate" hreflang="en" href="https:\/\/devfest.gdgparis.fr\/\?lang=en" \/>/, `<link rel="alternate" hreflang="en" href="${SITE_URL}/${route.path}?lang=en" />`);
    content = content.replace(/<link rel="alternate" hreflang="x-default" href="https:\/\/devfest.gdgparis.fr\/" \/>/, `<link rel="alternate" hreflang="x-default" href="${SITE_URL}/${route.path}" />`);
    content = content.replace(/<script id="page-schema" type="application\/ld\+json">[\s\S]*?<\/script>/, buildPageSchema(route));
    content = promotePrimaryHeading(content, route.headingKey);

    // Fix relative asset paths
    content = content.replace(/href="style\.css"/g, 'href="../style.css"');
    content = content.replace(/href="images\//g, 'href="../images/');
    content = content.replace(/src="images\//g, 'src="../images/');
    content = content.replace(/src="main\.jpeg"/g, 'src="../main.jpeg"');
    content = content.replace(/src="translations\//g, 'src="../translations/');

    // Ensure the directory exists
    const dirPath = path.join(__dirname, route.path);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write the new file
    fs.writeFileSync(path.join(dirPath, 'index.html'), content, 'utf8');
    console.log(`Generated SEO page for /${route.path}`);
  });

  writeSitemap();
}

build();
