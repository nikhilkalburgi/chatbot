# Asymmetri Chat Bot – Rapid Landing Page MVP Generator

Welcome to the Asymmetri Chat Bot! This project is an AI-powered chatbot that generates well-structured HTML and CSS code for landing pages, provides a live preview, and allows you to download your code—all in one seamless chat interface.

🌐 **Live Demo:** [https://chatbot-ashy-pi.vercel.app/](https://chatbot-ashy-pi.vercel.app/)

---

## 🚀 Features

- **AI Chatbot**: Generate HTML/CSS/JS for landing pages using natural language prompts.
- **Live Preview**: Instantly see your generated code rendered in the browser.
- **Download**: Download HTML, CSS, or JS files with one click.
- **Authentication**: Secure login/signup with NextAuth.js.
- **Chat History**: View your previous chats and generated code.
- **Responsive UI**: Built with Tailwind CSS and ShadcnUI for a modern look.

---

## 🛠️ Tech Stack & Why

- **Next.js**: Modern React framework for fast, scalable, and SEO-friendly web apps.
- **Supabase + Prisma**: Supabase provides a hosted PostgreSQL database; Prisma offers type-safe, developer-friendly ORM for data access.
- **Vercel**: Effortless deployment and serverless hosting, optimized for Next.js.
- **NextAuth.js**: Secure, flexible authentication with support for email/password and social logins.
- **Tailwind CSS & ShadcnUI**: Rapidly build beautiful, customizable UIs with utility-first CSS and accessible React components.
- **Vercel AI SDK + Google Gemini/OpenAI**: Integrate state-of-the-art GenAI models for code generation.
- **TypeScript**: Type safety for maintainable, robust code.
- **react-markdown**: Convert the Markdown form of AI response to HTML.

---

## 🧑‍💻 Getting Started

### 1. **Clone the Repository**

```sh
git clone https://github.com/yourusername/chat-sample.git
cd chat-sample
```

### 2. **Install Dependencies**

```sh
npm install
```

### 3. **Set Up Environment Variables**

Create a `.env` file in the project root and add:

```text
DATABASE_URL=your-supabase-postgres-connection-string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-genai-api-key
```

### 4. **Push Prisma Schema to Supabase**

```sh
npx prisma db push
npx prisma generate
```

### 5. **Run the Development Server**

```sh
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app locally.

---

## 🚢 Deploying to Vercel

1. Push your code to GitHub/GitLab/Bitbucket.
2. Import your repo in [Vercel](https://vercel.com/).
3. Add all environment variables in the Vercel dashboard.
4. Deploy and enjoy your AI-powered landing page builder!
