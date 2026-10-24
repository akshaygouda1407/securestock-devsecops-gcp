pipeline {
    agent any

    options {
        timestamps()
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timeout(time: 90, unit: 'MINUTES')
    }

    tools {
        maven 'Maven-3'
    }

    environment {
        JAVA_TOOL_OPTIONS = '-Duser.timezone=Asia/Kolkata'
        JAVA_HOME = 'C:\\Program Files\\Java\\jdk-21.0.12'
        CHECKOV_EXE = 'E:\\checkov-venv\\Scripts\\checkov.cmd'

        PATH = "C:\\Windows\\System32;C:\\Program Files\\Git\\cmd;C:\\Program Files\\nodejs;C:\\Program Files\\Docker\\Docker\\resources\\bin;C:\\Program Files\\Java\\jdk-21.0.12\\bin;E:\\checkov-venv\\Scripts;C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Links;C:\\Program Files\\WindowsApps;${env.PATH}"

        SPRING_DATASOURCE_URL = 'jdbc:postgresql://localhost:5433/migration_dest'
        SPRING_DATASOURCE_USERNAME = 'postgres'
        SPRING_DATASOURCE_PASSWORD = 'cisco'

        BACKEND_IMAGE = 'securestock-backend:latest'
        FRONTEND_IMAGE = 'securestock-frontend:latest'

        TRIVY_CACHE_DIR = 'C:\\ProgramData\\Jenkins\\.jenkins\\trivy-cache'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm

                bat '''
                    @echo off
                    echo ===== Tool Versions =====
                    git --version
                    java -version
                    mvn -version
                    node --version
                    npm --version
                    docker --version
                    trivy --version
                    gitleaks version
                    echo =========================
                '''
            }
        }

        stage('Gitleaks Secret Scan') {
            steps {
                bat '''
                    @echo off
                    gitleaks detect --source . --no-git --redact --exit-code 1
                '''
            }
        }

        stage('Checkov Terraform Scan') {
            steps {
                script {
                    if (fileExists('terraform')) {
                        bat '''
                            @echo off
                            "%CHECKOV_EXE%" -d terraform --framework terraform -o json --output-file-path checkov-report.json
                        '''
                    } else {
                        echo 'No terraform directory found; skipping Checkov.'
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'checkov-report.json', allowEmptyArchive: true
                }
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    bat '''
                        @echo off
                        call mvnw.cmd -B test
                    '''
                }
            }
            post {
                always {
                    junit testResults: 'backend/target/surefire-reports/*.xml', allowEmptyResults: true
                }
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    bat '''
                        @echo off
                        call mvnw.cmd -B clean package -DskipTests
                    '''
                }
            }
        }

        stage('Frontend Dependency Install') {
            steps {
                dir('frontend') {
                    bat '''
                        @echo off
                        npm ci --no-audit --no-fund
                    '''
                }
            }
        }

        stage('Frontend Security Audit') {
            steps {
                dir('frontend') {
                    script {
                        int attempts = 3
                        boolean validJson = false

                        for (int i = 1; i <= attempts; i++) {
                            echo "Running npm audit attempt ${i} of ${attempts}"

                            int result = bat(
                                returnStatus: true,
                                script: '''
                                    @echo off
                                    npm audit --audit-level=high --json > npm-audit-report.json 2> npm-audit-error.txt
                                    exit /b 0
                                '''
                            )

                            result = bat(
                                returnStatus: true,
                                script: '''
                                    @echo off
                                    powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = Get-Content 'npm-audit-report.json' -Raw; try { $null = $p | ConvertFrom-Json -ErrorAction Stop; exit 0 } catch { exit 1 }"
                                '''
                            )

                            if (result == 0) {
                                validJson = true
                                break
                            }

                            echo 'npm audit did not produce valid JSON.'
                        }

                        if (!validJson) {
                            error('npm audit failed to produce valid JSON after three attempts. See archived reports.')
                        }

                        int auditStatus = bat(
                            returnStatus: true,
                            script: '''
                                @echo off
                                npm audit --audit-level=high
                            '''
                        )

                        if (auditStatus != 0) {
                            error('npm audit reported HIGH or CRITICAL vulnerabilities, or could not complete successfully.')
                        }
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'frontend/npm-audit-report.json,frontend/npm-audit-error.txt', allowEmptyArchive: true
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    bat '''
                        @echo off
                        npm run build
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo 'PLACEHOLDER: SonarQube analysis is not configured. No SonarQube scan was performed.'
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                echo 'PLACEHOLDER: OWASP Dependency-Check is not configured. No OWASP Dependency-Check scan was performed.'
            }
        }

        stage('Docker Image Build') {
            steps {
                bat '''
                    @echo off
                    docker build -t "%BACKEND_IMAGE%" -f backend/Dockerfile backend
                    if errorlevel 1 exit /b 1

                    docker build -t "%FRONTEND_IMAGE%" -f frontend/Dockerfile frontend
                    if errorlevel 1 exit /b 1

                    docker image ls "%BACKEND_IMAGE%"
                    docker image ls "%FRONTEND_IMAGE%"
                '''
            }
        }

        stage('Trivy Database Cache Verification') {
            steps {
                bat '''
                    @echo off
                    set "CACHE=%TRIVY_CACHE_DIR%"

                    if not exist "%CACHE%\\db\\metadata.json" (
                        echo ERROR: Trivy vulnerability DB metadata is missing.
                        exit /b 1
                    )

                    if not exist "%CACHE%\\db\\trivy.db" (
                        echo ERROR: Trivy vulnerability DB file is missing.
                        exit /b 1
                    )

                    if not exist "%CACHE%\\java-db\\metadata.json" (
                        echo ERROR: Trivy Java DB metadata is missing.
                        exit /b 1
                    )

                    if not exist "%CACHE%\\java-db\\trivy-java.db" (
                        echo ERROR: Trivy Java DB file is missing.
                        exit /b 1
                    )

                    echo Trivy cache files exist.
                    echo Vulnerability database metadata:
                    type "%CACHE%\\db\\metadata.json"
                    echo.
                    echo Java database metadata:
                    type "%CACHE%\\java-db\\metadata.json"
                '''
            }
        }

        stage('Trivy Backend Image Scan') {
            steps {
                bat '''
                    @echo off
                    trivy image ^
                      --cache-dir "%TRIVY_CACHE_DIR%" ^
                      --skip-db-update ^
                      --skip-java-db-update ^
                      --skip-version-check ^
                      --scanners vuln ^
                      --severity HIGH,CRITICAL ^
                      --exit-code 1 ^
                      --format json ^
                      --output trivy-backend-report.json ^
                      "%BACKEND_IMAGE%"

                    if errorlevel 1 exit /b 1
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-backend-report.json', allowEmptyArchive: true
                }
            }
        }

        stage('Trivy Frontend Image Scan') {
            steps {
                bat '''
                    @echo off
                    trivy image ^
                      --cache-dir "%TRIVY_CACHE_DIR%" ^
                      --skip-db-update ^
                      --skip-java-db-update ^
                      --skip-version-check ^
                      --scanners vuln ^
                      --severity HIGH,CRITICAL ^
                      --exit-code 1 ^
                      --format json ^
                      --output trivy-frontend-report.json ^
                      "%FRONTEND_IMAGE%"

                    if errorlevel 1 exit /b 1
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-frontend-report.json', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        success {
            echo 'SecureStock pipeline completed successfully.'
        }

        failure {
            echo 'SecureStock pipeline failed. Review the stage logs and archived reports.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}