const Apify = require('apify');
const apiBenchmark = require('api-benchmark');

Apify.main(async () => {
    const { token } = Apify.getEnv();
    const { apiBaseUrl } = await Apify.getInput();
    const store = await Apify.openKeyValueStore('my-benchmark-test', { forceCloud: true });
    console.log(`Testing Store - ${apiBaseUrl}/key-value-stores/${store.storeId}`);

    const service = {
        server1: apiBaseUrl,
    };

    const recordKey = 'TEST';
    const routes = {
        getStore: {
            method: 'get',
            route: `/v2/key-value-stores/${store.storeId}?token=${token}`,
            expectedStatusCode: 200,
        },
        putRecord: {
            method: 'put',
            route: `/v2/key-value-stores/${store.storeId}/records/${recordKey}?token=${token}`,
            data: { test: 'aaa' },
            expectedStatusCode: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        },
        getRecord: {
            method: 'get',
            route: `/v2/key-value-stores/${store.storeId}/records/${recordKey}?token=${token}`,
            expectedStatusCode: 200,
        },
    };

    const opts = {
        debug: true,
        stopOnError: false,
        minSamples: 100,
    };

    return new Promise((resolve, reject) => {
        apiBenchmark.measure(service, routes, opts, async (err, results) => {
            if (err) return reject(err);
            await Apify.setValue('results', results);

            apiBenchmark.getHtml(results, async (error, html) => {
                if (err) return reject(err);
                await Apify.setValue('html-results', html, { contentType: 'text/html' });
                resolve(results);
            });
        });
    });
});
