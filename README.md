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

## Multi-floor designer
- Choose Home, Office or Blank project, then Start new project. Replacements ask first and can be undone.
- Edit up to five independent floors; copy the selected floor to a new level or add a blank one. Floor height is adjustable.
- 3D display offers selected floor, whole building and separated floors. Fit 3D view recentres the camera.
- Choose Rectangle, L-shaped corner, Unequal sides or Rounded corner. Edit plot lets you drag corners, edit exact coordinates, add corners by tapping edges, and curve outgoing edges with a bend handle. Boundary crossings are rejected.
- Draw wall uses two taps. Curved wall uses three taps: start, end and bend. Select a custom wall to edit its endpoints, height, thickness and colour.
- Remove deletes furniture, custom walls, room edges or rooms. Individual room edges can also be toggled in Selected. Undo/Redo keeps the latest 35 states.
- Stairs are in the Building furniture group, rendered at the chosen floor height. They are conceptual models; slab openings and structural connections are not automatically engineered.
- JSON backups now preserve all floors, wall properties and boundary curves. Earlier single-floor backups remain supported. Existing saved browser layouts migrate to a ground-floor project.
- Plot changes may leave existing elements crossing the new boundary. A warning identifies this; move or resize them. 2D content and 3D room floors are clipped to the plot. Furniture whose centres fall outside the boundary is omitted from 3D.

Walls and slab geometry are conceptual. Doors and windows remain decorative models rather than automatic holes in custom walls. The editor does not calculate structural loads or produce construction drawings.
