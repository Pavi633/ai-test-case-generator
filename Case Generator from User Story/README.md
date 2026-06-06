# AI Test Case Generator

## Case Generator from User Story

AI Test Case Generator is a full-stack web application that automatically generates software test cases from natural language user stories using a local Large Language Model (LLM) powered by Ollama.

The application analyzes a user story and generates:

* Positive Test Cases
* Negative Test Cases
* Edge Test Cases
* Gherkin Scenarios (Given / When / Then)

The generated output can be exported as a `.feature` file and directly used with automation frameworks such as Cucumber and Behave.

---

## Key Features

### AI-Powered Test Case Generation

* Uses Ollama with Llama 3 (fully local execution)
* No paid APIs required
* Privacy-friendly local inference

### Comprehensive Test Coverage

* Positive Scenarios
* Negative Scenarios
* Edge Cases
* Validation Scenarios
* Security Scenarios

### Gherkin Generation

Automatically converts generated test cases into:

```gherkin
Feature: User Login

Scenario: Successful Login
Given the user is on the login page
When the user enters valid credentials
Then the user should be redirected to the dashboard
```

Compatible with:

* Cucumber
* Behave

### User Authentication

* JWT Authentication
* User Signup
* User Login
* Protected Routes
* Secure API Access

### Dashboard Analytics

* Total User Stories
* Total Test Cases Generated
* Average Coverage Score
* AI Confidence Score
* Scenario Distribution Charts
* Recent Activity Tracking

### History Management

* User-specific history
* Search previous generations
* View generated results
* Delete history records

### Export Options

* Feature File (.feature)
* JSON Export
* CSV Export
* PDF Export
* Copy to Clipboard

### Modern UI

* Responsive Design
* Dark Mode / Light Mode
* Dashboard Analytics
* Toast Notifications
* Syntax Highlighting

---

## Technology Stack

| Layer          | Technology                   |
| -------------- | ---------------------------- |
| Frontend       | React.js, Vite, Tailwind CSS |
| Backend        | Node.js, Express.js          |
| Database       | SQLite (better-sqlite3)      |
| Authentication | JWT (JSON Web Token)         |
| AI Model       | Ollama + Llama 3             |
| Visualization  | Recharts                     |

---

## System Architecture

User Story
↓
React Frontend
↓
Express API
↓
JWT Authentication
↓
Ollama (Llama 3)
↓
Test Case Generation
↓
SQLite Storage
↓
Dashboard & History

---

## Prerequisites

1. Node.js (v18 or above)
2. Ollama

Install Ollama:

https://ollama.com

Download the model:

```bash
ollama pull llama3
```

Verify installation:

```bash
ollama list
```

---

## Installation

Clone or extract the project.

Install dependencies:

```bash
npm install
```

Setup frontend, backend and database:

```bash
npm run setup
```

---

## Running the Application

Start Ollama:

```bash
ollama serve
```

Run the application:

```bash
npm run dev
```

Application URLs:

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:3001 |

---

## User Workflow

1. Create an account using Signup
2. Login using credentials
3. Enter a User Story
4. Click Generate Test Cases
5. View:

   * Positive Cases
   * Negative Cases
   * Edge Cases
   * Gherkin Output
6. Download Feature File
7. View History
8. Monitor Dashboard Analytics

---

## Sample User Story

```text
As a user, I want to login using my email and password so that I can securely access my account.
```

---

## Future Enhancements

* Role-Based Access Control
* Multiple AI Model Selection
* Team Collaboration
* Cloud Deployment
* Test Automation Integration

---

## License

MIT License
