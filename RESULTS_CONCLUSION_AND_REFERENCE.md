# Digital Farm Portal - Results, Conclusions & References

## System Testing and Results

### 8.1 Introduction

The **Digital Farm Portal** is a web application built using **React.js** (frontend), **Node.js with Express.js** (backend), and **MySQL** (database).

The system provides role-based access for different farm personnel:
-   **Farm Workers** → Log daily activities (e.g., cleaning, feeding), view tasks, and report observations.
-   **Farm Managers/Owners** → Manage animal records, oversee inventory, monitor biosecurity, and generate reports.
-   **System Administrators** → Manage users, oversee all farms, and ensure system integrity.

To ensure correctness and reliability, the system was tested with functional test cases (covering user registration, animal management, and inventory updates) and a boundary test case (validating inventory constraints).

### 8.2 Functional Test Cases

Functional test cases are designed to verify whether the system behaves as expected under normal operating conditions. They check that each feature of the application works according to the requirements.

| Test Case ID | Description | Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F01** | New Farm Worker Registration | Username: `bob_worker`, Role: `farm_worker`, Password: `test123` | User is created in the `users` table with the correct role. Response: "User registered successfully". | User created in DB, confirmation shown on UI. | **Passed** |
| **TC-F02** | Farm Manager Login | Username: `mary_manager`, Password: `demo123` | Credentials validated. Response: "Login successful". Redirected to the Farm Manager Dashboard. | Login successful, JWT session created, manager dashboard loaded with correct widgets. | **Passed** |
| **TC-F03** | Add a New Animal Record | Animal Details: `tag_number: PIG-015`, `species: pig`, `farm_id: 1` | 1. Animal record inserted into `animals` table. 2. Response: "Animal added successfully". 3. UI updates to show the new animal. | Animal record created, success message displayed, and animal list refreshed. | **Passed** |
| **TC-F04** | Log Inventory Usage | `medicine_id: 5`, `quantity_used: 10` | 1. Transaction begins. 2. `INSERT` into `inventory_transactions`. 3. `UPDATE` reduces quantity in `medicine_inventory`. 4. Transaction commits atomically. | Inventory transaction completed successfully with rollback protection. | **Passed** |

*Table 1: Functional Test Cases*

### 8.3 Boundary Test Case

Boundary test cases are designed to test the edge conditions or limits of the system. They ensure that the system can handle inputs at the maximum, minimum, or invalid boundaries without failing.

| Test Case ID | Description | Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-B01** | Inventory Quantity Validation | `medicine_id: 5` (current quantity: 8), `quantity_used: 10` | Transaction is rolled back when insufficient quantity is detected. Error message: "Insufficient inventory quantity available." | Transaction was automatically rolled back, maintaining data consistency. | **Passed** |

*Table 2: Boundary Test Case*

### 8.4 Short User Manual

**1. Login & Registration**
-   **Register**: Navigate to `/register`, fill in your details, and select your role (`farm_worker`, `farm_manager`, etc.).
-   **Login**: Navigate to `/login` and enter your credentials. You will be redirected to your role-specific dashboard.

**2. Farm Manager / Owner Functions**
-   **Add Animal**: From the "Animals" dashboard, click "Add Animal" and fill in the required details (tag number, species, etc.).
-   **Manage Inventory**: Navigate to the "Inventory" section to add new stock, log usage, and view low-stock/expiry alerts.
-   **View Reports**: Access the "Reports" dashboard to see summaries of animal health, biosecurity, and inventory levels.

**3. Farm Worker Functions**
-   **Log Activities**: From your dashboard, log daily tasks such as cleaning, feeding, or environmental checks.
-   **View Tasks**: Check your assigned tasks and mark them as complete.
-   **Report Issues**: Use the system to report any animal health issues or equipment malfunctions immediately.

**4. Error Handling**
-   Invalid actions (e.g., duplicate username, incorrect password, insufficient inventory) are rejected with clear error messages.
-   The database uses transaction rollbacks for critical operations to ensure data consistency.

## Introduction

The Digital Farm Portal represents a comprehensive solution for modern agricultural management, specifically designed for pig and poultry operations. This system addresses critical challenges in farm management through a role-based digital platform that integrates animal health monitoring, biosecurity management, inventory tracking, and regulatory compliance.

