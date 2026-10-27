
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

        GITLEAKS_EXE = 'C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gitleaks.Gitleaks_Microsoft.Winget.Source_8wekyb3d8bbwe\\gitleaks.exe'

        PATH = "C:\\Windows\\System32;C:\\Windows\\System32\\WindowsPowerShell\\v1.0;C:\\Program Files\\Git\\cmd;C:\\Program Files\\nodejs;C:\\Users\\User\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;C:\\Program Files\\Java\\jdk-21.0.12\\bin;E:\\checkov-venv\\Scripts;C:\\Users\\User\\AppData\\Local\\Microsoft\\WindowsApps;${env.PATH}"

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
                    git --version
                    java -version
                    mvn -version
                    node --version
                    npm --version
                    docker --version
                    trivy --version

                    if not exist "%GITLEAKS_EXE%" (
                        echo ERROR: Gitleaks executable not found: %GITLEAKS_EXE%
                        exit /b 2
                    )

                    "%GITLEAKS_EXE%" version
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Gitleaks Secret Scan') {
            steps {
                bat '''
                    @echo off

                    if not exist "%GITLEAKS_EXE%" (
                        echo ERROR: Gitleaks executable not found: %GITLEAKS_EXE%
                        exit /b 2
                    )

                    "%GITLEAKS_EXE%" version
                    if errorlevel 1 exit /b 1

                    "%GITLEAKS_EXE%" detect --source . --no-git --redact --exit-code 1
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Checkov Terraform Scan') {
            steps {
                script {
                    if (!fileExists('terraform')) {
                        error('Terraform directory not found in the Jenkins workspace.')
                    }

                    int checkovStatus = bat(
                        returnStatus: true,
                        script: '''
                            @echo off
                            if exist "%WORKSPACE%\\checkov-report.json" del /f /q "%WORKSPACE%\\checkov-report.json"
                            if exist "%WORKSPACE%\\checkov-console.log" del /f /q "%WORKSPACE%\\checkov-console.log"

                            if not exist "%CHECKOV_EXE%" (
                                echo ERROR: Checkov executable not found: %CHECKOV_EXE%
                                exit /b 2
                            )

                            "%CHECKOV_EXE%" -d terraform --framework terraform --output json > "%WORKSPACE%\\checkov-report.json" 2> "%WORKSPACE%\\checkov-console.log"
                            exit /b %ERRORLEVEL%
                        '''
                    )

                    if (!fileExists('checkov-report.json') ||
                        !readFile('checkov-report.json').trim()) {
                        if (fileExists('checkov-console.log')) {
                            echo readFile('checkov-console.log')
                        }
                        error('Checkov did not generate a non-empty JSON report.')
                    }

                    if (checkovStatus != 0) {
                        error("Checkov failed with exit code ${checkovStatus}. Review its report.")
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'checkov-report.json,checkov-console.log',
                        allowEmptyArchive: true, fingerprint: true
                }
            }
        }

        stage('Backend Tests') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'securestock-db-credentials',
                    usernameVariable: 'DB_USER',
                    passwordVariable: 'DB_PASSWORD'
                )]) {
                    dir('backend') {
                        bat '''
                            @echo off
                            set "SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/migration_dest"
                            set "SPRING_DATASOURCE_USERNAME=%DB_USER%"
                            set "SPRING_DATASOURCE_PASSWORD=%DB_PASSWORD%"
                            call mvnw.cmd -B test
                            exit /b %ERRORLEVEL%
                        '''
                    }
                }
            }
            post {
                always {
                    junit testResults: 'backend/target/surefire-reports/*.xml',
                        allowEmptyResults: true
                }
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    bat '''
                        @echo off
                        call mvnw.cmd -B clean package -DskipTests
                        if errorlevel 1 exit /b 1
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
                        if errorlevel 1 exit /b 1
                    '''
                }
            }
        }

        stage('Frontend Security Audit') {
            steps {
                dir('frontend') {
                    script {
                        boolean validJson = false

                        for (int attempt = 1; attempt <= 3; attempt++) {
                            echo "Running npm audit report attempt ${attempt} of 3"

                            bat(
                                returnStatus: true,
                                script: '''
                                    @echo off
                                    npm audit --json > npm-audit-report.json 2> npm-audit-error.txt
                                    exit /b 0
                                '''
                            )

                            int jsonStatus = bat(
                                returnStatus: true,
                                script: '''
                                    @echo off
                                    powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = Get-Content 'npm-audit-report.json' -Raw; try { $null = $p | ConvertFrom-Json -ErrorAction Stop; exit 0 } catch { exit 1 }"
                                '''
                            )

                            if (jsonStatus == 0) {
                                validJson = true
                                break
                            }

                            echo 'npm audit did not produce valid JSON.'
                        }

                        if (!validJson) {
                            error('npm audit failed to produce valid JSON after three attempts.')
                        }

                        int auditStatus = bat(
                            returnStatus: true,
                            script: '''
                                @echo off
                                npm audit --audit-level=high
                            '''
                        )

                        if (auditStatus != 0) {
                            error('npm audit found high/critical vulnerabilities or failed.')
                        }
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'frontend/npm-audit-report.json,frontend/npm-audit-error.txt',
                        allowEmptyArchive: true
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    bat '''
                        @echo off
                        npm run build
                        if errorlevel 1 exit /b 1
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SecureStock-SonarQube') {
                        bat """
                            @echo off
                            "${scannerHome}\\bin\\sonar-scanner.bat" ^
                              -Dsonar.projectKey=SecureStock ^
                              -Dsonar.projectName=SecureStock ^
                              -Dsonar.sources=backend/src/main/java,frontend/src ^
                              -Dsonar.java.binaries=backend/target/classes ^
                              -Dsonar.sourceEncoding=UTF-8 ^
                              -Dsonar.exclusions=frontend/node_modules/**,frontend/build/**,frontend/dist/**,**/target/**
                            if errorlevel 1 exit /b 1
                        """
                    }
                }
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                script {
                    dependencyCheck(
                        odcInstallation: 'OWASP-Dependency-Check',
                        additionalArguments: '--scan backend --scan frontend --format ALL --out dependency-check-reports --noupdate'
                    )
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'dependency-check-reports/**',
                        allowEmptyArchive: true, fingerprint: true

                    dependencyCheckPublisher(
                        pattern: 'dependency-check-reports/dependency-check-report.xml',
                        failedTotalHigh: 0,
                        unstableTotalHigh: 10
                    )
                }
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

        stage('Trivy Database Refresh') {
            steps {
                bat '''
                    @echo off
                    if not exist "%TRIVY_CACHE_DIR%" mkdir "%TRIVY_CACHE_DIR%"

                    trivy image --cache-dir "%TRIVY_CACHE_DIR%" --download-db-only
                    if errorlevel 1 exit /b 1

                    trivy image --cache-dir "%TRIVY_CACHE_DIR%" --download-java-db-only
                    if errorlevel 1 exit /b 1

                    echo Trivy vulnerability databases refreshed.
                '''
            }
        }

        stage('Trivy Database Verification') {
            steps {
                bat '''
                    @echo off
                    set "CACHE=%TRIVY_CACHE_DIR%"

                    if not exist "%CACHE%\\db\\metadata.json" (
                        echo ERROR: Trivy vulnerability database metadata is missing.
                        exit /b 1
                    )

                    if not exist "%CACHE%\\db\\trivy.db" (
                        echo ERROR: Trivy vulnerability database is missing.
                        exit /b 1
                    )

                    if not exist "%CACHE%\\java-db\\metadata.json" (
                        echo ERROR: Trivy Java database metadata is missing.
                        exit /b 1
                    )

                    if not exist "%CACHE%\\java-db\\trivy-java.db" (
                        echo ERROR: Trivy Java database is missing.
                        exit /b 1
                    )

                    echo Trivy database metadata:
                    type "%CACHE%\\db\\metadata.json"
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
                    archiveArtifacts artifacts: 'trivy-backend-report.json',
                        allowEmptyArchive: true
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
                    archiveArtifacts artifacts: 'trivy-frontend-report.json',
                        allowEmptyArchive: true
                }
            }
        }
    }

    post {
        success {
            echo 'SecureStock CI and security pipeline completed successfully.'
        }
        failure {
            echo 'SecureStock pipeline failed. Review the failed stage and archived reports.'
        }
        always {
            echo 'SecureStock pipeline execution finished.'
        }
    }
}
