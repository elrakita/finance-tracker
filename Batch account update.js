

const token = localStorage.getItem('auth-token');
const url = 'http://localhost:5143/api/transactions'; // Update your port
const accountId = '2963ad14-731c-465c-8e49-253e6f1724b8';
const categoryId = "98c49e08-98ac-4379-987f-14c5e179fd44"

async function runStressTest(accountId) {
  console.log("🚀 Starting Stress Test: Sending 50 transactions...");

  for (let i = 1; i <= 50; i++) {
    // We don't 'await' here because we WANT to spam the server
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-SignalR-Connection-Id': 'manual-test-sender' // Different ID so THIS tab gets notified
      },
      body: JSON.stringify({
        accountId: accountId,
        categoryId: categoryId,
        amount: 1.0,
        type: 1, // Income
        description: `Batch Test ${i}`
      })
    });

    // Every 10 requests, wait 100ms to see if a new "batch" starts
    if (i % 10 === 0) await new Promise(r => setTimeout(r, 100));
  }
  
  console.log("✅ All 50 requests sent!");
}

runStressTest('2963ad14-731c-465c-8e49-253e6f1724b8');
runStressTest('e89647b2-14e7-4d0f-bbf8-ea1640b80870');
runStressTest('b5bcbd8d-e528-4c2e-86c4-0d0a80c2ad3a');