### Project Overview
The Digital Farm Portal was developed as a web-based application using modern technologies including React.js for the frontend, Node.js/Express.js for the backend, and MySQL for data management. The system implements a 4-role user hierarchy (System Administrator, Farm Owner, Farm Manager, Farm Worker) with tailored workflows for each user type.

### Key Achievements
- **Comprehensive Farm Management**: Complete digitization of farm operations from animal tracking to compliance reporting
- **Role-Based Access Control**: Secure, hierarchical user management with appropriate permissions
- **Biosecurity Compliance**: Automated visitor management, environmental monitoring, and cleaning verification
- **Mobile-Optimized Interface**: Field-worker friendly design for on-site operations
- **Regulatory Compliance**: Built-in audit trails and reporting for regulatory requirements

### System Scope
The implemented system covers:
- User authentication and authorization
- Farm and animal management
- Health record tracking and veterinary coordination
- Biosecurity protocols and monitoring
- Inventory management with automated alerts
- Comprehensive reporting and analytics
- Mobile-responsive design for field operations

## 8.2 Functional Test Cases

### Test Case 1: User Authentication and Role-Based Access
**Test ID**: TC_AUTH_001
**Objective**: Verify user login functionality and role-based dashboard redirection
**Preconditions**: Valid user accounts exist for all roles

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Navigate to login page | Login form displays correctly | ✅ Pass |
| 2 | Enter valid admin credentials | Successful login message | ✅ Pass |
| 3 | Verify dashboard redirection | Admin dashboard loads with full system access | ✅ Pass |
| 4 | Logout and login as farm manager | Manager dashboard with operational features | ✅ Pass |
| 5 | Attempt to access admin functions | Access denied with appropriate error message | ✅ Pass |

**Result**: All authentication flows work correctly with proper role-based restrictions.

### Test Case 2: Animal Registration and Health Record Management
**Test ID**: TC_ANIMAL_001
**Objective**: Test complete animal lifecycle management workflow
**Preconditions**: User logged in as Farm Manager, farm exists

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Navigate to Animal Management | Animal list displays correctly | ✅ Pass |
| 2 | Click "Add New Animal" | Animal registration form opens | ✅ Pass |
| 3 | Fill required fields (tag, species, breed) | Form validation works correctly | ✅ Pass |
| 4 | Submit animal registration | Animal created successfully, appears in list | ✅ Pass |
| 5 | Click on animal to view details | Animal profile page loads with health history | ✅ Pass |
| 6 | Add health record | Health record form opens | ✅ Pass |
| 7 | Submit health observation | Record saved, appears in animal history | ✅ Pass |

**Result**: Complete animal management workflow functions correctly.

### Test Case 3: Biosecurity Visitor Management
**Test ID**: TC_BIOSEC_001
**Objective**: Test visitor check-in/check-out process with health screening
**Preconditions**: User logged in as Farm Worker, farm areas configured

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Navigate to Visitor Management | Visitor dashboard displays | ✅ Pass |
| 2 | Click "Register New Visitor" | Visitor registration form opens | ✅ Pass |
| 3 | Fill visitor details and purpose | Form accepts all required information | ✅ Pass |
| 4 | Complete health declaration | Health screening questions display | ✅ Pass |
| 5 | Submit visitor registration | Visitor checked in, status shows "On Site" | ✅ Pass |
| 6 | Record disinfection completion | Disinfection status updated | ✅ Pass |
| 7 | Process visitor checkout | Exit time recorded, status updated | ✅ Pass |

**Result**: Biosecurity visitor management workflow operates correctly.

### Test Case 4: Inventory Management and Alerts
**Test ID**: TC_INVENTORY_001
**Objective**: Test inventory tracking and automated alert generation
**Preconditions**: User logged in as Farm Manager, inventory items exist

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Navigate to Inventory Management | Inventory dashboard displays all categories | ✅ Pass |
| 2 | Select Feed Inventory tab | Feed items list with quantities | ✅ Pass |
| 3 | Add new feed item with low quantity | Item added successfully | ✅ Pass |
| 4 | Check alerts panel | Low stock alert generated automatically | ✅ Pass |
| 5 | Update feed quantity above threshold | Alert status updated | ✅ Pass |
| 6 | Add medicine with near expiry date | Expiry warning alert triggered | ✅ Pass |

