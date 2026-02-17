
# ContractFlow: Enterprise Document Lifecycle Platform

**ContractFlow** is a complete full-stack system designed to manage reusable contract blueprints and track their lifecycle from initial creation to final locking.

## 🚀 Quick Start

### 1. Backend Setup

1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`.


3. Create a `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_random_secret_string

```


4. Start server: `npm run dev`.



### 2. Frontend Setup

1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.


3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api

```


4. Start development server: `npm run dev`.



---

## 🏗️ Architecture Overview

The system is built using a decoupled **MERN** (MongoDB, Express, React, Node.js) stack:

* **Frontend**: Developed with **React** (Vite) and **Tailwind CSS** for a responsive, modern UI. It utilizes **Redux Toolkit** for centralized authentication state management and **Framer Motion** for status transition animations.
* **Backend**: A **Node.js/Express** REST API that handles core business logic and strictly enforces the contract lifecycle.
* **Database**: **MongoDB** was selected for its flexible document schema, which allows blueprints to store dynamic arrays of fields (Text, Date, Signature, Checkbox) without the need for complex relational joins.

---

## 📊 Lifecycle & Data Modeling

### Schema Design

* **Blueprint**: Stores the template structure, including field types, labels, and positions.
* **Contract**: Represents a snapshot instance that inherits fields from a blueprint and stores user-provided values.
* **User**: Manages identity and ensures data isolation, allowing users to only access their own documents.

### Controlled Workflow

The platform enforces a strict state machine via backend middleware:
`CREATED` → `APPROVED` → `SENT` → `SIGNED` → `LOCKED`

* **Immutability**: Once a status reaches `LOCKED` or `REVOKED`, the API rejects all update attempts to maintain document integrity.
* **Audit Trail**: Every status change is logged in a `statusHistory` array to track the document lifecycle for auditing purposes.

---
## 🔌 API Design Summary

|    Method   |          Endpoint                  |                 Description                     |
|   ---       |          ---                       |                       ---                       |
|   `POST`    |      `/api/auth/register`          |        User registration.                       |
|   `POST`    |      `/api/blueprints`             |        Create a reusable contract template.     |
|   `POST`    |      `/api/contracts`              |        Generate an instance from a blueprint.   |
|   `PATCH`   |      `/api/contracts/:id/status`   |        Transition state (e.g., Approve, Sign).  |
|   `PUT`     |      `/api/contracts/:id`          |        Update field values (Blocked if Locked). |


---

## 🛠️ Assumptions and Trade-offs

* **Isolation**: Implemented full JWT authentication to demonstrate secure, user-specific data isolation even though it was listed as optional.
* **Mixed Data Types**: Utilized Mongoose `Mixed` types for field values to accommodate various inputs like strings, dates, and booleans within a single schema.
* **UI Focus**: Prioritized workflow clarity and state feedback (using `react-hot-toast`) over complex visual graphics to focus on functional usability.