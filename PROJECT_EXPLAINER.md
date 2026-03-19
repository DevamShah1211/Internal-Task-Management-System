# TaskFlow Management | System Architecture & Logic Explainer

This document provides a comprehensive breakdown of the **TaskFlow Management** platform, covering both the **Backend (.NET API)** and the **Frontend (Angular)**.

---

## 🛠 1. Backend: TaskManagement.API
The backend is built using **ASP.NET Core 8**, following a clean architecture pattern with a clear separation of concerns.

### 📁 Project Structure & Key Files

| Folder/File | Purpose | Logic Description |
| :--- | :--- | :--- |
| `Program.cs` | **Entry Point** | Configures JWT Authentication, DbContext (SQL), Dependency Injection (DI), and Middleware (CORS, Auth). |
| `Controllers/` | **API Endpoints** | Handles HTTP requests. For example, `AuthController.cs` manages Login/Register, and `TasksController.cs` manages CRUD operations. |
| `Models/` | **Core Entities** | Database schemas (e.g., `User.cs`, `TaskItem.cs`). Uses Entity Framework attributes for validation and mapping. |
| `Data/` | **Persistence Layer** | Contains `ApplicationDbContext.cs` which maps our Models to SQL tables, and `DbInitializer.cs` for seeding default data. |
| `Services/` | **Business Logic** | The "brain" of the app. `TaskService.cs` calculates task priority and deadlines, while `AuthService.cs` handles password hashing and Token generation. |
| `Repositories/` | **Data Access** | Decouples business logic from data access. Handles direct database queries using LINQ. |
| `DTOs/` | **Safe Communication** | Data Transfer Objects used to send/receive only the necessary data through the API (preventing sensitive data leaks). |

### 🧠 Core Logical Flows
1. **JWT Security**: When a user logs in, the server validates credentials and returns a digitally signed **JSON Web Token**. All subsequent "protected" calls must include this token in the header.
2. **Role-Based Access**: The system distinguishes between `Admin` and `User`. Admins can manage all tasks and view team statistics, while Users only see their assigned workbench.
3. **Task Analytics**: The statistics sent to the dashboard are calculated in real-time, grouping tasks by their current status and priority level.

---

## 🎨 2. Frontend: task-management-ui
The frontend is a modern **Angular** application using Standalone Components and a premium glassmorphic UI.

### 📁 Project Structure & Key Files

| Folder/File | Purpose | Logic Description |
| :--- | :--- | :--- |
| `src/app/services/` | **API Integration** | `AuthService.ts` manages login state via `BehaviorSubject`. `TaskService.ts` handles all HTTP calls to the backend API. |
| `src/app/components/` | **UI Modules** | Modular pieces of the application. |
| `.../dashboard/` | **Visual Analytics** | Uses `ngx-charts` to render Task Velocity (Area Chart) and Priority Focus (Donut Chart). Includes "Smart Hub" logic for role-based greetings. |
| `.../login/ & /register/` | **Auth Interface** | Implements premium glassmorphism, gradient meshes, and custom form validation. |
| `src/app/guards/` | **Route Protection** | `AuthGuard.ts` prevents unauthenticated users from accessing the dashboard. `AdminGuard.ts` hides sensitive menus from standard users. |
| `src/app/interceptors/` | **HTTP Middleware** | `JwtInterceptor.ts` automatically attaches the JWT token from storage to every outgoing API request. |
| `src/app/models/` | **Type Definitions** | Defines TypeScript interfaces for `Task`, `User`, and `DashboardStats` to ensure code safety. |

### 🧠 Core UI Logic
1. **Reactive State**: The app uses RxJS streams. For example, if you create a task, the dashboard automatically updates because it's listening to the `taskService` data stream.
2. **Smart Hub**: The dashboard greeting changes based on the user's name and the current time of day.
3. **Bento Grid System**: The layout uses a specific CSS Grid system that organizes "widgets" (stats, charts, activity) into a cohesive dashboard that is fully responsive from mobile to ultra-wide monitors.
4. **Bespoke Chart Legend**: Because standard charts often clip text, we implemented a custom HTML legend for the "Priority Focus" chart to ensure high clarity and perfect alignment.

---

## 🔄 Interaction Logic (How They Work Together)
1. **Request**: The Angular frontend sends a request (e.g., "Get my tasks") with a JWT Token.
2. **Verification**: The .NET API verifies the token. If valid, it queries the SQL Database via the Repository.
3. **Processing**: The Service layer processes the data (counts, sorts, filters).
4. **Response**: The API sends back a JSON response.
5. **Render**: Angular receives the JSON, updates the internal state, and the UI components automatically re-render the charts and lists to reflect the new data.