**Result**: Inventory management and alert system functioning correctly.

### Test Case 5: Report Generation and Analytics
**Test ID**: TC_REPORTS_001
**Objective**: Test dashboard analytics and report generation
**Preconditions**: System contains sample data across all modules

| Step | Action | Expected Result | Status |
|------|--------|----------------|--------|
| 1 | Access dashboard as Farm Owner | High-level metrics display correctly | ✅ Pass |
| 2 | View animal health statistics | Charts show health trends and alerts | ✅ Pass |
| 3 | Check biosecurity compliance score | Compliance percentage calculated correctly | ✅ Pass |
| 4 | Generate monthly health report | PDF report generated with all data | ✅ Pass |
| 5 | Export inventory report | CSV export contains accurate data | ✅ Pass |

**Result**: Reporting and analytics features work as expected.

## 8.3 Boundary Test Cases

### Boundary Test Case 1: User Input Validation
**Test ID**: TC_BOUNDARY_001
**Objective**: Test system behavior with edge case inputs

| Field | Minimum Value | Maximum Value | Invalid Input | System Response |
|-------|---------------|---------------|---------------|-----------------|
| Animal Weight | 0.1 kg | 1000 kg | -5 kg | ❌ Error: "Weight must be positive" |
| Tag Number | 1 character | 50 characters | 51 characters | ❌ Error: "Tag number too long" |
| Temperature | -50°C | 100°C | 150°C | ❌ Error: "Temperature out of range" |
| Visitor Name | 1 character | 100 characters | Empty string | ❌ Error: "Name is required" |
| Feed Quantity | 0.01 kg | 999999.99 kg | 0 kg | ❌ Error: "Quantity must be greater than 0" |

**Result**: All boundary validations work correctly, preventing invalid data entry.

### Boundary Test Case 2: Date Range Validation
**Test ID**: TC_BOUNDARY_002
**Objective**: Test date field validations and constraints

| Test Scenario | Input | Expected Result | Status |
|---------------|-------|----------------|--------|
| Animal birth date in future | 2025-12-31 | Error: "Birth date cannot be in future" | ✅ Pass |
| Health record date before birth | 2020-01-01 (animal born 2024-01-01) | Error: "Record date invalid" | ✅ Pass |
| Medicine expiry in past | 2023-01-01 | Warning: "Medicine expired" | ✅ Pass |
| Visitor entry time in future | Tomorrow's date | Error: "Entry time cannot be future" | ✅ Pass |

**Result**: Date validation boundaries properly enforced.

### Boundary Test Case 3: Concurrent User Operations
**Test ID**: TC_BOUNDARY_003
**Objective**: Test system behavior under concurrent access

| Test Scenario | Concurrent Users | Operation | Expected Result | Status |
|---------------|------------------|-----------|----------------|--------|
| Multiple users editing same animal | 2 users | Update animal details | Last save wins, conflict warning | ✅ Pass |
| Simultaneous visitor check-ins | 5 users | Register visitors | All registrations processed | ✅ Pass |
| Concurrent inventory updates | 3 users | Update feed quantities | Individual updates processed | ✅ Pass |
| Dashboard data loading | 10 users | Load dashboard | All users receive data within 3 seconds | ✅ Pass |

**Result**: System handles concurrent operations correctly without data corruption.

### Boundary Test Case 4: Database Constraints
**Test ID**: TC_BOUNDARY_004
**Objective**: Test database constraint enforcement

| Constraint Type | Test Action | Expected Result | Status |
|-----------------|-------------|----------------|--------|
| Unique tag number | Add animal with existing tag | Error: "Tag number already exists" | ✅ Pass |
| Foreign key constraint | Delete farm with animals | Error: "Cannot delete farm with animals" | ✅ Pass |
| Required field | Submit form with missing data | Error: "Required fields missing" | ✅ Pass |
| Data type constraint | Enter text in numeric field | Error: "Invalid data type" | ✅ Pass |

**Result**: Database constraints properly enforced at application level.

## 8.4 Short User Manual

### Getting Started

#### System Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet Connection**: Stable broadband connection
- **Device**: Desktop, tablet, or smartphone (responsive design)
- **Screen Resolution**: Minimum 1024x768 (optimized for mobile)

#### Initial Setup
1. **Access the System**: Navigate to the Digital Farm Portal URL
2. **Login**: Use provided credentials based on your role
3. **First-Time Setup**: Complete profile information if required

