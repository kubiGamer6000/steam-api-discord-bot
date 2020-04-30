const botInfo = require('./bot.json');

///////////////////////////////// STEAM API

const SteamAPI = require('steamapi');
const steam = new SteamAPI(botInfo.steamToken);

//////////////////////////////// DEFINITION AND STARTUP

const Discord = require('discord.js');
const bot = new Discord.Client();

bot.on('ready', () => {
	const activity = '+getid | +getsummary <3';
	console.log(`Successfully logged in as ${bot.user.tag}`);
	bot.user.setActivity(activity).then(() => {
		console.log(`Set custom activity as '${activity}'`);
	});
});

//////////////////////////////// COMMAND API

class Command {
	constructor(prefix, name) {
		this.prefix = prefix;
		this.name = name;
	}

	onExecute(cb) {
		bot.on('message', (msg) => {
			if (msg.author.bot) return;
			// msg.author.id
			const cmd = `${this.prefix}${this.name}`.toLowerCase();
			if (msg.content.startsWith(cmd) || msg.content.startsWith(cmd + ' ')) {
				const args = msg.content.slice(cmd.length + 1).split(' ');
				// console.log(args);
				if (args.length <= 0) {
					cb(msg, false);
					return;
				} else {
					cb(msg, args);
					return;
				}
			} else {
				return;
			}
		});
	}
}

//////////////////////////////// COMMANDS

const getID = new Command(botInfo.prefix, 'getid');
const getSummary = new Command(botInfo.prefix, 'getSummary');

getID.onExecute((msg, args) => {
	const err = `Enter a valid Steam URL, ID or profile!`;
	if (args != false) {
		steam
			.resolve(args[0])
			.then((id) => {
				if (id.startsWith('7') && id.length == 17) {
					const idEmbed = new Discord.MessageEmbed()
						.setColor('#55efc4')
						.setTitle(id)
						.setURL(`http://steamcommunity.com/profiles/${id}`)
						.setDescription('SteamID64')
						.setTimestamp()
						.setFooter('Made with hate by Dolan with Node.js', 'https://i.imgur.com/G34P5co.png');
					msg.channel.send(idEmbed);
				} else msg.channel.send(err);
			})
			.catch(() => {
				msg.channel.send(err);
			});
	} else msg.channel.send(err);
});

getSummary.onExecute((msg, args) => {
	const err = `Enter a valid SteamID64!`;
	if (args != false) {
		steam
			.getUserSummary(args[0])
			.then((summary) => {
				// const profilePic = new Discord.MessageAttachment(summary.avatar.large);
				const summaryInfo = new Discord.MessageEmbed()
					.setColor('#0984e3')
					.setTitle(summary.steamID)
					.setURL(`http://steamcommunity.com/profiles/${summary.steamID}`)
					.setDescription('Steam info')
					.setThumbnail(summary.avatar.large)
					.addFields(
						{ name: 'Nickname', value: summary.nickname },
						{ name: 'SteamID64', value: summary.steamID },
						{ name: 'URL', value: summary.url }
					)
					.setTimestamp()
					.setFooter('Made with love with Node.js', 'https://i.imgur.com/G34P5co.png');
				msg.channel.send(summaryInfo);
			})
			.catch((error) => {
				console.log(error);
				msg.channel.send(err);
			});
	} else msg.channel.send(err);
});

//////////////////////////////// LOGIN

bot.login(botInfo.token).catch((err) => {
	throw new Error(err);
});
