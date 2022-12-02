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
    stage('Get latest Release')
    {
        sh '''  
        
        output = 'curl -u $GITHUB_TOKEN:x-oauth-basic --silent "https://api.github.com/repos/cyse7125-fall2022-group07/webapp/releases/latest" |
        grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' '
        $output


        curl -u $GITHUB_TOKEN:x-oauth-basic https://github.com/cyse7125-fall2022-group07/webapp/archive/refs/tags/\$output.tar.gz -LJOH 'Accept: application/octet-stream' 
        tar -xvf \$output.tar.gz
        '''
    }
        // curl -u $GITHUB_TOKEN:x-oauth-basic --silent "https://api.github.com/repos/cyse7125-fall2022-group07/webapp/releases/latest" |
        //             grep '"tag_name":' |                                            
        //             sed -E 's/.*"([^"]+)".*/\1/' > output
        //             echo $output
    stage ('Deploy') {
        sh"""
        export AWS_ACCESS_KEY_ID=${env.AWS_ACCESS_KEY_ID}
        export AWS_SECRET_ACCESS_KEY=${env.AWS_SECRET_ACCESS_KEY}
        export AWS_DEFAULT_REGION=${env.AWS_DEFAULT_REGION}
        export KOPS_STATE_STORE=${env.KOPS_STATE_STORE}
        kops export kubecfg ${env.CLUSTER_NAME} --state ${env.KOPS_STATE_STORE}
        helm upgrade --install --wait --set image.repository=${env.DOCKER_ID1},image.tag=${commit_id} todo-app ./helm-chart*
        """ 
    }
}