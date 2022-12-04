node {
    def app

    stage('Clone Repo'){
        checkout scm
    }

    sh "git rev-parse HEAD > .git/commit-id"
    def commit_id = readFile('.git/commit-id').trim()

    stage('Build Image'){
        app = docker.build("${env.DOCKER_ID1}")
    }
    stage('Publish Image to Registry'){
        docker.withRegistry('https://registry.hub.docker.com', 'docker-cred'){
            app.push("${commit_id}")
            app.push("latest")
        }
    }
    stage('Get Latest Release of Helm Chart and unzip')
            {
            withCredentials([string(credentialsId: 'GITHUB_TOKEN', variable: 'GITHUB_TOKEN')])
            {
            sh"""
            rm -f *tar.gz
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
        export data.DB_USER=${env.data.DB_USER}
        export data.DB_PASSWORD=${env.data.DB_PASSWORD}
        export data.NODE_ENV=${env.data.NODE_ENV}
        export data.DB_NAME=${env.data.DB_NAME}
        export data.FLYWAY_ENDPOINT=${data.FLYWAY_ENDPOINT}
        export data.DB_HOST=${data.DB_HOST}
        export namespace=${namespace}
        export imagePullSecrets=${imagePullSecrets}
        export image.repository=${image.repository}
        export initContainer.image=${initContainer.image}
        export data.elastic_endpoint=${data.elastic_endpoint}
        export data.kafka_broker=${data.kafka_broker}
        export AWS_ACCESS_KEY_ID=${env.AWS_ACCESS_KEY_ID}
        export AWS_SECRET_ACCESS_KEY=${env.AWS_SECRET_ACCESS_KEY}
        export AWS_DEFAULT_REGION=${env.AWS_DEFAULT_REGION}
        export KOPS_STATE_STORE=${env.KOPS_STATE_STORE}
        kops export kubecfg ${env.CLUSTER_NAME} --state ${env.KOPS_STATE_STORE} --admin

        helm upgrade --install --wait --set image.repository=${env.DOCKER_ID1},image.tag=${commit_id},data.DB_USER=${env.data.DB_USER},data.DB_PASSWORD=${env.data.DB_PASSWORD},data.NODE_ENV=${env.data.NODE_ENV},data.DB_NAME=${env.data.DB_NAME},data.FLYWAY_ENDPOINT=${data.FLYWAY_ENDPOINT},data.DB_HOST=${data.DB_HOST},namespace=${namespace},imagePullSecrets=${imagePullSecrets},image.repository=${image.repository},initContainer.image=${initContainer.image},data.elastic_endpoint=${data.elastic_endpoint},data.kafka_broker=${data.kafka_broker} todo-app ./helm-chart*/todo-app/
        """
    }
}

        // helm upgrade --install --wait --set image.repository=${env.DOCKER_ID1},image.tag=${commit_id} todo-app ./helm-chart*/todo-app/