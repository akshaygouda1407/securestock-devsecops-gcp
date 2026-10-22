
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
        JAVA_HOME = 'C:\\Program Files\\Java\\jdk-21.0.12'
        CHECKOV_EXE = 'E:\\checkov-venv\\Scripts\\checkov.cmd'

        PATH = "C:\\Program Files\\Git\\cmd;C:\\Program Files\\nodejs;C:\\Users\\User\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;C:\\Program Files\\Java\\jdk-21.0.12\\bin;E:\\checkov-venv\\Scripts;C:\\Users\\User\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\User\\AppData\\Local\\Microsoft\\WinGet\\Links;${env.PATH}"

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
                bat 'gitleaks version'
                bat 'trivy --version'
                bat '"%CHECKOV_EXE%" --version'
            }
        }

        stage('GitLeaks Scan') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    bat '''
                        gitleaks detect ^
                          --source . ^
                          --no-git ^
                          --redact ^
                          --exit-code 1
                    '''
                }
            }
        }

        stage('Terraform Security Scan') {
            steps {
                script {
                    if (fileExists('terraform')) {
                        int checkovStatus = bat(
                            returnStatus: true,
                            script: '''
                                "%CHECKOV_EXE%" ^
                                  -d terraform ^
                                  --framework terraform ^
                                  --output json ^
                                  --output-file-path console,checkov-report.json
                            '''
                        )

                        archiveArtifacts(
                            artifacts: 'checkov-report.json',
                            allowEmptyArchive: true
                        )

                        if (checkovStatus != 0) {
                            error('Checkov Terraform security scan failed. Review the scan output and checkov-report.json.')
                        }
                    } else {
                        echo 'No terraform directory found. Terraform scan skipped.'
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
                        timeout(time: 15, unit: 'MINUTES') {
                            bat 'mvn -version'
                            bat 'mvn test'
                        }
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
                    timeout(time: 15, unit: 'MINUTES') {
                        bat 'mvn clean package -DskipTests'
                    }
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
                script {
                    int auditStatus = 1
                    boolean validAuditReport = false

                    for (int attempt = 1; attempt <= 3; attempt++) {
                        echo "Running frontend security audit (attempt ${attempt}/3)"

                        dir('frontend') {
                            auditStatus = bat(
                                returnStatus: true,
                                script: 'npm.cmd audit --audit-level=high --json > ..\\frontend-audit.json 2> ..\\frontend-audit-error.txt'
                            )
                        }

                        int validationStatus = bat(
                            returnStatus: true,
                            script: '''
                                powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command ^
                                  "$p = Join-Path (Get-Location) 'frontend-audit.json'; ^
                                   if (-not (Test-Path $p)) { exit 1 }; ^
                                   try { ^
                                     $r = Get-Content -Raw $p | ConvertFrom-Json -ErrorAction Stop; ^
                                     if ($null -ne $r.metadata -and $null -ne $r.metadata.vulnerabilities) { exit 0 } else { exit 1 } ^
                                   } catch { exit 1 }"
                            '''
                        )

                        if (validationStatus == 0) {
                            validAuditReport = true
                            break
                        }

                        if (attempt < 3) {
                            echo 'npm audit did not return a valid report. Retrying in 20 seconds.'
                            sleep time: 20, unit: 'SECONDS'
                        }
                    }

                    archiveArtifacts(
                        artifacts: 'frontend-audit.json,frontend-audit-error.txt',
                        allowEmptyArchive: true
                    )

                    if (!validAuditReport) {
                        error('npm audit did not return a valid JSON report after 3 attempts. Inspect frontend-audit-error.txt and check npm registry availability.')
                    }

                    if (auditStatus != 0) {
                        error('Frontend npm audit reported vulnerabilities at the configured severity threshold or another audit failure. Inspect frontend-audit.json.')
                    }

                    echo 'Frontend security audit passed.'
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
                echo 'SonarQube analysis is not configured and remains disabled.'
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                echo 'OWASP Dependency Check is not configured and remains disabled.'
            }
        }

        stage('Docker Image Build') {
            steps {
                bat 'docker version'

                bat '''
                    docker build ^
                      -t %BACKEND_IMAGE% ^
                      -f backend/Dockerfile ^
                      backend
                '''

                bat '''
                    docker build ^
                      -t %FRONTEND_IMAGE% ^
                      -f frontend/Dockerfile ^
                      frontend
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
                              --db-repository ghcr.io/aquasecurity/trivy-db:2 ^
                              --timeout 15m ^
                              --scanners vuln ^
                              --severity HIGH,CRITICAL ^
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
                              --db-repository ghcr.io/aquasecurity/trivy-db:2 ^
                              --timeout 15m ^
                              --scanners vuln ^
                              --severity HIGH,CRITICAL ^
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
                        error('Trivy scan failed or found HIGH/CRITICAL vulnerabilities. Review the console output and archived reports.')
                    }

                    echo 'Backend and frontend Trivy scans passed.'
                }
            }
        }
    }

    post {
        success {
            echo 'SecureStock CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'SecureStock CI/CD pipeline failed. Review the first failing stage and its console output.'
        }

        aborted {
            echo 'SecureStock pipeline was aborted or timed out.'
        }

        always {
            echo 'SecureStock pipeline execution finished.'
        }
    }
}
