pipeline {
    agent any

    environment {
        // Docker image name
        IMAGE_NAME = "my-node-app"
        // Docker registry (optional if pushing to Docker Hub)
        DOCKER_REGISTRY = "mydockerhubuser"
    }

    stages {

        stage('Checkout') {
            steps {
                // Get the code from GitHub
                git branch: 'main', url: 'https://github.com/Nisha123-rani/nodejs-assessment.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint || true' // optional, doesn't fail the build
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:${env.BUILD_NUMBER} ."
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    // Login to Docker registry (set credentials in Jenkins)
                    sh "echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin"
                    sh "docker tag ${IMAGE_NAME}:${env.BUILD_NUMBER} ${DOCKER_REGISTRY}/${IMAGE_NAME}:${env.BUILD_NUMBER}"
                    sh "docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${env.BUILD_NUMBER}"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // Stop old container (if exists)
                    sh "docker rm -f ${IMAGE_NAME} || true"
                    // Run new container
                    sh "docker run -d --name ${IMAGE_NAME} -p 3000:3000 ${DOCKER_REGISTRY}/${IMAGE_NAME}:${env.BUILD_NUMBER}"
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace'
            cleanWs()
        }
        success {
            echo 'Build & deploy successful!'
        }
        failure {
            echo 'Build or tests failed!'
        }
    }
}

