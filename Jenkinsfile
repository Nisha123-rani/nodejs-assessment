pipeline {
    agent any

    parameters {
        choice(
            name: 'DEPLOY_TARGET',
            choices: ['docker', 'kubernetes', 'both'],
            description: 'Select where to deploy: docker only, kubernetes only, or both'
        )
    }

    environment {
        DOCKER_REGISTRY = "docker.io"
        DOCKER_CREDENTIALS_ID = "docker-hub-credentials"
        KUBECONFIG_CREDENTIALS_ID = "kubeconfig-local"
        DOCKER_REPO = "nisha2706/nodejs-todo-app"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Set GIT SHA') {
            steps {
                script {
                    env.GIT_SHA = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                    env.DOCKER_IMAGE = "${DOCKER_REPO}:${env.GIT_SHA}"
                    echo "GIT_SHA=${env.GIT_SHA}"
                    echo "DOCKER_IMAGE=${env.DOCKER_IMAGE}"
                }
            }
        }

        stage('Verify Node.js') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('Install & Test') {
            steps {
                sh 'npm ci'
                sh 'npm test'
                sh 'npx eslint src/**/*.js --max-warnings=0'
                sh 'npm audit --audit-level=high'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }

        stage('Scan Docker Image') {
            steps {
                sh "trivy image --exit-code 1 --severity HIGH,CRITICAL ${DOCKER_IMAGE}"
            }
        }

        stage('Push Docker Image') {
            when {
                expression { params.DEPLOY_TARGET == 'docker' || params.DEPLOY_TARGET == 'both' }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_CREDENTIALS_ID}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin ${DOCKER_REGISTRY}
                        docker push ${DOCKER_IMAGE}
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                expression { params.DEPLOY_TARGET == 'kubernetes' || params.DEPLOY_TARGET == 'both' }
            }
            steps {
                withCredentials([file(
                    credentialsId: "${KUBECONFIG_CREDENTIALS_ID}",
                    variable: 'KUBECONFIG')]) {
                    sh """
                        kubectl apply -f k8s/
                        kubectl set image deployment/my-node-app my-node-app=${DOCKER_IMAGE} --record
                        kubectl rollout status deployment/my-node-app --timeout=2m
                    """
                }
            }
        }

    }

    post {
        always {
            echo "Cleaning up Docker images"
            sh "docker rmi ${DOCKER_IMAGE} || true"
        }
        failure {
            echo "Build failed! Check console output for errors."
        }
    }
}

