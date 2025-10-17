README - International Remote Staff (static site v2)
---------------------------------------------
Files included:
- index.html
- services.html
- about.html
- testimonials.html
- contact.html
- styles.css
- main.js

Images:
The site references public image URLs. Replace them with local files in /assets/img if preferred.

EmailJS setup (to receive contact form submissions to your email):
1. Go to https://www.emailjs.com and create a free account.
2. Add an email service (e.g., Gmail) under Email Services.
3. Create an email template; include variables (e.g., name, email, message).
4. Note your Service ID, Template ID and Public Key (User ID).
5. In main.js replace:
   - service_xxx  -> your Service ID
   - template_xxx -> your Template ID
   - user_xxx     -> your Public Key (user ID)
6. Optionally uncomment and use the emailjs.send(...) call in main.js to enable sending.

Chat bubble:
- The chat is a simple canned-response widget implemented in main.js.
- You can edit responses in the 'canned' array in main.js

Testimonials:
- Testimonials added via the form are stored in browser localStorage (key: testimonials_v1).
- To add permanent testimonials for all visitors, edit testimonials HTML or connect to a backend.

Deploy:
- Upload the folder to Netlify, Vercel, or GitHub Pages.
- For Netlify: drag-and-drop the folder to Netlify Sites.
- For Vercel: use 'vercel' CLI or import repository.

Replace placeholders:
- Search for 'example@email.com' and replace with your real email in the HTML or EmailJS template.
- Replace image URLs in the HTML files with your own assets.

Need help?
- Tell me and I can update the files further (translate to Spanish, add favicon, or configure a simple backend).
