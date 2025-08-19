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
                // Use npm ci for reproducible builds
                sh 'npm ci'
                // Install Playwright browsers with dependencies
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                // Generate HTML report
                sh 'npx playwright test --reporter=html'
            }
        }

        stage('Archive Reports & API Responses') {
            steps {
                // Archive Playwright report
                archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                // Archive any stored API responses
                archiveArtifacts artifacts: 'api_responses/*.json', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo "Build finished. Reports are archived in Jenkins."
        }
    }
}
