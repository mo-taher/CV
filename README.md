# Case Files: Mohammed Taher Abdullah

Portfolio site for Mohammed Taher Abdullah, business and systems analyst in Adelaide, SA.

Live at **https://mo-taher.github.io/CV/**

Built with React, Vite, Three.js (custom GLSL shaders), GSAP (ScrollTrigger, CustomEase, SplitText) and Lenis. It builds to plain static files, so it runs on GitHub Pages with no server.

---

## Publish it (first time)

1. **Replace the repo contents.** In your local copy of the `CV` repo, delete the old files (`index.html`, `style.css`, `script.js`, `images`). Keep the hidden `.git` folder. Then copy everything from this project in, including the hidden `.github` folder.
2. **Push to `main`:**
   ```bash
   git add -A
   git commit -m "New Case Files portfolio"
   git push
   ```
3. **Turn on GitHub Actions for Pages (one time only).** On GitHub, open the repo and go to **Settings > Pages**. Under **Build and deployment > Source**, choose **GitHub Actions**.
4. **Wait for the build.** Open the **Actions** tab and wait for "Deploy to GitHub Pages" to show a green tick. It takes about a minute. The site is then live at the same link as before.

After that, every push to `main` rebuilds and republishes the site automatically.

> If the Actions run fails on the first push because Pages wasn't set to GitHub Actions yet, change the setting in step 3, then open **Actions > Deploy to GitHub Pages > Run workflow**.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Then open the link it prints. It will look like `http://localhost:5173/CV/`.

## Update your content

Everything you'd normally change is in `src/content/`. You don't need to touch any animation code.

| File | What it holds |
|---|---|
| `profile.js` | Name, hook line, roles, contact links, about text |
| `experience.js` | Jobs, newest first (Case History) |
| `projects.js` | The six case files in the film reel |
| `skills.js` | Evidence numbers and skill groups |
| `education.js` | Degrees |

**To add a project screenshot:**
1. Put a 16:9 image in `public/projects/`.
2. Add `image: \`${base}projects/your-file.jpg\`` to that project in `projects.js`.

Projects without an image get a matching noir title card drawn automatically.

**To update your resume:** replace `public/Mohammed_Taher_Abdullah_Resume.pdf` with a new file of the same name.

## How it's put together

```
src/
  content/      your text and links
  components/   one file per section (Preloader, Hero, CaseHistory, CaseFiles ...)
  gl/           Three.js scenes and GLSL shaders (flashlight hero, film reel)
  hooks/        smooth scroll, GSAP setup, reveal animations
  styles/       design tokens, base styles, section styles
```

### Fallbacks

- **Phones and tablets:** the film reel becomes a swipeable strip, and the flashlight drifts by itself or follows your finger.
- **Reduced motion:** visitors who have reduced motion turned on get no smooth scroll and no heavy effects, and the hero shows fully lit.
- **No WebGL:** the hero falls back to plain styled text.
- **Screen readers and search engines:** all text is real HTML underneath the effects, so they can read everything.

## Moving it to another address

The site expects to live at `/CV/`.
- If you rename the repo, change `base` in `vite.config.js` to `/<new-repo-name>/`.
- If you move it to `mo-taher.github.io` itself, change `base` to `/`.

Also update the `og:url` and `og:image` links in `index.html`.
