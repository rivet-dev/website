const endpoint = "https://rivet.example.com";
const response = await fetch(
	`${endpoint}/gateway/${process.env.ACTOR_ID}/inspector/queue`,
	{
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.INSPECTOR_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name: "increment", body: { amount: 1 } }),
	},
);
console.log(await response.json());
export {};
