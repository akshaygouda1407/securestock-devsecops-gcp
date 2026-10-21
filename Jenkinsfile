
pipeline {
    agent any

    environment {
        JAVA_HOME = 'C:\\Program Files\\Java\\jdk-21.0.12'

        CHECKOV_PYTHON = 'E:\\checkov-venv\\Scripts\\python.exe'

        PATH = "C:\\Program Files\\Git\\cmd;" +
               "C:\\Program Files\\nodejs;" +
               "C:\\Users\\User\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;" +
               "C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Links;" +
               "E:\\checkov-venv\\Scripts;" +
               "C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python313;" +
               "C:\\Users\\User\\AppData\\Roaming\\Python\\Python313\\Scripts;" +
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

                bat '''
                    "C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Links\\gitleaks.exe" detect --source . --verbose
                '''
            }
        }

        stage('Terraform Security Scan') {
            steps {
                bat '''
                    if not exist "%CHECKOV_PYTHON%" (
                        echo ERROR: Checkov Python environment not found: %CHECKOV_PYTHON%
                        exit /b 1
                    )

                    "%CHECKOV_PYTHON%" -m checkov.main --version
                    if errorlevel 1 exit /b 1
                '''

                bat '''
                    if not exist "terraform\\storage.tf" (
                        echo ERROR: terraform\\storage.tf was not found.
                        exit /b 1
                    )

                    if not exist "checkov-output" mkdir "checkov-output"

                    "%CHECKOV_PYTHON%" -m checkov.main ^
                        -f terraform\\storage.tf ^
                        --framework terraform ^
                        --output json ^
                        --output-file-path checkov-output

                    if errorlevel 1 exit /b 1
                '''
            }

            post {
                always {
                    archiveArtifacts(
                        artifacts: 'checkov-output\\**',
                        allowEmptyArchive: true,
                        fingerprint: true
                    )
                }
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
                echo 'SonarQube Analysis is temporarily disabled.'
            }
        }

        stage('OWASP Dependency Check') {
            when {
                expression { return false }
            }
            steps {
                echo 'OWASP Dependency-Check is temporarily disabled.'
            }
        }

        stage('Docker Image Build') {
            steps {
                bat 'docker --version'
                bat 'docker build -t securestock-backend:latest backend'
                bat 'docker build -t securestock-frontend:latest frontend'
            }
        }

        stage('Trivy Image Scan') {
            steps {
                bat 'trivy --version'

                bat '''
                    trivy --cache-dir "C:\\Users\\User\\AppData\\Local\\trivy" image --scanners vuln --severity HIGH,CRITICAL --skip-db-update --skip-java-db-update --format json --output trivy-backend-report.json securestock-backend:latest
                '''

                bat '''
                    trivy --cache-dir "C:\\Users\\User\\AppData\\Local\\trivy" image --scanners vuln --severity HIGH,CRITICAL --skip-db-update --skip-java-db-update --format json --output trivy-frontend-report.json securestock-frontend:latest
                '''
            }

            post {
                always {
                    archiveArtifacts(
                        artifacts: 'trivy-*-report.json',
                        allowEmptyArchive: true,
                        fingerprint: true
                    )
                }
            }
        }
    }

    post {
        always {
            echo 'SecureStock DevSecOps pipeline finished. Review scan reports in Jenkins build artifacts.'
        }
    }
}
