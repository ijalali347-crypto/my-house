# House Designer website and app

A responsive 2D house planner and 3D viewer, based on the supplied design. This project adds an installable PWA, offline page caching, and JSON design import/export.

## Run locally
Run `python -m http.server 8000` in this folder, then open http://localhost:8000. Do not use file:// for installation or offline support.

## Publish with GitHub Pages
1. Create a repository and upload the contents of this folder to its root, including `.github/workflows/deploy.yml`.
2. Use a `main` branch.
3. In Settings > Pages, set Source to GitHub Actions.
4. Run the Deploy House Designer workflow, or push a commit to main.
5. Open the URL shown by the successful deployment. Repository Pages URLs normally have the form https://USERNAME.github.io/REPOSITORY/.

Public repositories support Pages on GitHub Free. Private repository Pages access depends on your GitHub plan.

## Install the application
- Supporting Android/desktop browsers: use Install app when shown, or the browser's installation menu.
- iPhone/iPad: open the published website in Safari and use Share > Add to Home Screen.
- Installation availability depends on browser and device. This is a web app, not an APK or App Store submission.

## Saving and backups
Edits save in the current browser's local storage. Use Download design for a JSON backup, and Open design to restore it on another device. Import asks before replacing the current layout. No cloud account or cross-device automatic syncing is included.

## Offline and 3D
After the first online visit and service worker activation, the 2D editor can reopen offline. Three.js and OrbitControls are loaded from their existing CDNs and cached when successfully fetched under service-worker control. Revisit online before relying on offline 3D. First use needs internet. Fonts are also loaded online with system fallbacks. WebGL support is required for 3D.

## Source files
index.html, styles.css, app.js preserve the supplied editor. pwa.js adds install and backup controls. sw.js caches the application. manifest.webmanifest and icons define the installed app. The GitHub Actions workflow validates syntax and publishes only website assets.

The layout is conceptual: overlapping room areas are counted separately, and doors/windows are decorative in 3D rather than structural wall cutouts. Do not treat it as engineering or permit-ready drawings.
