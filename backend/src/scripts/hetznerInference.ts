import "dotenv/config";

const API_URL = "https://inference.hetzner.com/api/v1/chat/completions";

function requireEnv(name: string): string {
	const value = process.env[name]?.trim();
	if (!value)
		throw new Error(`Missing required environment variable: ${name}`);
	return value;
}

const examples = [
	{
		description: "The monster exhales fire in a 60-foot line that is 5 feet wide. Each creature in that line must make a DC 18 Dexterity saving throw, taking 54 (12d8) fire damage on a failed save, or half as much damage on a successful one.",
		automation: {
		   "_v": 2,
		   "name": "Breath Weapon with Recharge",
		   "verb": "unleashes their",
		   "proper": true,
		   "automation": [
		      {
		         "type": "target",
		         "sortBy": null,
		         "target": "self",
		         "effects": [
		            {
		               "name": "Breath Weapon Used",
		               "type": "ieffect2",
		               "buttons": [
		                  {
		                     "verb": "attempts to recharge their Breath Weapon",
		                     "label": "Recharge Breath Weapon",
		                     "style": "3",
		                     "automation": [
		                        {
		                           "dice": "1d6",
		                           "name": "recharge",
		                           "type": "roll",
		                           "hidden": false,
		                           "cantripScale": false
		                        },
		                        {
		                           "type": "condition",
		                           "onTrue": [
		                              {
		                                 "type": "remove_ieffect",
		                                 "removeParent": null
		                              },
		                              {
		                                 "text": "{{caster.name}} recharges their Breath Weapon!",
		                                 "type": "text"
		                              }
		                           ],
		                           "onFalse": [
		                              {
		                                 "text": "{{caster.name}} doesn't recharge their Breath Weapon!",
		                                 "type": "text"
		                              }
		                           ],
		                           "condition": "int(recharge) >= 5",
		                           "errorBehaviour": "false"
		                        }
		                     ]
		                  }
		               ],
		               "stacking": true
		            }
		         ]
		      },
		      {
		         "dice": "12d8 [fire]",
		         "name": "damage",
		         "type": "roll"
		      },
		      {
		         "meta": [],
		         "type": "target",
		         "target": "each",
		         "effects": [
		            {
		               "dc": "18",
		               "fail": [
		                  {
		                     "type": "damage",
		                     "damage": "{damage}"
		                  }
		               ],
		               "stat": "dex",
		               "type": "save",
		               "success": [
		                  {
		                     "type": "damage",
		                     "damage": "{damage}/2"
		                  }
		               ]
		            }
		         ]
		      },
		      {
		         "text": "The monster exhales fire in a 60-foot line that is 5 feet wide. Each creature in that line must make a DC 18 Dexterity saving throw, taking 54 (12d8) fire damage on a failed save, or half as much damage on a successful one.",
		         "type": "text"
		      }
		   ]
		}
	}
]

async function main() {
	const apiToken = requireEnv("HETZNER_API_TOKEN");
	const model = requireEnv("HETZNER_AI_MODEL");

	const newDescription = `*Melee Weapon Attack:* +4 to hit, reach 5 ft., one target. *Hit:* 5 (1d6 + 2) slashing damage.`;



	const systemPrompt = `You are an automatic avrae automation generator.
You should respond only with the raw output automation in json format, no explanation or anything.

An example of some valid automation is:

\`\`\`
${examples[0].automation}
\`\`\`

which has this description:

\`${examples[0].description}\`.
`;

	const prompt = `
Now generate the automation for the following description:
\`${newDescription}\``
	const startTime = performance.now();

	const response = await fetch(API_URL, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${apiToken}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			model,
			messages: [
				{
					role: "system",
					content: systemPrompt
				},
				{
					role: "user",
					content: prompt
				}
			]
		})
	});

	const responseBody = await response.text();
	const responseTime = performance.now() - startTime;
	console.log(`Response time: ${responseTime.toFixed(0)} ms`);

	if (!response.ok) {
		throw new Error(`Hetzner Inference API returned ${response.status} ${response.statusText}:\n${responseBody}`);
	}

	try {
		const response = JSON.parse(responseBody);
		//console.dir(response, { depth: null });

		for (const choice of response.choices) {
			console.log(`Response ${choice.index}:`);
			console.log(JSON.parse(choice.message.content.trim()));
		}
	}
	catch {
		console.log(responseBody);
	}
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
