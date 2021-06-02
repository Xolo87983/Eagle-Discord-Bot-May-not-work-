const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
const Discord = require('discord.js');
const client = new Discord.Client({partials: ["MESSAGE", "USER", "REACTION"]});
const enmap = require('enmap');
const config = require('./config.json');
const fs = require("fs");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./scores.sqlite');
client.config = config;
client.queue = new Map();

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    console.log(`[Command Manager]: Loading Command ${commandName}`);
    client.commands.set(commandName, props);
  });
});

const settings = new enmap({
    name: "settings",
    autoFetch: true,
    cloneLevel: "deep",
    fetchAll: true
});

client.on('ready', () => {
    console.log('ready')
    client.user.setActivity('Eagle Mc | &help', { type: 'WATCHING' });
});

client.on('message', async message => {
    if(message.author.bot) return;
    if(message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command == "ticket-setup") {
        // ticket-setup #channel

        let channel = message.mentions.channels.first();
        if(!channel) return message.reply("Usage: `&ticket-setup #channel`");

        let sent = await channel.send(new Discord.MessageEmbed()
            .setTitle(message.guild)
            .setDescription("React 🎫 to open a ticket!")
            .setFooter(`Bot By Xolo`, client.user.displayAvatarURL())
            
            .setColor("00ff00")
        );

        sent.react('🎫');
        settings.set(`${message.guild.id}-ticket`, sent.id);

        message.channel.send("Ticket System Setup Done!")
    }

    if(command == "close") {
        if(!message.channel.name.includes("ticket-")) return message.channel.send("You cannot use that here!")
        message.channel.delete();
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if(user.partial) await user.fetch();
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();

    if(user.bot) return;

    let ticketid = await settings.get(`${reaction.message.guild.id}-ticket`);

    if(!ticketid) return;

    if(reaction.message.id == ticketid && reaction.emoji.name == '🎫') {
        reaction.users.remove(user);

        reaction.message.guild.channels.create(`ticket-${user.username}`, {
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                },
                {
                    id: reaction.message.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                }
            ],
            type: 'text'
        }).then(async channel => {
            channel.send(`<@${user.id}>`, new Discord.MessageEmbed().setTitle("Welcome to your ticket!").setDescription("We will be with you shortly").setColor("00ff00"))
        })
    }
});


client.on("ready", () => {
  console.log("Loaded up!");
});

