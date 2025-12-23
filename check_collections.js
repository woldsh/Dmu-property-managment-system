const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function check() {
    console.log("Checking User_reports...");
    const snap1 = await db.collection('User_reports').limit(1).get();
    console.log("User_reports size:", snap1.size);
    if (snap1.size > 0) console.log("Sample:", snap1.docs[0].data());

    console.log("\nChecking User-Report...");
    const snap2 = await db.collection('User-Report').limit(1).get();
    console.log("User-Report size:", snap2.size);
    if (snap2.size > 0) console.log("Sample:", snap2.docs[0].data());
}

check().catch(console.error);
