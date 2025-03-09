### 1. Project Breakdown

**App Name:** ProjectMarket  
**Platform:** Web  
**Summary:** ProjectMarket is a web application designed to facilitate the buying and selling of projects. The platform focuses on providing a seamless experience for users to explore, view, and purchase projects. The landing page will showcase featured projects, while the explore section will display a grid of available projects. Users can click on a project to view detailed information, including images and videos. If a user is interested in purchasing a project, they will be directed to fill out a Google Form. The application aims to simplify the process of project discovery and acquisition, making it easy for users to find and buy projects that meet their needs.  

**Primary Use Case:**  
- **Sellers:** Upload and showcase their projects to potential buyers.  
- **Buyers:** Browse, view, and purchase projects by filling out a Google Form.  

**Authentication Requirements:**  
- No user authentication is required for browsing or viewing project details.  
- Sellers will authenticate via Google to upload and manage their projects.  

---

### 2. Tech Stack Overview

**Frontend Framework:** Next.js  
**UI Library:** Tailwind CSS + ShadCN  
**Backend (BaaS):** prisma and neon (data storage, real-time features)  
**Deployment:** Vercel  

---

### 3. Core Features

1. **Landing Page:**  
   - Hero section with a call-to-action (CTA) to explore projects.  
   - Featured projects section with a carousel or grid layout.  

2. **Explore Section:**  
   - Grid layout displaying all available projects.  
   - Each project card includes a thumbnail, title, and short description.  

3. **Project Details Page:**  
   - Displays detailed information about the selected project, including images, videos, and a description.  
   - Includes a CTA button to fill out a Google Form for purchasing the project.  

4. **Google Form Integration:**  
   - Redirects users to a Google Form when they click the "Buy Project" button.  

5. **Admin Dashboard (for sellers):**  
   - Allows authenticated sellers to upload, edit, and manage their projects.  
   - Includes a form for adding project details, images, and videos.  

---

### 4. User Flow

1. **Landing Page:**  
   - User visits the website and sees the hero section and featured projects.  
   - User clicks "Explore Projects" to navigate to the explore section.  

2. **Explore Section:**  
   - User browses through the grid of projects.  
   - User clicks on a project card to view its details.  

3. **Project Details Page:**  
   - User views the project's images, videos, and description.  
   - User clicks "Buy Project" and is redirected to a Google Form to express interest.  

4. **Admin Dashboard (for sellers):**  
   - Seller logs in via Google authentication.  
   - Seller uploads a new project, including images, videos, and a description.  
   - Seller can edit or delete existing projects.  

---

### 5. Design and UI/UX Guidelines

1. **Landing Page:**  
   - Clean and modern design with a focus on the hero section and featured projects.  
   - Use Tailwind CSS for responsive layouts and ShadCN for pre-built components like buttons and cards.  

2. **Explore Section:**  
   - Grid layout with hover effects on project cards to enhance interactivity.  
   - Use Tailwind CSS for spacing and alignment.  

3. **Project Details Page:**  
   - Single-column layout with a sticky CTA button at the bottom.  
   - Use ShadCN for modals or tooltips if additional information is needed.  

4. **Admin Dashboard:**  
   - Simple and intuitive form for project uploads.  
   - Use Tailwind CSS for form styling and ShadCN for input components.  

5. **General Guidelines:**  
   - Maintain a consistent color scheme and typography throughout the app.  
   - Ensure all buttons and links are easily clickable on both desktop and mobile.  

---

### 6. Technical Implementation Approach

1. **Frontend (Next.js + Tailwind CSS + ShadCN):**  
   - Use Next.js for server-side rendering (SSR) and static site generation (SSG) to optimize performance.  
   - Implement Tailwind CSS for utility-first styling and ShadCN for reusable UI components.  
   - Create reusable components for project cards, modals, and forms.  

2. **Backend (Supabase):**  
   - Use Supabase for storing project data, including images and videos.  
   - Set up a `projects` table with fields for `id`, `title`, `description`, `images`, `videos`, and `seller_id`.  
   - Use Supabase Auth for Google authentication for sellers.  

3. **Google Form Integration:**  
   - Embed the Google Form link in the "Buy Project" button on the project details page.  

4. **Deployment (Vercel):**  
   - Deploy the Next.js app on Vercel for seamless CI/CD and automatic scaling.  
   - Configure environment variables for Supabase credentials in Vercel.  

---

### 7. Required Development Tools and Setup Instructions

1. **Development Tools:**  
   - Node.js (v16 or higher)  
   - npm or Yarn for package management  
   - Supabase CLI for local development  
   - Vercel CLI for deployment  

2. **Setup Instructions:**  
   - Clone the repository and install dependencies:  
     ```bash  
     git clone <repository-url>  
     cd projectmarket  
     npm install  
     ```  
   - Set up Supabase:  
     - Create a new project in Supabase.  
     - Initialize the `projects` table and enable Google authentication.  
     - Add Supabase credentials to `.env.local`:  
       ```  
       NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>  
       NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key>  
       ```  
   - Run the development server:  
     ```bash  
     npm run dev  
     ```  
   - Deploy to Vercel:  
     - Push the code to a GitHub repository.  
     - Connect the repository to Vercel and deploy.  

---

This blueprint provides a comprehensive guide for building ProjectMarket using the specified tech stack. Follow the steps and guidelines to create a functional and visually appealing web application.