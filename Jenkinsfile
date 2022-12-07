node {
    def app

    stage('Clone the Github Repository'){
        checkout scm
    }

    sh "git rev-parse HEAD > .git/commit-id"
    def commit_id = readFile('.git/commit-id').trim()

    stage('Build Docker Image'){
        app = docker.build("${env.WEBAPPDOCKER_REPO}")
    }
    stage('Publish Docker Image to DockerHub Registry'){
        docker.withRegistry('https://registry.hub.docker.com', 'docker-regcred'){
            app.push("${commit_id}")
            app.push("latest")
        }
    }
    stage('Get the updated version of helm chart')
            {
            withCredentials([string(credentialsId: 'GITHUB_TOKEN', variable: 'GITHUB_TOKEN')])
            {
            sh"""
            rm -f *tar.gz
            rm -rf helm-chart*
            export TAG=`eval curl -s -u $GITHUB_TOKEN:x-oauth-basic https://api.github.com/repos/cyse7125-fall2022-group07/helm-chart/releases/latest | grep 'tag_name' | cut -d '\"' -f 4`
            echo \$TAG
            `curl -u $GITHUB_TOKEN:x-oauth-basic https://github.com/cyse7125-fall2022-group07/helm-chart/archive/refs/tags/\$TAG.tar.gz -LJOH 'Accept: application/octet-stream'`
            ls -lrt
            tar -xvf *.tar.gz
            ls -lrt
            rm -f *tar.gz
            ls -lrt
            """
            }
            }
    stage ('Deploy') {
        sh"""
        pwd
        ls -lta

        helm upgrade --install --set data.DB_PASSWORD=${env.DB_PASSWORD},data.DB_USER=${env.DB_USER},data.FLYWAY_ENDPOINT=${env.FLYWAY_ENDPOINT},data.DB_HOST=${env.DB_HOST},data.elastic_endpoint=${env.elastic_endpoint},data.kafka_broker=${env.kafka_broker},data.NODE_ENV=${env.NODE_ENV},data.DB_NAME=${env.DB_NAME},"initContainer.image=${env.image}",image.repository=${env.repository},imagePullSecrets=regcred,namespace=kubernetes-dashboard todo-app ./helm-chart*/todo-app
        """}
    }