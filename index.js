const Discord = require('discord.js');
let client = new Discord.Client();

client.login(require('./token'));

client.on('ready', event => {
	console.log('ready');
})

function censor(censor) {
	var i = 0;
	return function(key, value) {
		if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) return '[Circular]'; 
		if(i >= 29) return '[Unknown]';
		++i;
		return value;
	}
}

client.on('message', message => {
	if(message.author.id === "186133252195483649" && /^\]eval .+/.test(message.content)) {
		message.channel.send({
			embed: {
				author: {
					name: client.user.username,
					icon_url: client.user.avatarURL,
					url: "https://megaxlr.net"
				},
				color: 0xeb66ff,
				title: "Eval working",
				description: `\`\`\`Please wait...\`\`\``,
			}
		}).then(reply => {
			try {
				let result = eval(message.content.substring(6));
				if(reply.editable) {
					reply.edit({
						embed: {
							author: {
								name: client.user.username,
								icon_url: client.user.avatarURL,
								url: "https://megaxlr.net"
							},
							color: 0x00FF00,
							title: "Eval Result",
							description: `\`\`\`json\n${JSON.stringify(result, censor(result), "\t")}\`\`\``,
						}
					});
				} else {
					message.channel.send({
						embed: {
							author: {
								name: client.user.username,
								icon_url: client.user.avatarURL,
								url: "https://megaxlr.net"
							},
							color: 0x00FF00,
							title: "Eval Result",
							description: `\`\`\`json\n${JSON.stringify(result, censor(result), "\t")}\`\`\``,
						}
					});
				}
			} catch(e) {
				if(reply.editable) {
					reply.edit({  
						embed: {
							author: {
								name: client.user.username,
								icon_url: client.user.avatarURL,
								url: "https://megaxlr.net"
							},
							color: 0xff0000,
							title: "Eval Error",
							description: `\`\`\`json\n${e}\`\`\``,
						}
					})
				} else {
					message.channel.send({  
						embed: {
							author: {
								name: client.user.username,
								icon_url: client.user.avatarURL,
								url: "https://megaxlr.net"
							},
							color: 0xff0000,
							title: "Eval Error",
							description: `\`\`\`json\n${e}\`\`\``,
						}
					});
				}
			}
		});
	} else if(message.content === "]invite") {
		message.channel.send({
			embed: {
				author: {
					name: client.user.username,
					icon_url: client.user.avatarURL,
					url: "https://megaxlr.net"
				},
				title: `Add **${client.user.username}** to your own server`,
				url: "https://discordapp.com/oauth2/authorize?client_id=385080141941964810&scope=bot",
				description: `Click the link to add **${client.user.username}** to your server`,
				color: 0xeb66ff
			}
		})
	} else if(message.author.id === "186133252195483649" && /.*<@385080141941964810>.*/.test(message.content)) {
		message.channel.send("Stop tagging me!");
	} else if (message.author.id === "186133252195483649" && message.content === "]leave") {
		message.channel.send({
			embed: {
				author: {
					name: client.user.username,
					icon_url: client.user.avatarURL,
					url: "https://megaxlr.net"
				},
				title: `Goodbye :blue_heart: (click to re-add)`,
				url: "https://discordapp.com/oauth2/authorize?client_id=385080141941964810&scope=bot",
				description: `Thank you for using ${client.user.username}`,
				footer: {
					text: `Leaving server`
				},
				color: 0x5dadec
			}
		})
		if(message.guild.id != "246702404689461250") message.guild.leave();
	}
});