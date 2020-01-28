const Apify = require('apify');
const apiBenchmark = require('api-benchmark');

Apify.main(async () => {
    const { token } = Apify.getEnv();
    const { apiBaseUrl = 'https://api-securitybyobscurity.apify.com/v2'} = await Apify.getInput();
    const store = await Apify.openKeyValueStore('my-benchmark-test');
    console.log(`${apiBaseUrl}/key-value-stores/${store.storeId}`);

    const service = {
        server1: apiBaseUrl,
    };

    const recordKey = 'TEST';
    const routes = {
        getStore: {
            method: 'get',
            route: `/key-value-stores/${store.storeId}/records/${recordKey}?token=${token}`,
            expectedStatusCode: 200,
        },
        putRecord: {
            method: 'put',
            route: `/key-value-stores/${store.storeId}/records/${recordKey}?token=${token}`,
            data: { test: 'aaa' },
            expectedStatusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        },
        getRecord: {
            method: 'get',
            route: `/key-value-stores/${store.storeId}/records/${recordKey}?token=${token}`,
            expectedStatusCode: 200,
        },
    };

    return new Promise((resolve, reject) => {
        apiBenchmark.measure(service, routes, async (err, results) => {
            console.log(results);
            if (err) return reject(err);
            await Apify.setValue('results', results);

            apiBenchmark.getHtml(results, async (error, html) => {
                console.log(html);
                if (err) return reject(err);
                await Apify.setValue('html-results', html, { contentType: 'text/html' });
                resolve(results);
            });
        });
    });
});
