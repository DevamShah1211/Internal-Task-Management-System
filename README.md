# 🚀 TaskFlow Management | Enterprise Task Ecosystem

[![.NET 8](https://img.shields.io/badge/.NET-8.0-512bd4?logo=dotnet)](https://dotnet.microsoft.com/download/dotnet/8.0)
[![Angular](https://img.shields.io/badge/Angular-20-dd0031?logo=angular)](https://angular.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**TaskFlow Management** is a state-of-the-art enterprise task orchestration platform. Built with a robust **.NET 8** backend and a high-performance **Angular** frontend, it delivers a seamless, glassmorphic UI experience for teams to collaborate, track, and visualize productivity in real-time.

---

## ✨ Key Features

### 🏢 Core Functionality
- **Dynamic Workbench**: Unified view of all tasks with advanced filtering by priority and status.
- **Smart Dashboard**: Real-time analytics powered by `ngx-charts` providing deep insights into task velocity and priority distribution.
- **Bento Logic**: A modern, responsive dashboard layout that adapts to any screen size.

### 🛡️ Security & Access
- **JWT Authentication**: Industry-standard secure token-based authentication.
- **RBAC (Role-Based Access Control)**: Granular permissions for `Admin` and `User` roles.
- **Protected Routes**: Secure navigation guards preventing unauthorized access.

### 📊 Task Intelligence
- **Priority Matrix**: Automatic categorization into Low, Medium, and High focus areas.
- **Subtask Nesting**: Break down complex projects into manageable pieces.
- **Live Notifications**: Immediate feedback on task assignments and state changes.

---

## 🛠 Tech Stack

### Backend (.NET API)
- **Framework**: ASP.NET Core 8.0 (Web API)
- **Architecture**: Repository Pattern with Service Layer separation.
- **Persistence**: SQL Server via Entity Framework Core.
- **Security**: JWT (Microsoft.AspNetCore.Authentication.JwtBearer).

### Frontend (Angular UI)
- **Framework**: Angular v18/20 (Standalone Components).
- **Styling**: Vanilla CSS with Premium Glassmorphism & Custom Bento Grid.
- **Visualization**: `ngx-charts` for interactive data analytics.
- **State**: RxJS Reactive Streams for real-time UI updates.

---

## 🚀 Getting Started

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18+)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

### 1. Backend Configuration
1. Navigate to `TaskManagement.API`.
2. Update the connection string in `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=YOUR_SERVER;Database=TaskManagement;Trusted_Connection=True;"
   }
   ```
3. Initialize the database:
   ```bash
   dotnet ef database update
   ```
4. Start the API:
   ```bash
   dotnet run
   ```

### 2. Frontend Launch
1. Navigate to `task-management-ui`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot the application:
   ```bash
   npm start
   ```
   *Access the portal at `http://localhost:4200`*

---

## 📁 Project Architecture

```text
TaskManagement/
├── 🗄️ TaskManagement.API      # .NET Core Backend
│   ├── Controllers        # API Endpoints
│   ├── Services           # Business logic & Calculations
│   ├── Models             # Database Entities
│   └── Data               # DBContext & Repository Layer
│
└── 🎨 task-management-ui      # Angular Frontend
    ├── src/app/components # Modular UI elements
    ├── src/app/services   # API integration & RxJS logic
    ├── src/app/models     # TypeScript interfaces
    └── src/app/guards     # Route security handlers
```

---

## 🔑 Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@taskflow.com` | `Admin@123` |

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ for modern engineering teams.*