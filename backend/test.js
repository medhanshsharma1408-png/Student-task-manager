const http = require('http');
const { exec } = require('child_process');

let server = exec('node server.js', { cwd: __dirname });
server.stdout.on('data', data => console.log('SERVER:', data.toString().trim()));

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

setTimeout(async () => {
    try {
        console.log('--- TEST ADD TASK ---');
        let data = await request('POST', '/tasks', { title: 'Test HTTP Route', description: 'Testing the API using Node HTTP module directly', due_date: '2026-11-12' });
        console.log(data);
        const taskId = data.id;

        console.log('\n--- TEST GET TASKS ---');
        data = await request('GET', '/tasks');
        console.log(data);

        console.log('\n--- TEST UPDATE TASK ---');
        data = await request('PUT', `/tasks/${taskId}`, { title: 'Updated task title', status: 'Completed' });
        console.log(data);

        console.log('\n--- TEST DELETE TASK ---');
        data = await request('DELETE', `/tasks/${taskId}`);
        console.log(data);

        console.log('\n--- ALL TESTS PASSED ---');
    } catch (e) {
        console.error('TEST ERROR:', e);
    } finally {
        server.kill();
        process.exit();
    }
}, 2000);