### User Roles and Access

#### System Administrator
- **Primary Functions**: User management, system configuration, analytics
- **Key Features**: 
  - Create and manage user accounts
  - Configure system settings
  - Access all system data and reports
  - Monitor system performance

#### Farm Owner
- **Primary Functions**: Portfolio oversight, strategic planning, compliance
- **Key Features**:
  - View multiple farm performance metrics
  - Generate compliance reports
  - Financial oversight and analytics
  - Strategic decision-making tools

#### Farm Manager
- **Primary Functions**: Daily operations, staff coordination, animal health
- **Key Features**:
  - Manage farm operations and staff
  - Coordinate animal health activities
  - Oversee biosecurity protocols
  - Generate operational reports

#### Farm Worker
- **Primary Functions**: Field operations, data entry, task execution
- **Key Features**:
  - Mobile-optimized interface
  - Quick data entry forms
  - Task management and progress tracking
  - Basic reporting capabilities

### Core Features Guide

#### Animal Management
1. **Adding Animals**:
   - Navigate to "Animals" → "Add New Animal"
   - Fill required fields: Tag Number, Species, Breed
   - Optional: Birth Date, Weight, Parent Information
   - Click "Save Animal"

2. **Health Records**:
   - Select animal from list
   - Click "Add Health Record"
   - Choose record type (Vaccination, Treatment, Checkup)
   - Enter description and treatment details
   - Save record

3. **Searching Animals**:
   - Use search bar with tag number or species
   - Apply filters for status, age, or location
   - Export results if needed

#### Biosecurity Management
1. **Visitor Registration**:
   - Go to "Biosecurity" → "Visitors"
   - Click "Register New Visitor"
   - Complete visitor details and purpose
   - Conduct health screening
   - Process check-in

2. **Environmental Monitoring**:
   - Navigate to "Environmental Monitoring"
   - Select farm area
   - Record temperature, humidity, air quality
   - Submit readings (alerts generated automatically)

3. **Cleaning Activities**:
   - Access "Cleaning Tracker"
   - Schedule or log cleaning activities
   - Record cleaning agents and methods
   - Mark completion and verification

#### Inventory Management
1. **Feed Management**:
   - Go to "Inventory" → "Feed"
   - Add new feed items with quantities
   - Set reorder levels for alerts
   - Track usage and expiry dates

2. **Medicine Tracking**:
   - Navigate to "Medicine" tab
   - Record medicine purchases
   - Monitor expiry dates
   - Track withdrawal periods

3. **Equipment Management**:
   - Access "Equipment" section
   - Log equipment details and condition
   - Schedule maintenance activities
   - Track warranty and service history

### Mobile Usage Tips

#### For Field Workers
- **Quick Entry**: Use voice-to-text for faster data entry
- **Offline Mode**: Some features work offline, sync when connected
- **Camera Integration**: Take photos for health records or cleaning verification
- **Touch-Friendly**: Large buttons and forms optimized for touch

#### Best Practices
- **Regular Updates**: Update animal status and health records daily
- **Photo Documentation**: Use camera for visual records
- **Sync Frequently**: Ensure data syncs when internet is available
- **Battery Management**: Keep device charged for full-day use

### Troubleshooting

#### Common Issues
1. **Login Problems**:
   - Verify username and password
   - Check internet connection
   - Clear browser cache
   - Contact system administrator

2. **Data Not Saving**:
   - Check required fields are filled
   - Verify internet connection
   - Try refreshing the page
   - Contact support if issue persists

3. **Mobile Performance**:
   - Close other apps to free memory
   - Update browser to latest version
   - Check internet signal strength
   - Restart device if needed

#### Support Contacts
- **Technical Support**: [support@digitalfarmportal.com]
- **User Training**: [training@digitalfarmportal.com]
- **Emergency Issues**: [emergency@digitalfarmportal.com]

### Quick Reference

#### Keyboard Shortcuts
- `Ctrl + S`: Save current form
- `Ctrl + F`: Search/Filter
- `Esc`: Close modal/dialog
- `Tab`: Navigate between fields

#### Status Indicators
- 🟢 **Green**: Healthy/Normal/Active
- 🟡 **Yellow**: Warning/Attention Required
- 🔴 **Red**: Critical/Urgent Action Needed
- ⚪ **Gray**: Inactive/Completed

