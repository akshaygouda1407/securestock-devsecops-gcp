pipeline {
    agent any

    environment {
        JAVA_HOME = 'C:\\Program Files\\Java\\jdk-21.0.12'

        PATH = "C:\\Program Files\\Git\\cmd;" +
               "C:\\Program Files\\nodejs;" +
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
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool 'SonarScanner'
                        bat "\"${scannerHome}\\bin\\sonar-scanner.bat\""
                    }
                }
            }
        }
        stage('OWASP Dependency Check') {
            steps {
                dependencyCheck additionalArguments: '--scan backend --format HTML --prettyPrint',
                        odcInstallation: 'OWASP-Dependency-Check'

                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
                }
        }
    }
}