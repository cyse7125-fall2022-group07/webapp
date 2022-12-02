console.log("Consumer")
const Kafka = require('node-rdkafka');
const { Client } = require('@elastic/elasticsearch')
const fs = require("fs");
const logger = require('simple-node-logger').createSimpleLogger();

const client = new  ({
    node: `http://a9aea3364d1534385ae921cc0e71f62f-581012114.us-east-1.elb.amazonaws.com:9200`,
    maxRetries: 5,
    requestTimeout: 60000
})

client.info().then(console.log, console.log)

// create a stream with broker list, options and topic
const consumer = Kafka.KafkaConsumer({
    'group.id': 'helm-chart-dependency',
    'metadata.broker.list': `a961b7638cb73450cb89867e96fd474d-376908345.us-east-1.elb.amazonaws.com:9094`
}, {})

consumer.connect();

consumer.on('ready', () => {
    console.log('Consumer testing')
    consumer.subscribe([`task`])
    consumer.consume();
}).on('data', async (data) => {
    console.log(`The message is received: ${data.value}`)
    let parsedData = JSON.parse(data.value);
    console.log('parsedData ',parsedData)
    let {index, search_id, ...indexData} = {...parsedData}
    console.log("indexData ",index, search_id,indexData )

    await client.update({
        index: parsedData.index,
        id: parsedData.search_id,
        doc: {
            task: indexData.task,
            summary: indexData.summary,
            duedate: indexData.dueDate,
            priority: indexData.priority
        }
    })
})