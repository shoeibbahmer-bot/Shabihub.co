# Shabihub website

Plain HTML, CSS and JavaScript. No build step and no install. Every file is served as it is.

## Folder layout

```
index.html          Home page
about.html          About Us
services.html       All services, pricing and FAQ
portfolio.html      Case studies
results.html        Results (linked from the home page hero)
blogs.html          Blog list
contact.html        Contact form and offices
services/           One page per service (24 pages)
assets/
  css/style.css     All styles (colours and spacing are set at the top)
  js/main.js        Menu, animations, 3D hero, forms
  img/              Logos, map, client logos (img/clients/)
```

## Edit common things

- **Colours, fonts and section spacing:** the `:root` block at the top of `assets/css/style.css`. `--sec` sets the space between sections.
- **Menu:** the header is copied into every page. To change a menu item, use your editor's Find & Replace across all files. In VS Code that's Ctrl+Shift+H.
- **Phone or email:** use Find & Replace for `+91 99855 00713` or `contact@shabihub.com`.

## Preview locally

Double-click `index.html` and it opens in your browser. Everything works without a server, including the 3D hero.
If you'd rather use a server, the VS Code **Live Server** extension's "Go Live" button works.

## Publish on GitHub Pages (free)

1. Create a new repository on github.com, for example `shabihub-website`.
2. Click **Add file → Upload files** and drag in **everything inside this folder**. Leave out the `.claude` folder.
3. Go to **Settings → Pages**, set **Source** to "Deploy from a branch", choose the `main` branch and the `/ (root)` folder, then click **Save**.
4. After about a minute the site is live at `https://<your-username>.github.io/shabihub-website/`.
5. To use your own domain, enter it under **Settings → Pages → Custom domain** and point your domain's DNS to GitHub as that page explains.

Netlify, Vercel and Cloudflare Pages also work. Import the repository and leave the build command empty, with the publish directory set to `/`.

## Contact forms

The forms don't need a server. When someone submits, their email app opens with the enquiry already filled in and addressed to contact@shabihub.com.
To receive submissions directly instead, create a free form at formspree.io and add its URL to the form, for example:
`<form id="enq" action="https://formspree.io/f/XXXX" method="POST">`. Forms that have an `action` are sent normally.
