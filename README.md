# 📍 Accra PUDO Network Planning System

> A GIS-powered Pickup and Drop-off (PUDO) Network Planning Platform for Accra, Ghana.

![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/Python-3.12-blue)
![PostGIS](https://img.shields.io/badge/PostGIS-Spatial-orange)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow)

---

## 📖 Project Overview

The **Accra PUDO Network Planning System** is a spatial decision support platform designed to optimize the placement of Pickup and Drop-off (PUDO) locations throughout Accra using Geographic Information Systems (GIS) and network analysis.

Unlike traditional approaches that rely on fixed-radius buffers, this project uses **walking-time isochrones** generated from the road network to determine realistic accessibility for residents.

The system identifies underserved areas, generates candidate PUDO locations, and evaluates them using spatial constraints such as:

- Road accessibility
- Walking distance
- Water bodies
- Flood-prone areas
- Gated communities
- Industrial zones
- Existing logistics infrastructure

---

# 🎯 Objectives

- Improve last-mile logistics planning
- Optimize PUDO placement
- Increase accessibility
- Reduce delivery costs
- Improve customer convenience
- Support data-driven urban logistics planning

---

# 🏗 System Architecture

```
                React Frontend
                      │
               REST API (FastAPI)
                      │
          Business Logic & Services
                      │
          Spatial Analysis Engine
      (GeoPandas • Shapely • ORS)
                      │
            PostgreSQL + PostGIS
                      │
     OpenStreetMap • QGIS • ORS API
```

---

# 🚀 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Leaflet / MapLibre
- React Query
- Chart.js

---

## Backend

- FastAPI
- Python
- SQLAlchemy
- GeoPandas
- Shapely
- Pydantic

---

## Database

- PostgreSQL
- PostGIS

---

## GIS

- QGIS
- OpenStreetMap
- OpenRouteService
- GeoPandas

---

## DevOps

- Docker
- Docker Compose
- GitHub Actions

---

# 📂 Repository Structure

```
accra-pudo/

│
├── backend/
├── frontend/
├── database/
├── gis/
├── docs/
├── assets/
├── tests/
├── docker/
│
├── docker-compose.yml
├── README.md
├── LICENSE
└── .gitignore
```

---

# ✨ Features

## GIS

- Walking Isochrones
- Coverage Analysis
- Candidate Generation
- Spatial Joins
- Route Optimization
- Flood Analysis
- Accessibility Analysis

---

## Dashboard

- Interactive Map
- Coverage Heatmaps
- Network Statistics
- Analytics
- Reports
- Search & Filtering

---

## Administration

- User Authentication
- Role Management
- Node Management
- Spatial Data Management

---

# 📋 Development Roadmap

## Phase 1

- [ ] Repository Setup
- [ ] Docker Environment
- [ ] Database Design
- [ ] Documentation

---

## Phase 2

- [ ] PostGIS Setup
- [ ] OSM Import
- [ ] Spatial Layers

---

## Phase 3

- [ ] GIS Engine
- [ ] Isochrones
- [ ] Candidate Generation
- [ ] Coverage Analysis

---

## Phase 4

- [ ] Backend API
- [ ] Authentication
- [ ] Analytics

---

## Phase 5

- [ ] Frontend Dashboard
- [ ] Interactive Maps
- [ ] Reports

---

## Phase 6

- [ ] Testing
- [ ] Deployment
- [ ] Documentation

---

# 📚 Documentation

Project documentation is located inside the `/docs` folder.

- Software Architecture
- Database Design
- API Documentation
- GIS Workflow
- Deployment Guide
- Meeting Notes

---

# 🤝 Contributing

1. Fork the repository
2. Create a feature branch

```
git checkout -b feature/my-feature
```

3. Commit your changes

```
git commit -m "feat: Added new feature"
```

4. Push your branch

```
git push origin feature/my-feature
```

5. Open a Pull Request

---

# 📝 Commit Convention

```
feat:
fix:
docs:
style:
refactor:
test:
chore:
```

Example:

```
feat: add candidate node generation

fix: resolve PostGIS query issue

docs: update API documentation
```

---

# 🧪 Running Locally

Clone the repository

```bash
git clone https://github.com/gilberttetteh/accra-pudo.git
```

Navigate into the project

```bash
cd accra-pudo
```

Start Docker

```bash
docker compose up --build
```

Frontend

```bash
cd frontend
npm install
npm run dev
```

Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

# 📄 License

This project is licensed under the MIT License.

See the LICENSE file for details.

---

# 🙏 Acknowledgements

- OpenStreetMap
- OpenRouteService
- PostgreSQL
- PostGIS
- GeoPandas
- QGIS
- Ashesi University

---

## 📬 Contact

For questions, issues, or contributions, please open an issue in this repository.
