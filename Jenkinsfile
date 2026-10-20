pipeline {
    agent any

    environment {
        JAVA_HOME = 'C:\\Program Files\\Java\\jdk-21.0.12'

        PATH = "C:\\Program Files\\Git\\cmd;" +
               "C:\\Program Files\\nodejs;" +
               "C:\\Users\\User\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;" +
               "C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Links;" +
               "${JAVA_HOME}\\bin;" +
               "${env.PATH}"
    }

    tools {
        maven 'Maven-3'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('GitLeaks Scan') {
            steps {
                bat 'git --version'
                bat '"C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Links\\gitleaks.exe" detect --source . --verbose'
            }
        }

        stage('Terraform Security Scan') {
            steps {
                bat '"C:\\Users\\User\\AppData\\Roaming\\Python\\Python313\\Scripts\\checkov.cmd" --version'
                bat '"C:\\Users\\User\\AppData\\Roaming\\Python\\Python313\\Scripts\\checkov.cmd" -f terraform\\storage.tf --framework terraform --output json --output-file-path checkov-output'

                archiveArtifacts artifacts: 'checkov-output\\results_json.json',
                                 fingerprint: true
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    bat 'java -version'
                    bat 'mvn -version'
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    bat 'node -v'
                    bat 'npm.cmd -v'
                    bat 'npm.cmd install'
                    bat 'npm.cmd run build'
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                expression { return false }
            }
            steps {
                echo 'Temporarily skipped.'
            }
        }

        stage('OWASP Dependency Check') {
            when {
                expression { return false }
            }
            steps {
                echo 'Temporarily skipped.'
            }
        }

        stage('Docker Image Build') {
            steps {
                bat 'docker build -t securestock-backend:latest backend'
                bat 'docker build -t securestock-frontend:latest frontend'
            }
        }

        stage('Trivy Image Scan') {
            steps {
                bat 'trivy --version'

                bat 'trivy --cache-dir "C:\\Users\\User\\AppData\\Local\\trivy" image --scanners vuln --severity HIGH,CRITICAL --skip-db-update --skip-java-db-update --format json --output trivy-backend-report.json securestock-backend:latest'

                bat 'trivy --cache-dir "C:\\Users\\User\\AppData\\Local\\trivy" image --scanners vuln --severity HIGH,CRITICAL --skip-db-update --skip-java-db-update --format json --output trivy-frontend-report.json securestock-frontend:latest'

                archiveArtifacts artifacts: 'trivy-*-report.json',
                                 fingerprint: true
            }
        }
    }

    post {
        always {
            echo 'SecureStock DevSecOps pipeline finished. Review the scan reports in the Jenkins build artifacts.'
        }
    }
}