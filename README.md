# 🚀 ResolveX - Jira-Style Project Management Platform

A **microservice-based project management clone** built with a modern tech stack, demonstrating enterprise-grade architecture patterns and container orchestration.

---

## 📋 About

ResolveX is a comprehensive project management solution inspired by Jira, designed to showcase:

- **Microservice Architecture**: Independent, scalable services running in isolated containers
- **Container Orchestration**: Docker Compose-based deployment and service management
- **Separation of Concerns**: Clean boundaries between frontend and backend services
- **Modern Development**: Latest frameworks and tools for rapid development

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI library with hooks and modern patterns
- **Vite 8.0** - Lightning-fast build tool and dev server with HMR
- **React Router DOM 7.17** - Client-side routing
- **Axios 1.17** - HTTP client for API communication
- **ESLint** - Code quality and linting

### Backend
- **Node.js + Express** - RESTful API server
- **Environment Variables** - Configuration management via `.env`

### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **npm** - Package management

---

## 📁 Project Structure

```
ResolveX/
├── frontend/                  # React + Vite application
│   ├── src/                  # React components and pages
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
│
├── backend/                  # Node.js API server
│   ├── .env                  # Environment configuration
│   ├── package.json          # Backend dependencies
│   └── ...                   # API routes and middleware
│
├── docker-compose.yml        # Multi-container orchestration
├── .dockerignore              # Docker build exclusions
├── .gitignore               # Git exclusions
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and npm
- **Docker** & **Docker Compose**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/satwik425/ResolveX.git
   cd ResolveX
   ```

2. **Setup Backend Environment**
   ```bash
   cd backend
   cp .env.example .env  # Copy and configure if needed
   npm install
   ```

3. **Setup Frontend Environment**
   ```bash
   cd ../frontend
   npm install
   ```

### Development

#### Option 1: Using Docker Compose (Recommended)
```bash
docker-compose up
```
This will start all services containerized and orchestrated together.

#### Option 2: Local Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` (Vite default)
The backend API will run on the configured port (check `.env`)

---

## 📦 Available Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend
```bash
npm run dev      # Start development server with nodemon
npm run build    # Build for production (if applicable)
npm run start    # Start production server
```

---

## 🐳 Docker Deployment

### Build Images
```bash
docker-compose build
```

### Run Services
```bash
docker-compose up
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
```

---

## 🔧 Configuration

### Environment Variables (.env)

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (if applicable)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resolvex
DB_USER=user
DB_PASSWORD=password

# API Configuration
API_BASE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:5173
```

---

## 🎯 Features

- ✅ Project & Task Management
- ✅ User Authentication & Authorization
- ✅ Real-time Updates
- ✅ Responsive UI
- ✅ REST API
- ✅ Docker-based Deployment
- ✅ Microservice Architecture

---

## 📚 API Documentation

API endpoints will be documented here. Common patterns:

- `GET /api/projects` - Fetch all projects
- `POST /api/projects` - Create new project
- `GET /api/tasks` - Fetch tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 📞 Support

For questions or issues:
- Create an [GitHub Issue](https://github.com/satwik425/ResolveX/issues)
- Check existing issues for solutions

---

## 🙌 Acknowledgments

- Inspired by Jira's project management interface
- Built with modern microservice best practices
- Docker and containerization best practices

---

**Happy Building! 🎉**
