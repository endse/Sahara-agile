import { initializeApp, cert } from 'firebase-admin/app';
import { getSecurityRules } from 'firebase-admin/security-rules';
import * as fs from 'fs';
import * as path from 'path';

async function deployRules() {
  console.log('Initializing Firebase Admin...');
  const serviceAccount = JSON.parse(fs.readFileSync(path.resolve('firebase-applet-config.json'), 'utf8'));

  const app = initializeApp({
    credential: cert(serviceAccount)
  });

  try {
    const rulesPath = path.resolve('firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    
    console.log('Deploying rules...');
    const securityRules = getSecurityRules(app);
    
    const ruleset = await securityRules.createRuleset({
      name: 'firestore.rules',
      content: rulesContent
    });

    await securityRules.releaseFirestoreRuleset(ruleset.name);
    console.log('✅ Successfully deployed firestore.rules to Firebase!');
  } catch (err) {
    console.error('❌ Failed to deploy rules:', err);
  } finally {
    process.exit(0);
  }
}

deployRules();
