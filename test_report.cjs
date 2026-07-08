fetch('http://localhost:5000/api/district/formal-report')
.then(res => res.json())
.then(console.log)
.catch(console.error);
