const Discord = require('discord.js'),
	client = new Discord.Client(),
	config = require('./config.json');
const {inspect} = require('util');

let owner, results={},resultIndexes=[];
let messageMaxLength = 1000;
class Result {
	constructor(input, output, message, title) {
		this.message = message;
		this.output = output;
		this.input = input;
		this.title = title;
		this.index = 0;
		this.color = 0x00FF00;
	}
	setTitle(value) {
		return this.title = value;
	}
	setColor(value) {
		return this.color = value;
	}
	setMessage(value) {
		return this.message = value;
	}
	setOutput(value) {
		return this.output = value;
	}
	setInput(value) {
		return this.input = value;
	}
	setIndex(value) {
		return this.index = value;
	}

	addIndex() {
		return ++this.index;
	}

	removeIndex() {
		if(this.index<1) this.index=1; // Set to 0 if it goes below.
		return --this.index;
	}

	getMessage() {
		return this.message;
	}
	getInput() {
		return this.input;
	}
	getOutput() {
		return this.output;
	}

	getColor() {
		return this.color;
	}

	toJsonEmbed() {
		let output = inspect(this.output, {
			depth: 3
		});
		let embed = {
			embed: {
				author: {
					name: client.user.username,
					icon_url: client.user.avatarURL,
					url: "https://megaxlr.net"
				},
				fields: [
					{
						name: "Input",
						value: `\`${this.input.substring(6)}\``,
						inline: true,
					}
				],
				color: this.color,
				title: this.title,
				description: `***Output***\`\`\`js\n${output.substring(0+(this.index*messageMaxLength), messageMaxLength*(this.index+1))}\`\`\``,
			}
		}
		if(output.length>messageMaxLength) {
			embed.embed.fields.push({
						name: "Page",
						value: `\`${this.index}/${Math.ceil(output.length/messageMaxLength)}\``,
						inline: true,
					})
		}
		return embed;
	}
}

async function addReactions(res) {
	console.log(inspect(res.getOutput(), {depth: 3}).length > messageMaxLength);
	if(inspect(res.getOutput(), {depth: 3}).length > messageMaxLength) {	
		res.getMessage().react('◀').then(() => {
			res.getMessage().react('⏹').then(() => {
				res.getMessage().react('▶');
			});
		});
	} else {
		res.getMessage().react('⏹');
	}
}

async function saveMessage(result) {
	if(resultIndexes.length>10) {
		delete results[resultIndexes.shift()];
	}
	results[result.getMessage().id] = result;
	resultIndexes.push(result.getMessage().id);
}

async function nextPage(res) {
	res.addIndex();
	res.message.edit(res.toJsonEmbed());
}

async function prevPage(res) {
	res.removeIndex();
	res.getMessage().edit(res.toJsonEmbed());
}
client.login(config.token);

client.on('ready', event => {
	console.log(`ready (${client.user.username})`);
	client.fetchUser(config.owner).then(user => {
		owner = user;
	});
});

function errorembed(obj, input) {
	let result = new Result(input, obj, null, 'Eval Error');
	result.setColor(0xFF0000);
	let embed = result.toJsonEmbed();
	embed.embed.description.replace('js', 'css');
	return embed;
}

client.on('message', message => {
	if (message.author.id === config.owner && /^\]eval .+/.test(message.content)) {
		let working = new Result(message.content, "Please wait...", message, "Eval working");
		working.setColor(0xEB66FF);
		message.channel.send(working.toJsonEmbed())
			.then(reply => {
				try {
					let g = message.guild, // Shorthands
						u = message.author,
						c = message.channel,
						m = message;
					let result = new Result(message.content, eval(message.content.substring(6)), reply, "Eval Result");
					if (reply.editable) {
						reply.edit(result.toJsonEmbed()).then(() => {
							addReactions(result);
							saveMessage(result);
						});
					}
				} catch (e) {
					if (reply.editable) {
						reply.edit(errorembed(e, message.content))
					} else {
						message.channel.send(errorembed(e, message.content));
					}
				}
			});
	} else if (message.content === "]invite") {
		message.channel.send({
			embed: {
				author: {
					name: client.user.username,
					icon_url: client.user.avatarURL,
					url: "https://megaxlr.net"
				},
				title: `Add **${client.user.username}** to your own server`,
				url: `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot`,
				description: `Click the link to add **${client.user.username}** to your server`,
				color: 0xeb66ff
			}
		})
	} else if (message.author.id === config.owner && message.content.includes(`<@${client.user.id}>`))	
		message.channel.send("Stop tagging me!");
	else if (message.author.id === config.owner && message.content === `]leave`) {
		message.channel.send({
			embed: {
				author: {
					name: client.user.username,
					icon_url: client.user.avatarURL,
					url: "https://megaxlr.net"
				},
				title: `Goodbye :blue_heart: (click to re-add)`,
				url: `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot`,
				description: `Thank you for using ${client.user.username}`,
				footer: {
					text: `Leaving server`,
				},
				color: 0x5dadec,
			}
		});
		if (message.guild.id != config.guild) message.guild.leave();
	}
});

client.on('messageReactionAdd', function (mr, user) {
	let message = mr.message,
		emoji = mr.emoji;
	if(resultIndexes.indexOf(message.id)>-1 && user === owner) {
		if(emoji.name === '▶')			nextPage(results[message.id]);
		else if(emoji.name === '◀')		prevPage(results[message.id]);
		else if (emoji.name === '⏹') 	{
			delete resultIndexes[resultIndexes.indexOf(message.id)];
			delete results[message.id];
			message.edit({
				embed: {
					footer: {
						text: 'Removed',
					},
				}
			});
			mr.remove();
		}
		mr.remove(user);
	}
});

client.on('debug', console.log);