# Nazmin Nahar — Portfolio Website

## Project Overview

This is a fully responsive, interactive personal portfolio website for **Nazmin Nahar**, a Computer Science & Engineering student at the University of Asia Pacific (CGPA: 3.91). The site showcases her academic background, programming skills, projects, certificates (including her semester awards), photo gallery, career goals, and general location, with a premium, developer-focused visual design (dark/light mode, smooth scroll animations, an interactive map, and dynamic content rendered from JavaScript data).

Only information explicitly provided about Nazmin is used anywhere on the site. No work experience, internships, extra awards, certificate dates/issuers, or project links have been invented — where information wasn't supplied (e.g. a GitHub repo link for a project), the site clearly shows **"Repository Link Coming Soon"** instead.

## Technologies

- **HTML5, CSS3, JavaScript (ES6+)** — no build tools or frameworks required
- **Font Awesome** — general UI icons
- **Devicon** — technology/programming language icons
- **Google Fonts** — Space Grotesk (display), Inter (body), JetBrains Mono (code accents)
- **Leaflet.js + OpenStreetMap** — real interactive map for the Location section

All external libraries are loaded via CDN `<link>`/`<script>` tags in `index.html`, so an internet connection is needed the first time the page is opened (the browser will cache them after that).

## How to Run

No installation or build step is required.

1. Download/clone the `nazmin-portfolio` folder.
2. Double-click `index.html` (or open it from your browser with `File > Open`).
3. The site will load and work fully in any modern browser (Chrome, Edge, Firefox, Safari).

Optionally, you can serve it with any static file server, e.g.:

```bash
cd nazmin-portfolio
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project Structure

```
nazmin-portfolio/
│
├── index.html
├── style.css
├── script.js
├── README.md
│
└── assets/
    ├── profile/
    │   └── profilepic.jpeg
    ├── gallery/
    │   ├── mypic1.jpeg ... mypic8.jpeg
    │   └── pic.jpeg
    └── certificates/
        ├── ssc.jpeg
        ├── hsc.jpeg
        ├── firstbafsdcarnivalcert.jpeg
        ├── firstsemesterdeansaward.jpeg
        ├── secondsemestervcaward.jpeg
        └── thirdsemesterdeansaward.jpeg
```

## Replacing Placeholder Images

All images currently in `assets/` are **generated placeholders** (labelled, dark-themed rectangles) so the site runs and looks complete out of the box. Replace them with real images using the **exact same filenames** and the site will pick them up automatically — no code changes needed.

### Adding the Profile Image
Replace:
```
assets/profile/profilepic.jpeg
```
with a square (or near-square) photo of Nazmin. It's displayed inside a circular frame, so keep the subject centered.

### Adding Gallery Images
Replace any/all of:
```
assets/gallery/mypic1.jpeg
assets/gallery/mypic2.jpeg
assets/gallery/mypic3.jpeg
assets/gallery/mypic4.jpeg
assets/gallery/mypic5.jpeg
assets/gallery/mypic6.jpeg
assets/gallery/mypic7.jpeg
assets/gallery/mypic8.jpeg
assets/gallery/pic.jpeg
```
To add **more or fewer** photos than 9, edit the `galleryImages` array near the top of the "GALLERY + LIGHTBOX" section in `script.js` — add or remove entries with a `src` and `alt`. If the array is ever empty, the site automatically shows "Gallery images coming soon."

### Adding Certificates
Replace the six images in `assets/certificates/` (same filenames as above: `ssc.jpeg`, `hsc.jpeg`, `firstbafsdcarnivalcert.jpeg`, `firstsemesterdeansaward.jpeg`, `secondsemestervcaward.jpeg`, `thirdsemesterdeansaward.jpeg`). To add a **new** certificate, add a new entry to the `certificates` array in `script.js`:

```javascript
const certificates = [
    {
        title: "Your Certificate Title",
        category: "Academic", // or "Academic Award" / "Activity"
        image: "assets/certificates/your-file.jpg"
    },
    // ...existing certificates
];
```
The category you choose determines which filter button ("All", "Academic", "Academic Awards", "Activities") will show it. Do not invent an issuing organization or date for a certificate unless you actually have that information — the current cards intentionally omit anything not supplied.

## Adding/Updating Projects

Projects are rendered dynamically from the `projects` array in `script.js`:

```javascript
const projects = [
    {
        title: "Project Name",
        type: "Short description of what kind of project this is",
        category: "Java", // shown as a small tag on the card
        description: "A longer description of the project.",
        technologies: [
            { name: "Java", icon: "devicon-java-plain" }
            // use { name: "...", icon: "fa-solid fa-...", fa: true } for Font Awesome icons
        ],
        features: ["Feature one", "Feature two"],
        icon: "devicon-java-plain", // card's main icon
        iconFa: false,              // set true if `icon` is a Font Awesome class
        github: ""                  // leave empty to show "Repository Link Coming Soon"
    }
];
```
Add a new object to this array to add a new project card — no HTML editing required. **Never invent a GitHub URL** — leave `github: ""` until a real repository exists.

## Updating the Location Map

The Location section shows a real, interactive Leaflet/OpenStreetMap map centered on an **approximate coordinate for the West Nakhalpara neighborhood of Dhaka** (not an exact home address), initialized in the `initMap()` function in `script.js`:

```javascript
const APPROX_LAT = 23.7629;
const APPROX_LNG = 90.3927;
```

**Important — privacy:** This coordinate is intentionally a general neighborhood-level location, not a precise residential address. If you ever update it, keep it at a similarly approximate, non-identifying level (zoom level 14 or wider) rather than pinpointing an exact home. The "Open in Google Maps" button similarly searches only for the general area name ("West Nakhalpara, Dhaka, Bangladesh"), not coordinates.

## Notes on Content Accuracy

Per the project requirements, the following were **deliberately not included** anywhere on the site because they were not supplied:
- Work experience, internships, or job titles
- Additional awards beyond the four listed semester awards
- Certificate issuing organizations or dates
- Project repository URLs (shown as "Repository Link Coming Soon" where unavailable)
- Skill proficiency percentages (shown instead as qualitative labels: Foundation / Developing / Exploring)

If new accurate information becomes available, update the relevant data array in `script.js` (or the static HTML for sections like About/Education) rather than inventing details.

## Browser Support & Accessibility

- Fully responsive: desktop, laptop, tablet, and mobile
- Keyboard accessible: all lightboxes/modals support `Esc` to close, and gallery/certificate viewers support arrow-key navigation
- Respects `prefers-reduced-motion` and `prefers-color-scheme`
- Semantic HTML with ARIA labels on interactive controls
