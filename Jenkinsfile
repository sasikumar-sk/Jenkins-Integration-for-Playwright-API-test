pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install'
            }
        }
        stage('Run Playwright Tests') {
            steps {
                sh 'npx playwright test --reporter=html'
            }
        }
        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                archiveArtifacts artifacts: 'api_responses/*.json', allowEmptyArchive: true
            }
        }
    }
}

