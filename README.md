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
- **Microservices** - Modular service architecture (Gateway, User, Project, Issue, Sprint, Notification, Workspace)
- **Environment Variables** - Configuration management via `.env`

### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **npm** - Package management

---

## 📁 Project Structure

```
ResolveX/
├── .env                          # Global environment configuration
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git exclusions
├── .dockerignore                 # Docker build exclusions
├── docker-compose.yml            # Multi-container orchestration
│
├── frontend/                     # React + Vite application
│   ├── src/
│   │   ├── api/                 # API client utilities
│   │   ├── components/          # Reusable React components
│   │   ├── contexts/            # React context providers
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx              # Main app component
│   │   ├── App.css              # App styles
│   │   ├── Layout.jsx           # Layout wrapper
│   │   ├── Layout.css           # Layout styles
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── index.html               # HTML entry point
│   ├── package.json             # Frontend dependencies
│   ├── package-lock.json        # Dependency lock file
│   ├── vite.config.js           # Vite configuration
│   ├── eslint.config.js         # ESLint configuration
│   ├── Dockerfile               # Frontend container configuration
│   ├── .dockerignore            # Frontend-specific docker exclusions
│   ├── .gitignore               # Frontend-specific git exclusions
│   └── README.md                # Frontend documentation
│
├── backend/                      # Microservices backend
│   ├── .gitignore               # Backend-specific git exclusions
│   │
│   ├── gateway/                 # API Gateway Service
│   │   ├── src/
│   │   ├── package.json         # Gateway dependencies
│   │   ├── package-lock.json    # Dependency lock file
│   │   ├── Dockerfile           # Gateway container configuration
│   │   └── README.md            # Gateway documentation
│   │
│   └── services/                # Microservices
│       ├── user/                # User Management Service
│       │   ├── src/
│       │   ├── package.json
│       │   ├── Dockerfile       # Service container configuration
│       │   └── README.md
│       ├── project/             # Project Management Service
│       │   ├── src/
│       │   ├── package.json
│       │   ├── Dockerfile       # Service container configuration
│       │   └── README.md
│       ├── issue/               # Issue Tracking Service
│       │   ├── src/
│       │   ├── package.json
│       │   ├── Dockerfile       # Service container configuration
│       │   └── README.md
│       ├── sprint/              # Sprint Management Service
│       │   ├── src/
│       │   ├── package.json
│       │   ├── Dockerfile       # Service container configuration
│       │   └── README.md
│       ├── workspace/           # Workspace Service
│       │   ├── src/
│       │   ├── package.json
│       │   ├── Dockerfile       # Service container configuration
│       │   └── README.md
│       └── notification/        # Notification Service
│           ├── src/
│           ├── package.json
│           ├── Dockerfile       # Service container configuration
│           └── README.md
│
└── README.md                     # This file
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

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env  # Copy and configure if needed
   ```

3. **Setup Backend Environment**
   ```bash
   cd backend
   npm install
   
   # Install dependencies for each microservice
   cd gateway && npm install && cd ..
   cd services/user && npm install && cd ../..
   cd services/project && npm install && cd ../..
   cd services/issue && npm install && cd ../..
   cd services/sprint && npm install && cd ../..
   cd services/workspace && npm install && cd ../..
   cd services/notification && npm install && cd ../..
   ```

4. **Setup Frontend Environment**
   ```bash
   cd frontend
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
# Terminal 1 - Gateway
cd backend/gateway
npm run dev

# Terminal 2 - User Service
cd backend/services/user
npm run dev

# Terminal 3 - Project Service
cd backend/services/project
npm run dev

# Terminal 4 - Issue Service
cd backend/services/issue
npm run dev

# Terminal 5 - Sprint Service
cd backend/services/sprint
npm run dev

# Terminal 6 - Workspace Service
cd backend/services/workspace
npm run dev

# Terminal 7 - Notification Service
cd backend/services/notification
npm run dev

# Terminal 8 - Frontend
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` (Vite default)
The backend API gateway will run on the configured port (check `.env`)

---

## 📦 Available Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend (Gateway & Services)
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

### Run in Background
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f frontend
docker-compose logs -f gateway
docker-compose logs -f user-service
docker-compose logs -f project-service
docker-compose logs -f issue-service
docker-compose logs -f sprint-service
docker-compose logs -f workspace-service
docker-compose logs -f notification-service
```

---

## 🔧 Configuration

### Global Environment Variables (.env)

Create a `.env` file in the root directory:

```env
# ===========================================
# Global Configuration
# ===========================================

# Node Environment
NODE_ENV=development

# ===========================================
# Frontend Configuration
# ===========================================
VITE_API_BASE_URL=http://localhost:5000

# ===========================================
# API Gateway Configuration
# ===========================================
GATEWAY_PORT=5000
GATEWAY_HOST=localhost

# ===========================================
# User Service Configuration
# ===========================================
USER_SERVICE_PORT=5001
USER_SERVICE_HOST=localhost

# ===========================================
# Project Service Configuration
# ===========================================
PROJECT_SERVICE_PORT=5002
PROJECT_SERVICE_HOST=localhost

# ===========================================
# Issue Service Configuration
# ===========================================
ISSUE_SERVICE_PORT=5003
ISSUE_SERVICE_HOST=localhost

# ===========================================
# Sprint Service Configuration
# ===========================================
SPRINT_SERVICE_PORT=5004
SPRINT_SERVICE_HOST=localhost

# ===========================================
# Workspace Service Configuration
# ===========================================
WORKSPACE_SERVICE_PORT=5005
WORKSPACE_SERVICE_HOST=localhost

# ===========================================
# Notification Service Configuration
# ===========================================
NOTIFICATION_SERVICE_PORT=5006
NOTIFICATION_SERVICE_HOST=localhost

# ===========================================
# Database Configuration (if applicable)
# ===========================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resolvex
DB_USER=resolvex_user
DB_PASSWORD=resolvex_password

# ===========================================
# CORS Configuration
# ===========================================
CORS_ORIGIN=http://localhost:5173

# ===========================================
# JWT Configuration (if applicable)
# ===========================================
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=24h

# ===========================================
# Log Configuration
# ===========================================
LOG_LEVEL=debug
```

### Service-Specific Environment Variables

Each microservice can have its own `.env` file in their respective directories for service-specific configurations.

---

## 🎯 Features

- ✅ Project & Task Management
- ✅ User Authentication & Authorization
- ✅ Real-time Updates
- ✅ Responsive UI
- ✅ REST API
- ✅ Docker-based Deployment
- ✅ Microservice Architecture
- ✅ Service-to-Service Communication
- ✅ Scalable and Modular Design

---

## 📚 API Documentation

API endpoints will be documented here. Common patterns:

### Projects
- `GET /api/projects` - Fetch all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Issues/Tasks
- `GET /api/issues` - Fetch all issues
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Sprints
- `GET /api/sprints` - Fetch all sprints
- `POST /api/sprints` - Create new sprint
- `GET /api/sprints/:id` - Get sprint details
- `PUT /api/sprints/:id` - Update sprint

### Users
- `GET /api/users` - Fetch all users
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/users/:id` - Get user details

### Workspaces
- `GET /api/workspaces` - Fetch all workspaces
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/:id` - Get workspace details

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
