
pipeline {
    agent any

    tools {
        maven 'Maven-3'
    }

    environment {
        JAVA_HOME = 'C:\\Program Files\\Java\\jdk-21.0.12'
        CHECKOV_PYTHON = 'E:\\checkov-venv\\Scripts\\python.exe'

        SPRING_DATASOURCE_URL = 'jdbc:postgresql://localhost:5433/migration_dest'
        SPRING_DATASOURCE_USERNAME = 'postgres'
        SPRING_DATASOURCE_PASSWORD = 'cisco'

        JAVA_TOOL_OPTIONS = '-Duser.timezone=Asia/Kolkata'

        BACKEND_IMAGE = 'securestock-backend:latest'
        FRONTEND_IMAGE = 'securestock-frontend:latest'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm

                bat 'git --version'
                bat 'java -version'
                bat 'node --version'
                bat 'npm.cmd --version'
                bat 'docker --version'
            }
        }

        stage('GitLeaks Scan') {
            steps {
                bat '''
                    gitleaks detect --source . --no-git --redact --exit-code 1
                '''
            }
        }

        stage('Terraform Security Scan') {
            steps {
                script {
                    if (fileExists('terraform')) {
                        bat '''
                            "%CHECKOV_PYTHON%" -m checkov ^
                              -d terraform ^
                              --framework terraform
                        '''
                    } else {
                        echo 'No terraform directory found. Skipping Terraform scan.'
                    }
                }
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    withEnv([
                        'SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/migration_dest',
                        'SPRING_DATASOURCE_USERNAME=postgres',
                        'SPRING_DATASOURCE_PASSWORD=cisco',
                        'JAVA_TOOL_OPTIONS=-Duser.timezone=Asia/Kolkata'
                    ]) {
                        bat 'java -version'
                        bat 'mvn -version'
                        bat 'mvn test'
                    }
                }
            }
            post {
                always {
                    junit(
                        testResults: 'backend/target/surefire-reports/TEST-*.xml',
                        allowEmptyResults: true
                    )
                }
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Frontend Dependency Install') {
            steps {
                dir('frontend') {
                    timeout(time: 15, unit: 'MINUTES') {
                        bat 'node --version'
                        bat 'npm.cmd --version'

                        bat '''
                            if not exist package-lock.json (
                                echo ERROR: package-lock.json is missing
                                exit /b 1
                            )
                        '''

                        bat 'npm.cmd ci --no-audit --no-fund --verbose'
                    }
                }
            }
        }

        stage('Frontend Security Audit') {
            steps {
                dir('frontend') {
                    script {
                        int auditStatus = bat(
                            returnStatus: true,
                            script: 'npm.cmd audit --audit-level=high --json > frontend-audit.json'
                        )

                        archiveArtifacts(
                            artifacts: 'frontend/frontend-audit.json',
                            allowEmptyArchive: true
                        )

                        if (auditStatus != 0) {
                            error(
                                'Frontend npm audit failed. Check frontend/frontend-audit.json.'
                            )
                        }
                    }
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    timeout(time: 15, unit: 'MINUTES') {
                        bat 'npm.cmd run build'
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo 'SonarQube analysis is currently disabled.'
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                echo 'OWASP Dependency Check is currently disabled.'
            }
        }

        stage('Docker Image Build') {
            steps {
                bat '''
                    docker build -t %BACKEND_IMAGE% -f backend/Dockerfile backend
                '''

                bat '''
                    docker build -t %FRONTEND_IMAGE% -f frontend/Dockerfile frontend
                '''

                bat 'docker image ls securestock-backend'
                bat 'docker image ls securestock-frontend'
            }
        }

        stage('Trivy Image Scan') {
            steps {
                script {
                    int backendScanStatus = bat(
                        returnStatus: true,
                        script: '''
                            trivy image ^
                              --scanners vuln ^
                              --severity HIGH,CRITICAL ^
                              --skip-db-update ^
                              --skip-java-db-update ^
                              --exit-code 1 ^
                              --format json ^
                              --output backend-trivy-report.json ^
                              securestock-backend:latest
                        '''
                    )

                    int frontendScanStatus = bat(
                        returnStatus: true,
                        script: '''
                            trivy image ^
                              --scanners vuln ^
                              --severity HIGH,CRITICAL ^
                              --skip-db-update ^
                              --skip-java-db-update ^
                              --exit-code 1 ^
                              --format json ^
                              --output frontend-trivy-report.json ^
                              securestock-frontend:latest
                        '''
                    )

                    archiveArtifacts(
                        artifacts: '*-trivy-report.json',
                        allowEmptyArchive: true
                    )

                    if (backendScanStatus != 0 || frontendScanStatus != 0) {
                        error(
                            'Trivy detected HIGH/CRITICAL vulnerabilities or a scan error. Check the archived reports and console output.'
                        )
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'SecureStock CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'SecureStock CI/CD pipeline failed. Check the failed stage in Console Output.'
        }

        aborted {
            echo 'SecureStock CI/CD pipeline was aborted.'
        }

        always {
            echo 'SecureStock pipeline execution finished.'
        }
    }
}
