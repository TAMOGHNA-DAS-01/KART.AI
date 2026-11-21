# KART.AI — AI-Powered Marketplace

**KART.AI** is a full-stack e-commerce app with a minimalist storefront, an admin dashboard, an AI shopping assistant and image-based product search. It is built with the **MERN stack** and **TanStack Start**.

> Based on the original KART.AI project by **Ashmit Banerjee** (ISC License). This fork has been modified; see "What changed in this version" below.

---

## Features

- **AI Shopping Assistant**: a chatbot powered by **Google Gemini** that answers questions about the products in the catalog.
- **Visual Search**: upload a photo and find similar products. Image embeddings are generated in the backend with a pretrained **CLIP** model (via `@huggingface/transformers`), and matching is done with **MongoDB Atlas Vector Search**.
- **Checkout (demo)**: orders are created and marked as paid without a real payment gateway. No money is taken.
- **Order emails**: confirmation emails are sent through **EmailJS**.
- **Admin dashboard**: add and delete products, with image uploads to **Cloudinary**.
- **Authentication**: JWT-based sign up and login.

---

## Tech Stack

**Frontend:** React 19, TypeScript, TanStack Start, TanStack Query, Tailwind CSS, Framer Motion, Radix UI, Lucide React

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Multer, Cloudinary

**AI and third-party:** Google Gemini API, CLIP (`Xenova/clip-vit-base-patch32`) via transformers.js, MongoDB Atlas Vector Search, EmailJS

---

## Getting Started

### 1. Prerequisites
- Node.js 18 or higher
- A MongoDB Atlas cluster
- Accounts and keys for Cloudinary, Google Gemini and EmailJS

### 2. Clone the repository
```bash
git clone https://github.com/TAMOGHNA-DAS-01/KART.AI.git
cd KART.AI
```

### 3. Environment setup
Create a `.env` file in the root folder:
```
PORT=3000
CLIENT_URL=http://localhost:8080
MONGO_URI=your_mongodb_uri
JWT_SECRET=a_long_random_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_key
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_ORDER_TEMPLATE_ID=your_template_id
```

Create `frontend/.env.development`:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=KART.AI
```

### 4. Vector search index
In MongoDB Atlas, create a **Vector Search** index named `vector_index` on the `products` collection of your database:
```json
{
  "fields": [
    { "type": "vector", "path": "vector_embedding", "numDimensions": 512, "similarity": "cosine" }
  ]
}
```

### 5. Install and run
Backend (from the root folder):
```bash
npm install
npm run dev
```

Frontend (from the `frontend` folder):
```bash
cd frontend
npm install
npm run dev
```
Open the address the frontend prints (normally http://localhost:8080).

To use the admin dashboard, sign up on the site, then set `isAdmin` to `true` on your user in the `users` collection in MongoDB.

---

## Project Structure
```
├── frontend/          # TanStack Start / React app
│   └── src/           # components, routes, lib (API client, context)
├── src/               # Node.js backend
│   ├── controllers/   # Request handlers
│   ├── models/        # Mongoose schemas (User, Product, Order)
│   ├── routes/        # Express routes
│   ├── services/      # Image embedding service
│   └── utils/         # Email service
└── server.js          # Backend entry point
```

---

## What changed in this version
- Replaced the Stripe checkout with a demo checkout.
- Image embeddings now run inside the backend instead of an external server.
- Updated the Gemini model name.
- Removed a duplicate React plugin from the frontend Vite config.
- Added order confirmation emails through EmailJS.

---

## License and credits
This project is licensed under the **ISC License**.

Original project by **Ashmit Banerjee**. Modified by **Tamoghna Das**.