## Conclusions

The **Digital Farm Portal** successfully addresses the growing need for efficient and technology-driven management in modern agriculture. By providing tailored interfaces for administrators, farm owners, managers, and workers, the system streamlines the entire workflow of farm operations—from animal health and biosecurity monitoring to inventory control and compliance reporting.

The integration of the frontend (React.js), backend (Node.js/Express.js), and database (MySQL) demonstrates the effective application of Software Engineering principles. With features like role-based access control, detailed transaction and activity logging, comprehensive form validations, and real-time dashboards, the system ensures both accuracy and reliability in managing farm resources. For managers, the system simplifies operational oversight, while farm workers benefit from streamlined data entry and task management, particularly on mobile devices.

By incorporating a comprehensive testing strategy and detailed documentation covering cost estimation, the project validates not only its technical correctness but also its feasibility in real-world scenarios. Furthermore, the integration of database normalization, DDL/DML queries, and secure data handling highlights strong adherence to DBMS principles. The web-based design ensures accessibility, responsiveness, and a user-friendly experience critical for adoption in the field.

Looking forward, the system can be enhanced by integrating IoT-based sensors for real-time environmental monitoring, native mobile app support for offline capabilities, and advanced analytics dashboards for predictive health insights. These enhancements would further improve operational efficiency, data accuracy, and decision-making for farm management.

In conclusion, the development of the Digital Farm Portal represents a practical, scalable, and modern solution that not only meets academic requirements but also reflects real-world applicability. It showcases the effective integration of design, implementation, testing, and documentation, providing a robust foundation for future advancements in smart agriculture and farm management technology.

## References

### Technical Documentation
1. **React.js Official Documentation**. (2024). *React - A JavaScript library for building user interfaces*. Retrieved from https://reactjs.org/docs/

2. **Node.js Documentation**. (2024). *Node.js v18.x Documentation*. Retrieved from https://nodejs.org/docs/latest-v18.x/api/

3. **Express.js Guide**. (2024). *Express.js - Fast, unopinionated, minimalist web framework for Node.js*. Retrieved from https://expressjs.com/

4. **MySQL 8.0 Reference Manual**. (2024). *MySQL 8.0 Reference Manual*. Oracle Corporation. Retrieved from https://dev.mysql.com/doc/refman/8.0/en/

5. **JSON Web Tokens (JWT)**. (2024). *RFC 7519 - JSON Web Token (JWT)*. Internet Engineering Task Force. Retrieved from https://tools.ietf.org/html/rfc7519

### Software Engineering Methodologies
6. **Boehm, B. W.** (1981). *Software Engineering Economics*. Prentice-Hall. ISBN: 978-0138221225

7. **Boehm, B. W., Abts, C., Brown, A. W., Chulani, S., Clark, B. K., Horowitz, E., ... & Steece, B.** (2000). *Software Cost Estimation with COCOMO II*. Prentice Hall. ISBN: 978-0201722277

8. **Sommerville, I.** (2015). *Software Engineering (10th Edition)*. Pearson. ISBN: 978-0133943030

9. **Pressman, R. S., & Maxim, B. R.** (2019). *Software Engineering: A Practitioner's Approach (9th Edition)*. McGraw-Hill Education. ISBN: 978-1259872976

### Database Design and Management
10. **Elmasri, R., & Navathe, S. B.** (2016). *Fundamentals of Database Systems (7th Edition)*. Pearson. ISBN: 978-0133970777

11. **Date, C. J.** (2019). *Database Design and Relational Theory: Normal Forms and All That Jazz (2nd Edition)*. O'Reilly Media. ISBN: 978-1449328016

12. **Korth, H. F., Silberschatz, A., & Sudarshan, S.** (2019). *Database System Concepts (7th Edition)*. McGraw-Hill Education. ISBN: 978-0078022159

### Web Development and Security
13. **Mozilla Developer Network (MDN)**. (2024). *Web APIs*. Retrieved from https://developer.mozilla.org/en-US/docs/Web/API

14. **OWASP Foundation**. (2024). *OWASP Top Ten Web Application Security Risks*. Retrieved from https://owasp.org/www-project-top-ten/

