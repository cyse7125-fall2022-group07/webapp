console.log("Consumer")
const Kafka = require('node-rdkafka');
const { Client } = require('@elastic/elasticsearch')
const fs = require("fs");
const logger = require('simple-node-logger').createSimpleLogger();

const client = new  ({
    node: `http://ad8ffbba39374431f870b667be7607ab-126311207.us-east-1.elb.amazonaws.com:9200`,
    maxRetries: 5,
    requestTimeout: 60000
})

client.info().then(console.log, console.log)

// create a stream with broker list, options and topic
const consumer = Kafka.KafkaConsumer({
    'group.id': 'helm-chart-dependency',
    'metadata.broker.list': `a1c4ee8f3954640cfb56f12dd4b11f5e-553992679.us-east-1.elb.amazonaws.com:9094`
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