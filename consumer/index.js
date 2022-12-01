console.log("Consumer")
const Kafka = require('node-rdkafka');
const { Client } = require('@elastic/elasticsearch')
const fs = require("fs");
const logger = require('simple-node-logger').createSimpleLogger();

const client = new Client({
    node: `http://a682e275fe56a4732b42145a25811252-1394055622.us-east-1.elb.amazonaws.com:9200/`,
    maxRetries: 5,
    requestTimeout: 60000
})

client.info().then(console.log, console.log)

// create a stream with broker list, options and topic
const consumer = Kafka.KafkaConsumer({
    'group.id': 'helm-chart-dependency',
    'metadata.broker.list': `a86bf37cf49104637a233d9500136bc4-28372868.us-east-1.elb.amazonaws.com:9094`
}, {})

consumer.connect();

consumer.on('ready', () => {
    console.log('Consumer testing')
    consumer.subscribe([`task`])
    consumer.consume();
}).on('data', async (data) => {
    console.log(`The message is received: ${data.value}`)
    let parsedData = JSON.parse(data.value);
    let {index, id, ...indexData} = {...parsedData}
    await client.update({
        index: parsedData.index,
        id: parsedData.elasticid,
        doc: {
            task: indexData.task,
            summary: indexData.summary,
            duedate: indexData.dueDate,
            priority: indexData.priority
        }
    })
})