client.on("message", message => {
  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "help") {
    const helpEmbed = new Discord.MessageEmbed()
      .setTitle(`${client.user.username}'s commands`)
      .setDescription(`**Prefix:** ${config.prefix}`)
      .addField(`\`ping\``, `Check the bot's ping`)
      .addField(`\`rps\``, `Play rock paper scissors`)
      .addField(`\`say\``, `Have the bot say something`)
      .addField(`\`ip\``, `Provides the ip of the server`)
      .addField(`\`mc-status\``, `Provides the current status of mc server which is manually updated by the developer and can be false`)
      .addField(`\`server-info\``, `Provides the name of the guild of the server`)
      .addField(`\`user-info\``, `Provides the information of the user`)
      .addField(`\`bot-info\``, `Provides the information of the developer and owner of bot`)
      .addField(`\`learn\``, `Provides the best website which can easily teaches all types of programming with the help of examples and explanation`)
      .addField(`\`java\``, `Provides the best online java compiler which can be used for java coding purpose`)
      .addField(`\`help-music\``, `Provides the commands available for music`)
      .addField(`\`help-mod\``, `Provides the commands available for moderators and admins`)
      .addField(`\`help-level\``, `Provides the commands avaialable for levelling`)
      message.channel.send(helpEmbed);
  }


if (command === "help-mod") {
    const helpEmbed = new Discord.MessageEmbed()
      .setTitle(`${client.user.username}'s commands`)
      .setDescription(`**Prefix:** ${config.prefix}`)
      .addField(
        `\`kick\``,
        `Usage: **${config.prefix}kick [@User]**\n**${config.prefix}kick [@User][Reason]**`
      )
      .addField(
        `\`ban\``,
        `Usage: **${config.prefix}ban [@User]**\n**${config.prefix}ban [@User][Reason]**`
      )
      .addField(
        `\`add\``,
        `Adds a role to a user \nUsage: **${config.prefix}add [@User] [Role]**`
      )
      .addField(
        `\`remove\``,
        `Removes a role from a user \nUsage: **${config.prefix}remove [@User] [Role]**`
      )
      .addField(
        `\`purge\``,
        `Clears a number of messages between 2 or 100 \nUsage: **${config.prefix}purge [number]**`
      )
     message.channel.send(helpEmbed);
  }

if (command === "help-music") {
    const helpEmbed = new Discord.MessageEmbed()
      .setTitle(`${client.user.username}'s commands`)
      .setDescription(`**Prefix:** ${config.prefix}`)
      .addField(`\`connect\``, `Join a voice channel you are in`)
      .addField(`\`disconnect\``, `Leaves the voice channel you are in`)
      .addField(`\`play <song name or url>\``, `Plays the song mentioned`)
      .addField(`\`pause\``, `Pauses the current song`)
      .addField(`\`resume\``, `Resumes the paused song`)
      .addField(`\`queue\``, `Shows the song queue of the server`)
      .addField(`\`skip\``, `Skips to next song in the queue`)
      .addField(`\`skipto <Target number>\``, `Multiple skips until to the target`)
      .addField(`\`stop\``, `Stops the song and clears the queue`)
      .addField(`\`volume <volume count or none>\``, `Changes the volume of song`)
      .addField(`\`np\``, ` See now playing song`)
      .addField(`\`lyrics\``, `Provides the lyrics of the song playing currently`)
      .addField(`\`shuffle\``, `Shuffle and randomize the queue`)
      .addField(`\`invite\``, `Get invite link for this bot,Warn this bot is specially made for Eagle discord and thus contains commands mainly for Eagle discord`)
      .addField(`\`loop\``, `Enable / disable loop for the currently playing song`)
      .addField(`\`remove <Target number>\``, `Remove a song from the queue`)
      message.channel.send(helpEmbed);
  }
  
if (command === "help-level") {
    const helpEmbed = new Discord.MessageEmbed()
      .setTitle(`${client.user.username}'s commands`)
      .setDescription(`**Prefix:** ${config.prefix}`)
      .addField(`\`points\``, `Shows your current points`)
    .addField(`\`leaderboard\``, `Shows the leaderboard of the server`)
    .addField(`\`give\``, `Used for giving points to members and can be only used by admins and owners`);
    message.channel.send(helpEmbed);
  }

  if (command === "ping") {
    const helpEmbed = new Discord.MessageEmbed()
    message.channel.send(
      `Bot Ping **(${Date.now() - message.createdTimestamp}ms)**`
    );
  }

  if (command === "kick") {
    if (!message.member.hasPermission("KICK_MEMBERS"))
      return message.channel
        .send("Insufficient permissions (Requires permission `Kick members`)")
        .then(msg => {
          msg.delete({ timeout: 30000 });
        });
    const member = message.mentions.members.first();
    if (!member)
      return message.channel.send("You have not mentioned a user").then(msg => {
        msg.delete({ timeout: 30000 });
      });
    if (!member.kickable)
      return message.channel.send("This user is unkickable").then(msg => {
        msg.delete({ timeout: 30000 });
      });
    const reason = args.slice(1).join(" ");
    if (member) {
      if (!reason)
        return member.kick().then(member => {
          message.channel.send(
            `${member.user.tag} was kicked, no reason was provided`
          );
        });

      if (reason)
        return member.kick().then(member => {
          message.channel.send(`${member.user.tag} was kicked for ${reason}`);
        });
    }
  }

  if (command === "ban") {
    if (!message.member.hasPermission("BAN_MEMBERS"))
      return message.channel
        .send("Insufficient permissions (Requires permission `Ban members`)")
        .then(msg => {
          msg.delete({ timeout: 30000 });
        });
    const member = message.mentions.members.first();
    if (!member)
      return message.channel.send("You have not mentioned a user").then(msg => {
        msg.delete({ timeout: 30000 });
      });
    if (!member.bannable)
      return message.channel.send("This user is unbannable").then(msg => {
        msg.delete({ timeout: 30000 });
      });
    const reason = args.slice(1).join(" ");
    if (member) {
      if (!reason)
        return member.ban().then(member => {
          message.channel.send(
            `${member.user.tag} was banned, no reason was provided`
          );
        });

      if (reason)
        return member.ban(reason).then(member => {
          message.channel.send(`${member.user.tag} was banned for ${reason}`);
        });
    }
  }

  if (command === "add") {
    if (!message.member.hasPermission("MANAGE_ROLES"))
      return message.channel
        .send("Insufficient permissions (Requires permission `Manage roles`)")
        .then(msg => {
          msg.delete({ timeout: 30000 });
        });
    const member = message.mentions.members.first();
    if (!member)
      return message.channel.send("You have not mentioned a user").then(msg => {
        msg.delete({ timeout: 30000 });
      });
    const add = args.slice(1).join(" ");
    if (!add)
      return message.channel.send("You have not specified a role").then(msg => {
        msg.delete({ timeout: 30000 });
      });
    const roleAdd = message.guild.roles.cache.find(role => role.name === add);
    if (!roleAdd)
      return message.channel.send("This role does not exist").then(msg => {
        msg.delete({ timeout: 30000 });
      });
    if (member.roles.cache.get(roleAdd.id))
      return message.channel
        .send(`This user already has the ${add} role`)
        .then(msg => {
          msg.delete({ timeout: 30000 });
        });
    member.roles.add(roleAdd.id).then(member => {
      message.channel.send(`${add} added to ${member.displayName}`);
    });
  }

  if (command === "remove") {
    if (!message.member.hasPermission("MANAGE_ROLES"))
      return message.channel
        .send("Insufficient permissions (Requires permission `Manage roles`)")
        .then(msg => {
          msg.delete({ timeout: 30000 });
        });
    const member = message.mentions.members.first();
    if (!member)
      return message.channel.send("You have not mentioned a user").then(msg => {
        msg.delete({ timeout: 30000 });
      });
    const remove = args.slice(1).join(" ");
    if (!remove)
      return message.channel.send("You have not specified a role").then(msg => {
        msg.delete({ timeout: 30000 });
      });
    const roleRemove = message.guild.roles.cache.find(
      role => role.name === remove
    );
    if (!roleRemove)
      return message.channel.send("This role does not exist").then(msg => {
        msg.delete({ timeout: 30000 });
      });
    if (!member.roles.cache.get(roleRemove.id))
      return message.channel
        .send(`This user does not have the ${remove} role`)
        .then(msg => {
          msg.delete({ timeout: 30000 });
        });
    member.roles.remove(roleRemove.id).then(member => {
      message.channel.send(`${remove} removed from ${member.displayName}`);
    });
  }

  if (command === "say") {
    const text = args.join(" ");
    if (!text)
      return message.channel
        .send("You have not specified something to say")
        .then(msg => {
          msg.delete({ timeout: 30000 });
        });
    message.channel.send(text);
  }

  if (command === "purge") {
    if (!message.member.hasPermission("MANAGE_MESSAGES"))
      return message.channel
        .send(
          "Insufficient permissions (requires permission `Manage messages`)"
        )
        .then(msg => {
          msg.delete({ timeout: 30000 });
        });
    const number = args.join(" ");
    if (!number)
      return message.channel
        .send("You haven't specified a number to purge")
        .then(msg => {
          msg.delete({ timeout: 30000 });
        });
    message.channel.bulkDelete(number).catch(console.error);
  }

  if (command === "rps") {
    const options = [
      "rock :shell: ",
      "paper :newspaper2:",
      "scissors :scissors: "
    ];
    const option = options[Math.floor(Math.random() * options.length)];
    message.channel.send(`You got ${option}`);
    }
  if (command === "ip") {
    message.channel.send("survial server-[de12.falix.gg:26383]    ;    skyblock server-[de13falixgg26169]")
                                           
  }
  
  if (command === "mc-status") {
    message.channel.send("Currently updating spawn.Please note that this message is updated manually by my developer so it might not give the correct information")
  }
  
  
if (command === "server-info") {
message.channel.send(`This server's name is: ${message.guild.name}`);
}

if (command === "user-info") {
message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
}  

if (command === "bot-info") {
    message.channel.send("This bot is created and owned by Xolo#0977")
}
 
if (message.content.startsWith(config.prefix + "announce")) {
    // reading content to be announced
    let announcemessage = message.content.match(/(?<=announce ).*$/)[0];
    let finalmessage = announcemessage.toUpperCase();

    console.log(announcemessage);
    
    // the embed 
    const announceEmbed = new Discord.RichEmbed()
      .setColor("#ff1233")
      .setTitle("Announcement!")
      .setDescription("@everyone, " + finalmessage);
      // add more embed configs if you like
    message.channel.send(announceEmbed);
  }
  
  if (command === "learn") {
    message.channel.send("https://www.w3schools.com/html/default.asp")
}
  if (command === "java") {
    message.channel.send("https://www.tutorialspoint.com/compile_java_online.php")
}
 

 if (command === "av") {
   let user = message.mentions.users.first();
   if(!user) user = message.author;
   let color = message.member.displayHexColor;
   if (color == '#000000') color = message.member.hoistRole.hexColor;
   const embed = new Discord.RichEmbed()
                   .setImage(user.avatarURL)
                   .setColor(color)
    message.channel.send({embed});
  

 }



  
  
  
});



