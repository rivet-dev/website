const endpoint = "https://rivet.example.com";

const response = await fetch(`${endpoint}/metadata`);
const metadata = await response.json();
console.log(metadata);

export {};
