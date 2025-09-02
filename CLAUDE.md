# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodeBurg is a static multilingual website for a coworking space in Burgas, Bulgaria. It's a simple HTML/CSS/JavaScript website with no build process or package manager dependencies.

## Architecture

- **Technology Stack**: Pure HTML5, CSS3, and vanilla JavaScript
- **No Framework**: This is a static website without any JavaScript frameworks
- **No Build Process**: Files are served directly without compilation or bundling
- **Multilingual**: Supports English (default), Russian (/ru/), Ukrainian (/ua/), and Bulgarian (/bg/)

## File Structure

```
/
├── index.html              # Main English homepage
├── styles/main.css         # All styling for the site
├── js/main.js              # JavaScript functionality
├── assets/                 # Images and favicons
│   ├── images/            # Site images and gallery photos
│   └── favicons/          # Favicon files
├── ru/index.html          # Russian version
├── ua/index.html          # Ukrainian version
├── bg/index.html          # Bulgarian version (if exists)
├── sitemap.xml            # SEO sitemap
├── robots.txt             # Search engine directives
└── google-business.json   # Google Business profile data
```

## Key Features

1. **Responsive Design**: Mobile-first approach with CSS media queries
2. **Language Detection**: Automatic browser language detection and redirection
3. **ScrollReveal Animations**: Uses ScrollReveal.js for scroll-triggered animations
4. **SEO Optimized**: Structured data, meta tags, and multilingual hreflang
5. **Interactive Map**: Embedded Google Maps with location information

## Development Commands

This project has no build system or package manager. To work with the codebase:

- **Local Development**: Use any static web server (e.g., `python -m http.server 8000` or VS Code Live Server)
- **File Editing**: Direct editing of HTML, CSS, and JS files
- **Testing**: Open files directly in browser or use local server

## Content Management

- Main content is in `index.html`
- Localized versions are in respective language directories (`/ru/`, `/ua/`, etc.)
- Images should be optimized before adding to `assets/images/`
- Gallery images should be 400x300px for consistency

## Styling Guidelines

- Uses CSS custom properties (CSS variables) for theming
- Paper-like design theme with soft shadows and gradients
- Mobile-first responsive design
- FontAwesome icons for UI elements
- Google Fonts: Space Grotesk and Readex Pro

## JavaScript Functionality

The `js/main.js` file handles:
- Browser language detection and redirection
- Language switcher dropdown (mobile)
- ScrollReveal animation configurations
- Responsive navigation behavior

## SEO and Analytics

- Google Tag Manager integration
- Structured data for local business
- Multilingual hreflang tags
- Open Graph and Twitter Card meta tags
- Sitemap and robots.txt for search engines

## Deployment Notes

- This is a static site suitable for GitHub Pages, Netlify, or any static hosting
- No server-side processing required
- All assets are referenced with relative paths
- Domain: codeburg.bg (production)