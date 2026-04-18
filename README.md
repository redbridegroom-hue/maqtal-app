# Maqtal al-Imam al-Hussain (AS) - Cinematic Web App

An ultra-premium, cinematic, and fully progressive web application dedicated to the martyrdom narrative of Imam Hussain ibn Ali (peace be upon him) at Karbala. 

This project aims to provide a deeply immersive, reverent, and focused reading and listening experience, synchronizing the classical Arabic narrative with English translations over a high-quality local audio recitation.

![App Preview](icon.svg) <!-- Note: We can update this with a real screenshot later -->

## 🌟 Elite Tier Features

- **Progressive Web App (PWA):** Fully offline-capable. Can be installed directly to the home screen on iOS and Android devices, behaving completely like a native app.
- **Cinematic Audio Sync Engine:** The UI actively responds to the audio. The actively recited verse illuminates with a soft glowing border and slight scale increase, while non-active verses fade into the background (Theater Mode).
- **Advanced Theme Customization Studio:** Users can heavily customize their reading aesthetics via a slide-out control panel:
  - **6 Aesthetic Presets:** Cinematic Dark, Deep Midnight, Soft Minimalist, Modern Slate, Classical Parchment, and Warm Sepia.
  - **7 Ambient Accent Colors:** Instantly hot-swap glowing accents (Gold, Crimson, Emerald, Sapphire, Amethyst, Rose Gold, Ruby).
  - **Independent Typography Scaling:** Smooth sliders to control English and Arabic text sizes individually.
- **English Transliteration Engine:** A toggleable transliteration layer for readers looking to follow the Arabic pronunciation accurately.
- **Historical Glossaries & Tooltips:** Embedded UI tooltips (dotted underlines) detailing key companions and places directly within the text flow.
- **Social "Share Quote" Capabilities:** A custom canvas engine allows users to photograph aesthetic text blocks and instantly download them as high-quality `.png` images suitable for Instagram/WhatsApp sharing.

## 🛠️ Technology Stack
- **HTML5 & CSS3:** No frontend frameworks. Pure, vanilla glassmorphism, responsive grid layouts, and cutting-edge CSS variable manipulation for real-time theme swapping.
- **Vanilla Javascript (ES6):** Utilizing `IntersectionObserver` for scroll-spy updates, `localStorage` for theme caching, and the Web Service Worker API for offline persistence.
- **html2canvas:** Lightweight library utilized for the social media quote generator.

## 🚀 Local Development
1. Clone the repository: `git clone https://github.com/redbridegroom-hue/maqtal-app.git`
2. Open `index.html` in your web browser or run it via a local development server (like VS Code Live Server) to prevent CORS issues with the Service Worker.

---
*Dedicated to the martyrs of Karbala.*
