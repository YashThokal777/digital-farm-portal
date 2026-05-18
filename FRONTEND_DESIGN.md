# Frontend Design and UI/UX

## 5.1 Introduction

The **Digital Farm Portal** frontend is developed using **React.js**, styled with custom CSS for a clean and functional interface, and connected to a Node.js + Express.js backend with a MySQL database.

The design ensures:
-   A modern, responsive, and interactive UI/UX suitable for both desktop and mobile devices.
-   Role-based navigation and dashboards for Farm Managers, Farm Workers, and System Administrators.
-   Secure integration with backend APIs for real-time updates on animal health, inventory, and biosecurity.
-   Comprehensive validation and usability to ensure data accuracy and ease of use in a busy farm environment.

Users interact through intuitive forms and dashboards, while managers and administrators control farm resources and monitor operations efficiently.

## 5.2 Designed Web Pages

**1. Login & Registration Page**
-   **Purpose**: Provide secure authentication and role-based account creation.
-   **Key Features**:
    -   Form validation (username, password strength, role selection).
    -   Role-based redirection to the appropriate dashboard upon login.
    -   Clear error/success messages for login and registration attempts.
-   **API Integration**: `/api/auth/register`, `/api/auth/login`.

**2. Role-Specific Dashboards (Manager & Worker)**
-   **Purpose**: A personalized landing page for each user role, showing relevant, at-a-glance information.
-   **Key Features**:
    -   **Manager/Owner**: Widgets for low-stock alerts, recent animal health issues, and pending biosecurity tasks.
    -   **Worker**: A simplified view showing assigned daily tasks and quick-log buttons for activities.
-   **API Integration**: `/api/dashboard/summary`.

**3. Animal Management Page**
-   **Purpose**: Allow authorized users to manage all animal records.
-   **Key Features**:
    -   A searchable and filterable table of all animals on the farm.
    -   Forms to add new animals and edit existing records.
    -   A detailed view for each animal, showing its health history and other vital statistics.
-   **API Integration**: `/api/animals`, `/api/health-records`.

**4. Inventory Management Page**
-   **Purpose**: Provide a centralized system for tracking all farm inventory.
-   **Key Features**:
    -   A tabbed interface to switch between **Feed**, **Medicine**, and **Equipment**.
    -   Forms for adding new stock and logging usage or purchases.
    -   Real-time display of low-stock and expiry-date alerts.
-   **API Integration**: `/api/inventory/feed`, `/api/inventory/medicine`, `/api/inventory/equipment`.

**5. Biosecurity Management Page**
-   **Purpose**: To log, monitor, and manage all biosecurity-related activities.
-   **Key Features**:
    -   Modules for **Visitor Logs**, **Cleaning Schedules**, and **Environmental Monitoring**.
    -   Forms for visitor check-in/check-out and logging cleaning activities.
    -   Dashboards to visualize environmental data (e.g., temperature, humidity).
-   **API Integration**: `/api/biosecurity/visitors`, `/api/biosecurity/cleaning`.

**6. Reports Page**
-   **Purpose**: Provide analytical insights for farm managers and owners.
-   **Key Features**:
    -   Generate reports on animal health trends, inventory consumption, and biosecurity compliance.
    -   Filters to customize reports by date range or farm area.
-   **API Integration**: `/api/reports/inventory`, `/api/reports/biosecurity`.

**7. User Management Page (Admin Only)**
-   **Purpose**: Allow administrators to manage user accounts and roles.
-   **Key Features**:
    -   A table of all users with options to edit roles or deactivate accounts.
    -   Secure forms for creating new user profiles.
-   **API Integration**: `/api/users`.

## 5.3 UI/UX Highlights

-   **Responsive Design**: The interface is optimized for desktops, tablets, and mobile phones, ensuring accessibility for workers in the field.
-   **Reusable Components**: Key UI elements like `Navbar`, `Sidebar`, form inputs, and data tables are built as reusable React components for consistency.
-   **Validation**: Handled at both the frontend (for immediate feedback) and backend (for data integrity) to ensure accuracy.
-   **Dynamic Data Rendering**: The UI is state-driven and updates in real-time based on API responses, without requiring page reloads.
-   **Error Handling**: User-friendly messages are displayed for invalid actions (e.g., insufficient inventory, duplicate animal tag).
