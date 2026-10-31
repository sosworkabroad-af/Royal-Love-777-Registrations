Royal Love 777 - registration page
===================================

index.html
  The whole page in one file, with the logo and book images built in.
  Works on computers, tablets and phones. Upload it to any web host
  (GitHub Pages, Vercel, Netlify, royallove777.world).
  Registrations go to the "Royal Love 777 Registrations" Google Sheet,
  on separate tabs: Families, Churches and 3 January.
  Confirmation emails are sent from info@nekotechcenter.org.

royallove-google-sheet-script.gs
  Copy of the Apps Script in the Google Sheet. Keep it as a backup.
  To change the website link in the confirmation email, edit WEBSITES
  near the top. After any change: Deploy > Manage deployments > pencil >
  Version: New version > Deploy (keeps the same URL).

Settings inside index.html (search for "contact:")
  Email shown to visitors:  info@nekotechcenter.org
  WhatsApp fallback:        +1 940 977 1707
  Sheet web app URL:        endpoint: "https://script.google.com/macros/s/.../exec"

GitHub Pages
  Upload index.html and .nojekyll to a public repository, then
  Settings > Pages > Branch: main, folder: /(root) > Save.
