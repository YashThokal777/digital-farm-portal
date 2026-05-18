# Digital Farm Portal - UML Diagrams

To better understand and design the **Digital Farm Portal**, we use Unified Modeling Language (UML) diagrams. UML helps represent the system’s structure, functionality, and interactions in a standardized manner.

For the Digital Farm Portal, we use three essential UML diagrams: Use Case, Class, and Activity.

### Why these three diagrams only?
-   **Use Case Diagram**: Captures the functional requirements from the perspective of different user roles (like Farm Manager, Worker, and System Admin), ensuring all role-specific features are covered.
-   **Class Diagram**: Represents the structural backbone of the system, aligning with the database schema for entities like `Users`, `Farms`, `Animals`, `Inventory`, and `BiosecurityLogs`.
-   **Activity Diagram**: Illustrates the dynamic flow of key operational workflows, such as the process for animal health monitoring or biosecurity checks, validating that interactions happen in the correct order.

These three diagrams together cover the scope, structure, and behavior of the system without unnecessary complexity, making them ideal for this project.

---

## 2.1 Use Case Diagram

A **Use Case Diagram** is a behavioral UML diagram that captures the functional requirements of the system from the end-user’s perspective.

For the **Digital Farm Portal**, the Use Case Diagram shows how different actors (System Administrator, Farm Owner, Farm Manager, Farm Worker, etc.) interact with the system. For instance, a `Farm Worker` can log daily tasks and view animal health records, while a `Farm Manager` can oversee inventory, manage staff, and generate compliance reports. An `Administrator` has overarching control, managing user accounts and system settings. This diagram ensures that the diverse functional requirements for each role are clearly defined and addressed.

## 2.2 Class Diagram

A **Class Diagram** is a structural UML diagram that shows the classes in the system, their attributes, methods, and the relationships among them.

The Class Diagram for the Digital Farm Portal defines the core entities of the database-backed system: `User`, `Farm`, `Animal`, `HealthRecord`, `Inventory`, and `Biosecurity`. The diagram highlights key relationships: a `User` is associated with a `Farm`, a `Farm` contains multiple `Animals`, and each `Animal` can have multiple `HealthRecords`. Similarly, it maps out how `Inventory` and `Biosecurity` logs are linked to a specific `Farm`. This structure directly informs the database schema, ensuring consistency between the logical design and the physical implementation.

## 2.3 Activity Diagram

An **Activity Diagram** is a behavioral UML diagram that illustrates the flow of control in a system and is used to model workflows and business processes.

The Activity Diagram for the Digital Farm Portal demonstrates a critical workflow, such as the **Animal Health Management Process**. It shows the sequence of actions from a `Farm Worker` observing an animal's condition, to the system generating an alert if the issue is critical, to a `Veterinarian` being notified to prescribe treatment. This diagram is crucial for validating that the system's automated processes correctly mirror real-world operational procedures, ensuring efficiency and accuracy in critical farm activities.
