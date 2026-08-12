import { request } from 'http';

const BASE = 'http://127.0.0.1:8080/v1/projects/demo-sahara/databases/(default)/documents';
const COLLECTIONS = [
  'tasks',
  'locations',
  'stories',
  'attendance',
  'team',
  'activities',
  'timeline',
  'async_jobs',
  'users',
  'notifications',
];

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(BASE + path);
    const r = request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        timeout: 15000,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data || '{}'));
          } catch {
            resolve({});
          }
        });
      }
    );
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function clearCollection(name) {
  const list = await req('GET', `/${name}?pageSize=1000`);
  const docs = list.documents || [];
  for (const doc of docs) {
    const docPath = doc.name.substring(doc.name.indexOf('/documents/') + '/documents/'.length);
    try {
      await req('DELETE', `/${docPath}`);
    } catch {
      // ignore individual failures
    }
  }
  console.log(`Cleared ${name}: ${docs.length} document(s)`);
}

async function main() {
  for (const c of COLLECTIONS) {
    try {
      await clearCollection(c);
    } catch (err) {
      console.log(`Skipped ${c}: ${err.message}`);
    }
  }
  console.log('Emulator database reset complete.');
}

main();
