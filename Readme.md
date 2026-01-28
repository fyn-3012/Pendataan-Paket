# 📦 Package Data Management System

**Package Data Management System** is a simple web-based application designed to record, manage, and track incoming and outgoing packages.  
This application is suitable for **boarding houses, dormitories, campuses, or small offices** that need a lightweight and efficient package logging system.

🔗 **Live Demo:**  
https://fyn-3012.github.io/Pendataan-Paket/index.html

---

## 🚀 Key Features

### 📥 Incoming Package Management
- Record package data (recipient name, sender, date, description)
- Automatically display data in a table
- Input validation to prevent empty data

### 📤 Package Pickup Tracking
- Update package status (Not Picked Up / Picked Up)
- Clear visual indicators for package status
- Pickup history remains stored

### 🔍 Search & Filter
- Search packages by **recipient name**
- Faster package lookup for administrators

### 🗑️ Data Management
- Delete individual package records
- Reset stored data when needed
- Uses **Browser Local Storage** (no backend required)

---

## 🏗️ Tech Stack

### Frontend
- **HTML5** – Page structure
- **CSS3** – Styling and layout
- **Vanilla ** – Application logic
- **Bootstrap 5** – Responsive UI
- **Bootstrap Icons** – Interface icons

### Data Storage
- **Supabase Database**

---

## 📂 Project Structure

```bash
Pendataan-Paket/
├── index.html        # Main page
├── css/
│   └── style.css     # Application styling
├── js/
│   └── script.js     # Application logic
└── README.md         # Project documentation


---

## 📸 Usage Overview

### 1. Add Package
- Fill in the package form
- Click **Add Package**

### 2. Search Package
- Use the search input by recipient name

### 3. Update Status
- Click **Picked Up** when the package has been collected

### 4. Delete Data
- Click **Delete** to remove a specific record

---

## 🔐 Default Credentials

Use these accounts to test the Role-Based Access Control (RBAC):

| Role | Username | Password | Access |
| --- | --- | --- | --- |
| **Administrator** | `Admin` | `admin` | Full Access (Manage Data & Reports) |
| **Staff** | `Aripin` | `admin` | Add & Update Package Data |
| **Viewer** | `viewer` | `viewer123` | View Package Data Only |


---

## 🎯 Project Purpose

- Simplify package data recording  
- Reduce manual logbooks  
- Prevent lost package information  
- Suitable for academic projects and basic web applications  

---

## 🤝 Contributors

Developed by:
- **Aripin Suprianto**
- **Andika Kurniawan**
- **Alfian Reggy**
