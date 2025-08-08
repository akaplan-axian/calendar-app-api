# Calendar App API Documentation

Welcome to the Calendar App API documentation. This directory contains comprehensive guides for developers, operators, and contributors.

## 📚 Documentation Index

### Getting Started
- **[Installation Guide](installation.md)** - Set up the development environment (Docker & local)
- **[API Documentation](api.md)** - Complete API reference with examples

### Development
- **[Development Guide](development.md)** - Architecture, workflow, and best practices
- **[Testing Guide](testing.md)** - Testing strategies and code coverage
- **[OpenAPI Guidelines](openapi-guidelines.md)** - Managing the API specification
- **[Code Coverage Standards](code-coverage-standards.md)** - Coverage requirements and monitoring

### Operations
- **[Database Management](database.md)** - Migrations, seeds, and database operations
- **[Deployment Guide](deployment.md)** - Production deployment and scaling
- **[OpenAPI Validation](openapi-validation.md)** - API specification validation

## 🚀 Quick Start

1. **New to the project?** Start with the [Installation Guide](installation.md)
2. **Want to use the API?** Check the [API Documentation](api.md)
3. **Ready to contribute?** Read the [Development Guide](development.md)
4. **Deploying to production?** Follow the [Deployment Guide](deployment.md)

## 📖 Documentation Overview

### For Developers

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [Development Guide](development.md) | Architecture and development workflow | When building features or understanding the codebase |
| [Testing Guide](testing.md) | Testing strategies and coverage | When writing tests or improving code quality |
| [OpenAPI Guidelines](openapi-guidelines.md) | API specification management | When adding/modifying API endpoints |
| [Code Coverage Standards](code-coverage-standards.md) | Coverage requirements | When ensuring code quality and test completeness |

### For API Users

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [API Documentation](api.md) | Complete API reference | When integrating with the API |
| [Installation Guide](installation.md) | Setup instructions | When setting up a local development environment |

### For Operations

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [Deployment Guide](deployment.md) | Production deployment | When deploying or scaling the application |
| [Database Management](database.md) | Database operations | When managing database schema or data |

## 🏗️ Project Architecture

The Calendar App API follows a **schema-first development** approach:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   OpenAPI Spec  │───▶│  openapi-backend │───▶│    Handlers     │
│  (openapi.yaml) │    │   (Validation)   │    │  (Business Logic)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │◀───│  Objection.js   │◀───│     Models      │
│   (Database)    │    │     (ORM)       │    │ (Data Layer)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

- **Framework**: Express.js
- **API Specification**: OpenAPI 3.1.0
- **API Backend**: openapi-backend
- **Database**: PostgreSQL
- **ORM**: Objection.js + Knex.js
- **Validation**: AJV (via openapi-backend)
- **Testing**: Jest
- **Security**: Helmet.js
- **Logging**: Morgan

## 📋 Common Tasks

### Development Tasks

```bash
# Start development environment
docker-compose up -d

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Validate OpenAPI specification
npm run validate-openapi

# Database operations
npm run db:migrate
npm run db:seed
npm run db:reset
```

### API Testing

```bash
# Health check
curl http://localhost:3000/health

# Get all events
curl http://localhost:3000/api/events

# Create an event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "startDate": "2025-08-15T10:00:00Z",
    "endDate": "2025-08-15T11:00:00Z"
  }'
```

## 🔍 Finding Information

### By Topic

- **Setup & Installation** → [Installation Guide](installation.md)
- **API Usage** → [API Documentation](api.md)
- **Code Architecture** → [Development Guide](development.md)
- **Testing** → [Testing Guide](testing.md) & [Code Coverage Standards](code-coverage-standards.md)
- **Database** → [Database Management](database.md)
- **Deployment** → [Deployment Guide](deployment.md)
- **OpenAPI** → [OpenAPI Guidelines](openapi-guidelines.md) & [OpenAPI Validation](openapi-validation.md)

### By Role

**New Developer:**
1. [Installation Guide](installation.md) - Get set up
2. [Development Guide](development.md) - Understand the architecture
3. [API Documentation](api.md) - Learn the API
4. [Testing Guide](testing.md) - Write tests

**API Consumer:**
1. [API Documentation](api.md) - API reference
2. [Installation Guide](installation.md) - Local setup (optional)

**DevOps Engineer:**
1. [Deployment Guide](deployment.md) - Production deployment
2. [Database Management](database.md) - Database operations
3. [Installation Guide](installation.md) - Environment setup

**QA Engineer:**
1. [Testing Guide](testing.md) - Testing strategies
2. [API Documentation](api.md) - API endpoints to test
3. [Code Coverage Standards](code-coverage-standards.md) - Coverage requirements

## 📝 Documentation Standards

### Writing Guidelines

1. **Clear Structure**: Use consistent headings and organization
2. **Code Examples**: Include working code examples
3. **Step-by-Step**: Provide clear, sequential instructions
4. **Cross-References**: Link to related documentation
5. **Keep Updated**: Update docs when code changes

### Maintenance

- **Review Regularly**: Ensure accuracy with current codebase
- **Update Examples**: Keep code examples working and relevant
- **Check Links**: Verify all internal and external links work
- **Version Control**: Track documentation changes with code changes

## 🤝 Contributing to Documentation

### Making Changes

1. **Edit Markdown Files**: Documentation is in Markdown format
2. **Test Examples**: Ensure all code examples work
3. **Update Index**: Update this README if adding new documents
4. **Cross-Reference**: Update links in related documents

### Documentation Checklist

- [ ] Clear, descriptive headings
- [ ] Working code examples
- [ ] Proper internal linking
- [ ] Consistent formatting
- [ ] Up-to-date information
- [ ] Spell-checked content

## 📞 Support

### Getting Help

1. **Check Documentation**: Search these docs first
2. **Review Code**: Look at the source code for examples
3. **Run Tests**: Use tests as usage examples
4. **Check Issues**: Look for similar problems in project issues

### Reporting Issues

When reporting documentation issues:

1. **Specify Document**: Which document has the issue
2. **Describe Problem**: What's unclear or incorrect
3. **Suggest Solution**: How it could be improved
4. **Provide Context**: Your use case or scenario

---

## 📄 Document Status

| Document | Last Updated | Status |
|----------|-------------|---------|
| [Installation Guide](installation.md) | 2025-08-08 | ✅ Current |
| [API Documentation](api.md) | 2025-08-08 | ✅ Current |
| [Development Guide](development.md) | 2025-08-08 | ✅ Current |
| [Testing Guide](testing.md) | 2025-08-08 | ✅ Current |
| [Database Management](database.md) | 2025-08-08 | ✅ Current |
| [Deployment Guide](deployment.md) | 2025-08-08 | ✅ Current |
| [OpenAPI Guidelines](openapi-guidelines.md) | 2025-08-08 | ✅ Current |
| [Code Coverage Standards](code-coverage-standards.md) | 2025-08-08 | ✅ Current |
| [OpenAPI Validation](openapi-validation.md) | Existing | ✅ Current |

---

**Happy coding! 🚀**
