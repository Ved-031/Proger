# Proger

A powerful project management platform built with **Next.js 14**, **Hono.js**, and **Appwrite**. Proger offers an intuitive workspace for managing projects, tasks, and team collaboration with modern UI and performance.

## 🚀 Features

- 🏢 **Workspaces** - Organize projects into workspaces.
- 📊 **Projects / Epics** - Manage multiple projects efficiently.
- ✅ **Tasks** - Track and assign tasks with ease.
- 📋 **Kanban Board View** - Visualize task progress.
- 🗃️ **Data Table View** - Manage tasks in a structured table format.
- 📅 **Calendar View** - View tasks and deadlines in a calendar.
- ✉️ **Invite System** - Invite team members to collaborate.
- ⚙️ **Workspace and Project Settings** - Configure workspace and project preferences.
- 🖼️ **Image Uploads** - Upload avatars and attachments.
- 🔌 **Appwrite SDK Integration** - Secure backend with Appwrite.
- ⚛️ **Next.js 14 Framework** - Modern and scalable front-end.
- 🎨 **Shadcn UI & TailwindCSS Styling** - Beautiful and responsive UI.
- 🔍 **Advanced Search and Filtering** - Quickly find relevant tasks and projects.
- 📈 **Analytics Dashboard** - Gain insights with data-driven analytics.
- 👥 **User Roles and Permissions** - Control access levels for users.
- 🔒 **Authentication** - Supports OAuth and email login.
- 📱 **Responsive Design** - Mobile-friendly user experience.
- 🚀 **API using Hono.js** - High-performance server-side API.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, Shadcn UI, TailwindCSS
- **Backend:** Hono.js, Appwrite
- **Database:** Appwrite Database
- **Authentication:** Appwrite (OAuth, Email, JWT)
- **Storage:** Appwrite Storage (for image uploads)

---

## 📦 Installation

### 1. Clone the Repository
```sh
git clone https://github.com/Ved-031/Proger.git
cd proger
```

### 2. Install Dependencies
```sh
bun add # or npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file and add the necessary Appwrite credentials:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=

NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_WORKSPACES_ID=
NEXT_PUBLIC_APPWRITE_MEMBERS_ID=
NEXT_PUBLIC_APPWRITE_PROJECTS_ID=
NEXT_PUBLIC_APPWRITE_TASKS_ID=
NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID=

NEXT_APPWRITE_KEY=
```

### 4. Run the Development Server
```sh
bun run dev  # or npm run dev
```
The application will be available at `http://localhost:3000`

---

## 📜 API Endpoints (Hono.js)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User authentication |
| `/api/auth/signup` | POST | New user registration |
| `/api/workspaces` | GET | Fetch all workspaces |
| `/api/projects` | GET | Get projects under a workspace |
| `/api/tasks` | GET | Retrieve tasks |
| `/api/task/:id` | PATCH | Update task details |
| `/api/workspace/:id` | PATCH | Update workspace details |
| `/api/project/:id` | PATCH | Update project details 

---

## 📌 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for details.

---

## 📬 Contact

For any inquiries, feel free to reach out!

- Email: tellawarved@gmail.com
- GitHub: [@Ved-031](https://github.com/Ved-031)