client.on("ready", () => {
  // Check if the table "points" exists.
  const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
  if (!table['count(*)']) {
    // If the table isn't there, create it and setup the database correctly.
    sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER);").run();
    // Ensure that the "id" row is always unique and indexed.
    sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }

  // And then we have two prepared statements to get and set the score data.
  client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
  client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);");
});

client.on("message", message => {
  if (message.author.bot) return;
  let score;
  if (message.guild) {
    score = client.getScore.get(message.author.id, message.guild.id);
    if (!score) {
      score = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, points: 0, level: 1 }
    }
    score.points++;
    const curLevel = Math.floor(0.1 * Math.sqrt(score.points));
    if(score.level < curLevel) {
      score.level++;
      message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
    }
    client.setScore.run(score);
  }
  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Command-specific code here!
  if(command === "points") {
  return message.reply(`You currently have ${score.points} points and are level ${score.level}!`);
}

if(command === "give") {
  // Limited to guild owner - adjust to your own preference!
  if(!message.author.id === message.guild.owner) return message.reply("You're not the boss of me, you can't do that!");

  const user = message.mentions.users.first() || client.users.cache.get(args[0]);
  if(!user) return message.reply("You must mention someone or give their ID!");

  const pointsToAdd = parseInt(args[1], 10);
  if(!pointsToAdd) return message.reply("You didn't tell me how many points to give...")

  // Get their current points.
  let userscore = client.getScore.get(user.id, message.guild.id);
  // It's possible to give points to a user we haven't seen, so we need to initiate defaults here too!
  if (!userscore) {
    userscore = { id: `${message.guild.id}-${user.id}`, user: user.id, guild: message.guild.id, points: 0, level: 1 }
  }
  userscore.points += pointsToAdd;

  // We also want to update their level (but we won't notify them if it changes)
  let userLevel = Math.floor(0.1 * Math.sqrt(score.points));
  userscore.level = userLevel;

  // And we save it!
  client.setScore.run(userscore);

  return message.channel.send(`${user.tag} has received ${pointsToAdd} points and now stands at ${userscore.points} points.`);
}

if(command === "leaderboard") {
  const top10 = sql.prepare("SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;").all(message.guild.id);

    // Now shake it and show it! (as a nice embed, too!)
  const embed = new Discord.MessageEmbed()
    .setTitle("Leaderboard")
    .setAuthor(client.user.username, client.user.avatarURL())
    .setDescription("Our top 10 points leaders!")
    .setColor(0x00AE86);

  for(const data of top10) {
    embed.addFields({ name: client.users.cache.get(data.user).tag, value: `${data.points} points (level ${data.level})` });
  }
  return message.channel.send({embed});
}

});



client.login("");
