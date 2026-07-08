fetch('http://localhost:5000/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Hello!', role: 'admin', language: 'en' })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
