# Expense-Tracker

A full-stack containerized web application that allows users to manage their finances by tracking income, expenses and budgets. The app features dynamic charts, authentication, and export functionality, and is now fully containerized using Docker with automated CI/CD pipeline integration via Jenkins.

![Screenshot](https://github.com/user-attachments/assets/bdb80009-582b-40fc-9127-2a5ef335f348)

---

## 🚀 Features

- User authentication and registration system
- Add, delete, and categorize **income** and **expenses**
- Interactive dashboard with **doughnut, bar, and line charts**
- **Real-time updates** to dashboard upon transaction changes
- **Export reports** to **PDF** and **CSV**
- Fully **responsive UI** built with **TailwindCSS**
- Brief overview of the **Stock market**
- **RESTful API** for managing income, expenses, and stock data
- **MongoDB** backend for persistent data storage
- Containerized with **Docker** for consistency across environments
- Automated deployment with **Jenkins CI/CD Pipeline**

---

## 🛠 Technologies Used

### Frontend
- **HTML5**, **CSS3**, **JavaScript (ES6+)**
- **TailwindCSS** — utility-first styling
- **Chart.js**, **Html2Canvas**, **jsPDF**

### Backend
- **Node.js**, **Express.js**
- **MongoDB**, **Mongoose**

### DevOps
- **Docker** — for containerizing the app
- **Docker Compose** — for managing multi-container services
- **Jenkins** — for CI/CD pipeline automation
- **GitHub** — version control

---

## 📦 Installation

### Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Jenkins](https://www.jenkins.io/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (or local MongoDB)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arghya-Dutta1/expense-tracker.git
   cd expense-tracker
   ```

2. **Update environment variables**

   Create a `.env` file:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ```

3. **Build and start containers using Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the app**
   ```
   http://localhost:3000
   ```

---

## 🧪 CI/CD Pipeline with Jenkins

The CI/CD pipeline automates the following:

- Code pull from GitHub on commit
- Build Docker image
- Push image to Docker Hub
- Deploy the latest container version

### Jenkinsfile Example

```groovy
pipeline {
    agent any
    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Clone Repository') {
            steps {
                bat "git clone %REPO_URL%"
            }
        }

        stage('Build Docker Images') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    dir("${PROJECT_NAME}") {
                        bat 'docker-compose build'
                    }
                }
            }
        }


        stage('Tag Docker Image') {
            steps {
                bat 'docker tag expense-tracker-backend %IMAGE_NAME%'
            }
        }

        stage('Login to DockerHub') {
            steps {
                bat "echo %DOCKERHUB_CREDENTIALS_PSW% | docker login -u %DOCKERHUB_CREDENTIALS_USR% --password-stdin"
            }
        }

        stage('Push to DockerHub') {
            steps {
                bat 'docker push %IMAGE_NAME%'
            }
        }

        stage('Start Containers') {
            steps {
                dir("${PROJECT_NAME}") {
                    bat 'docker-compose up -d'
                }
            }
        }
    }
}
```

---

## 📂 Project Structure

```
expense-tracker/
├── HTML, CSS, JS  Files    # Frontend files
├── models/                 # Mongoose models
│── server.js               # Express server
├── Dockerfile              # Container definition
├── docker-compose.yml      # Multi-service orchestration
├── Jenkinsfile             # CI/CD pipeline script
├── .env                    # Environment configuration
├── package.json
└── README.md
```

---

## 🙌 Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/FeatureName`
3. Make changes and commit: `git commit -m "Added FeatureName"`
4. Push: `git push origin feature/FeatureName`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- TailwindCSS, Chart.js, Html2Canvas, jsPDF for frontend design and functionality
- Node.js and Express.js for backend development
- Docker and Jenkins for DevOps automation
- MongoDB + Mongoose for database architecture
- Ben Franklin — for the inspirational quote used in the app
