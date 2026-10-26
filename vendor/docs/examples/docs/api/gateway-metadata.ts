const endpoint = "https://rivet.example.com";
const response = await fetch(
	`${endpoint}/gateway/${process.env.ACTOR_ID}/metadata`,
	{
		headers: { Authorization: `Bearer ${process.env.RIVET_TOKEN}` },
	},
);
console.log(await response.json());
export {};
