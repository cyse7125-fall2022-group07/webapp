node {
    // def app

    // stage('Clone Repo'){
    //     checkout scm
    // }

    // sh "git rev-parse HEAD > .git/commit-id"
    // def commit_id = readFile('.git/commit-id').trim()

    // stage('Build Image'){
    //     app = docker.build("${env.DOCKER_ID1}")
    // }
    // stage('Publish Image to Registry'){
    //     docker.withRegistry('https://registry.hub.docker.com', 'docker-cred'){
    //         app.push("${commit_id}")
    //         app.push("latest")
    //     }
    // }
    // stage('Get Latest Release of Helm Chart and unzip')
    //         {
    //         withCredentials([string(credentialsId: 'GITHUB_TOKEN', variable: 'GITHUB_TOKEN')])
    //         {
    //         sh"""
    //         rm -f *tar.gz
    //         export TAG=`eval curl -s -u $GITHUB_TOKEN:x-oauth-basic https://api.github.com/repos/cyse7125-fall2022-group07/helm-chart/releases/latest | grep 'tag_name' | cut -d '\"' -f 4`
    //         echo \$TAG
    //         `curl -u $GITHUB_TOKEN:x-oauth-basic https://github.com/cyse7125-fall2022-group07/helm-chart/archive/refs/tags/\$TAG.tar.gz -LJOH 'Accept: application/octet-stream'`
    //         ls -lrt
    //         tar -xvf *.tar.gz
    //         ls -lrt
    //         rm -f *tar.gz
    //         ls -lrt
    //         """
    //         }
    //         }
    stage ('Deploy') {
        sh"""

        export DB_PASSWORD=${env.DB_PASSWORD}
        export DB_USER=${env.DB_USER}
        export AWS_ACCESS_KEY_ID=${env.AWS_ACCESS_KEY_ID}
        export AWS_SECRET_ACCESS_KEY=${env.AWS_SECRET_ACCESS_KEY}
        export AWS_DEFAULT_REGION=${env.AWS_DEFAULT_REGION}
        export KOPS_STATE_STORE=${env.KOPS_STATE_STORE}
        kops export kubecfg ${env.CLUSTER_NAME} --state ${env.KOPS_STATE_STORE} --admin

        helm upgrade --install --wait --set image.repository=${env.DOCKER_ID1},image.tag=${commit_id},DB_PASSWORD=${env.DB_PASSWORD},DB_USER=${env.DB_USER} todo-app ./helm-chart*/todo-app
        """
    }
}

        // helm upgrade --install --wait --set image.repository=${env.DOCKER_ID1},image.tag=${commit_id} todo-app ./helm-chart*/todo-app/

        // helm upgrade --install --wait --set image.repository=${env.DOCKER_ID1},image.tag=${commit_id},DB_USER=${env.DB_USER},DB_PASSWORD=${env.DB_PASSWORD},NODE_ENV=${env.NODE_ENV},DB_NAME=${env.DB_NAME},FLYWAY_ENDPOINT=${env.FLYWAY_ENDPOINT},DB_HOST=${env.DB_HOST},namespace=${env.namespace},imagePullSecrets=${env.imagePullSecrets},repository=${env.repository},image=${env.image},elastic_endpoint=${env.elastic_endpoint},kafka_broker=${env.kafka_broker} todo-app ./helm-chart*/todo-app/
        // export DB_USER=${env.DB_USER}
        // export DB_PASSWORD=${env.DB_PASSWORD}
        // export NODE_ENV=${env.NODE_ENV}
        // export DB_NAME=${env.DB_NAME}
        // export FLYWAY_ENDPOINT=${env.FLYWAY_ENDPOINT}
        // export DB_HOST=${env.DB_HOST}
        // export namespace=${env.namespace}
        // export imagePullSecrets=${env.imagePullSecrets}
        // export repository=${env.repository}
        // export image=${env.image}
        // export elastic_endpoint=${env.elastic_endpoint}
        // export kafka_broker=${env.kafka_broker}