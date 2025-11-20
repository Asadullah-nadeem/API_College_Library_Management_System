## Server and API Base Information

* **Server Technology:** Node.js, Express, and MySQL.
* **Base URL Example:** `http://localhost:3002` (This URL will be available when the server starts.)
* **API Prefix:** All endpoints use the `/api` prefix.

---

## Step 1: Data Setup (Creating Student and Book Records)

Before you can Issue a Book, you need to create **student** and **book** records.

### 1.1 Create Student (College ID)

| Method | Endpoint | Description | JSON Body Example |
| :---: | :--- | :--- | :--- |
| **POST** | `/api/students` | **Create a new student record** (using College ID). | ` { "student_id": "C101", "name": "Alok Sharma", "email": "alok@col.edu" } ` |

### 1.2 Create Book (Inventory Update)

**Note:** If the **ISBN** already exists, this endpoint will only increment the **total\_copies** and **available\_copies**.

| Method | Endpoint | Description | JSON Body Example |
| :---: | :--- | :--- | :--- |
| **POST** | `/api/books` | **Add a new book** (or increase the number of copies). | ` { "title": "TS Coding Guide", "author": "XYZ", "isbn": "978-0011223344", "total_copies": 5 } ` |

---

## Step 2: Core Library Transactions

These endpoints insert data into the `IssueTransaction` table and manage inventory/fines.

| Task | Method | Endpoint | Action Flow / Description |
| :--- | :---: | :--- | :--- |
| **Issue Book** | **POST** | `/api/transactions/issue` | **Action:** Issues the book, sets the **due\_date** (15 days by default), **decrements available\_copies**, and sends an email to the Student. |
| **Return Book** | **PUT** | `/api/transactions/return/:id` | **Action:** Returns the book, **calculates the fine** (if overdue), and **increments available\_copies**. Adds the fine to the Student's `total_fines_due`. |
| **Renew Book** | **PUT** | `/api/transactions/renew/:id` | **Action:** Extends the **due\_date**. **Important:** If the book is overdue, renewal will fail and prompt the user to clear the fine. |

### Example Usage: Issuing a Book

* **URL:** `http://localhost:3002/api/transactions/issue`
* **JSON Body:**
    ```json
    {
      "student_id": "C101",
      "book_id": "89c35470-34d3-45f8-8422-e3a79d020d2c" 
    }
    ```
* **Response:** Success message and the created transaction object (which includes the `id`, e.g., `id: 1`).

### Example Usage: Viewing Fine Calculation

Use the Transaction ID (e.g., `1`).

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| **GET** | `/api/transactions/fine/1` | Shows the current **live fine** for **Transaction ID 1**. |

---

## Step 3: Reporting and Management APIs

| Method | Endpoint | Description | Query Parameter Example |
| :---: | :--- | :--- | :--- |
| **GET** | `/api/students/:id` | Displays the Student's **details** and all their currently **issued books**. | N/A |
| **GET** | `/api/books` | Lists all books. | `/api/books?author=XYZ` or `/api/books?title=guide` |
| **PUT** | `/api/students/:id` | **Updates** the student's details. | N/A |