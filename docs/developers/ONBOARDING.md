# Developer Onboarding Guide

## 🚀 Welcome to the Hyperfocus Gift Engine Team

This guide will help you set up your development environment and get familiar with our codebase.

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Python 3.9+
- Git
- Docker (for local development)
- VS Code (recommended)

## 🛠️ Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hyperfocus-gift-engine.git
cd hyperfocus-gift-engine
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install Python dependencies
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements-dev.txt
```

### 3. Configure Environment

Create `.env` files:

```bash
# .env.development
VITE_WS_URL=ws://localhost:8000/ws
NODE_ENV=development
```

## 🏗️ Project Structure

```plaintext
hyperfocus-gift-engine/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── App.jsx         # Main app component
│   └── public/             # Static assets
├── backend/                # Python backend
│   ├── src/
│   │   ├── api/           # WebSocket server
│   │   └── services/      # Business logic
│   └── tests/             # Backend tests
└── docs/                  # Documentation
```

## 🧪 Running the Application

### Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
uvicorn src.main:app --reload

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Run Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
pytest

# End-to-end tests
npm run test:e2e
```

## 📚 Learning Resources

- [React Documentation](https://react.dev/)
- [WebGPU Guide](https://web.dev/webgpu/)
- [Python asyncio](https://docs.python.org/3/library/asyncio.html)
- [WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)

## 🛠️ Development Workflow

### Branch Naming

```
feature/description      # New features
fix/description         # Bug fixes
docs/description        # Documentation changes
refactor/description    # Code refactoring
chore/description       # Maintenance tasks
```

### Commit Message Format

```commit
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

Example:

```commit
feat(ui): add dark mode toggle

- Add theme context
- Implement theme switching
- Update button styles

Closes #123
```

### Code Review Process

1. Create a feature branch
2. Make your changes
3. Write tests
4. Update documentation
5. Submit a pull request
6. Address review comments
7. Get approval from at least one reviewer
8. Squash and merge

## 🏆 Your First Task

1. Pick a `good first issue` from our issue tracker
2. Assign it to yourself
3. Follow the development workflow
4. Ask for help in #dev-support if needed

## 🆘 Getting Help

- **#dev-support** - General development questions
- **#frontend** - Frontend-specific questions
- **#backend** - Backend-specific questions
- **#urgent** - Production issues

## 🎉 Congratulations

You're all set to start contributing to the Hyperfocus Gift Engine!
