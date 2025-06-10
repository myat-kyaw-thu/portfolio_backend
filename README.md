# Express Prisma Backend

A robust backend API built with Express.js and Prisma for portfolio management, featuring API key authentication, file uploads, and comprehensive project management capabilities.

## 🚀 Features

- **RESTful API** with Express.js
- **Database ORM** with Prisma
- **API Key Authentication** for secure access
- **File Upload Support** with Cloudinary integration
- **Rate Limiting** for API protection
- **CORS Support** for cross-origin requests
- **Request Logging** with Morgan
- **Project Management** with seeding capabilities
- **Development Tools** with hot reload

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v16 or higher)
- npm or yarn
- A database (PostgreSQL, MySQL, or SQLite)
- Cloudinary account (for file uploads)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/myat-kyaw-thu/portfolio_backend
   cd express-prisma-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="your-database-connection-string"
   
   # API Configuration
   API_KEY="your-api-key"
   PORT=3000
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   
   # CORS Origins (optional)
   ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   ```


## 📦 Dependencies

### Core Dependencies
- **express** - Web framework
- **@prisma/client** - Database ORM client
- **prisma** - Database toolkit
- **dotenv** - Environment variable management

### File Handling
- **cloudinary** - Cloud-based image and video management
- **multer** - File upload middleware
- **express-fileupload** - File upload handling
- **streamifier** - Stream utilities
- **fs-extra** - Enhanced file system operations

### Security & Utilities
- **cors** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting middleware
- **morgan** - HTTP request logger
- **axios** - HTTP client
- **uuid** - Unique identifier generation

---

**Version:** 1.0.0  
**Node.js:** v16+ required  
**Database:** Prisma compatible databases
```