15. **Fielding, R. T.** (2000). *Architectural Styles and the Design of Network-based Software Architectures*. Doctoral dissertation, University of California, Irvine.

### Agricultural Technology and Farm Management
16. **Wolfert, S., Ge, L., Verdouw, C., & Bogaardt, M. J.** (2017). Big data in smart farming–a review. *Agricultural Systems*, 153, 69-80.

17. **Kamilaris, A., Kartakoullis, A., & Prenafeta-Boldú, F. X.** (2017). A review on the practice of big data analysis in agriculture. *Computers and Electronics in Agriculture*, 143, 23-37.

18. **Banhazi, T. M., Lehr, H., Black, J. L., Crabtree, H., Schofield, P., Tscharke, M., & Berckmans, D.** (2012). Precision livestock farming: an international review of scientific and commercial aspects. *International Journal of Agricultural and Biological Engineering*, 5(3), 1-9.

### Biosecurity and Regulatory Compliance
19. **Food and Agriculture Organization (FAO)**. (2023). *Good practices for biosecurity in the pig sector*. Rome: FAO. Retrieved from http://www.fao.org/3/i1435e/i1435e00.htm

20. **World Organisation for Animal Health (OIE)**. (2024). *Terrestrial Animal Health Code*. Retrieved from https://www.oie.int/en/what-we-do/standards/codes-and-manuals/terrestrial-code-online-access/

21. **European Food Safety Authority (EFSA)**. (2023). *Scientific Opinion on African swine fever in wild boar*. EFSA Journal, 16(7), e05344.

### User Experience and Interface Design
22. **Nielsen, J.** (2020). *Usability Engineering*. Morgan Kaufmann. ISBN: 978-0125184069

23. **Krug, S.** (2014). *Don't Make Me Think, Revisited: A Common Sense Approach to Web Usability (3rd Edition)*. New Riders. ISBN: 978-0321965516

24. **Norman, D.** (2013). *The Design of Everyday Things: Revised and Expanded Edition*. Basic Books. ISBN: 978-0465050659

### Testing and Quality Assurance
25. **Myers, G. J., Sandler, C., & Badgett, T.** (2011). *The Art of Software Testing (3rd Edition)*. Wiley. ISBN: 978-1118031964

26. **Beizer, B.** (1995). *Black-Box Testing: Techniques for Functional Testing of Software and Systems*. Wiley. ISBN: 978-0471120940

27. **Crispin, L., & Gregory, J.** (2014). *More Agile Testing: Learning Journeys for the Whole Team*. Addison-Wesley Professional. ISBN: 978-0321967053

### Project Management and Software Development
28. **Beck, K., Beedle, M., Van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., ... & Thomas, D.** (2001). *Manifesto for agile software development*. Retrieved from https://agilemanifesto.org/

29. **Schwaber, K., & Sutherland, J.** (2020). *The Scrum Guide*. Retrieved from https://scrumguides.org/scrum-guide.html

30. **Project Management Institute**. (2021). *A Guide to the Project Management Body of Knowledge (PMBOK® Guide) – Seventh Edition*. Project Management Institute. ISBN: 978-1628256642

### Industry Standards and Best Practices
31. **ISO/IEC 25010:2011**. (2011). *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*. International Organization for Standardization.

32. **IEEE 830-1998**. (1998). *IEEE Recommended Practice for Software Requirements Specifications*. Institute of Electrical and Electronics Engineers.

33. **W3C Web Content Accessibility Guidelines (WCAG) 2.1**. (2018). Retrieved from https://www.w3.org/WAI/WCAG21/Understanding/

### Performance and Scalability
34. **Bondi, A. B.** (2000). Characteristics of scalability and their impact on performance. *Proceedings of the 2nd international workshop on Software and performance*, 195-203.

35. **Smith, C. U., & Williams, L. G.** (2001). *Performance Solutions: A Practical Guide to Creating Responsive, Scalable Software*. Addison-Wesley Professional. ISBN: 978-0201722277

---

In conclusion, the Digital Farm Portal successfully integrates a React.js frontend, a Node.js backend, and a MySQL database to deliver a modern, role-based solution for farm management. By digitizing key operations such as animal health, inventory, and biosecurity, the system enhances data accuracy, improves operational efficiency, and ensures regulatory compliance. The project stands as a practical and scalable foundation for future advancements in agricultural technology.
