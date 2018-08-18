const settings = require('./settings.json');
var CommandsFolder = "./onCommands/";
const discord = require('discord.js');
const client = new discord.Client();
client.commands = new discord.Collection();
client.aliases = new discord.Collection();

const fs = require('fs');
const moment = require('moment');

const reqEvent = (event) => require(`./onData/${event}`)

client.on('ready', () => reqEvent('readyEvent')(client));
client.on('guildDelete', () => reqEvent('guildDelete')(client));
client.on('guildCreate', () => reqEvent('guildCreate')(client));
client.on("message", reqEvent("messageEvent"));

client.reload = command => {
    return new Promise((resolve, reject) => {
      try {
        delete require.cache[require.resolve(`${CommandsFolder}${command}`)];
        let cmd = require(`${CommandsFolder}${command}`);
        client.commands.delete(command);
        client.aliases.forEach((cmd, alias) => {
          if (cmd === command) client.aliases.delete(alias);
        });
        client.commands.set(command, cmd);
        cmd.conf.aliases.forEach(alias => {
          client.aliases.set(alias, cmd.help.name);
        });
        resolve();
      } catch (e){
        console.log(e)
      }
    });
};

client.sendMessage = async function (Message, recievedData) {
  let toSend = {
      channelSend: false,
      userSend: false,
      guildSend: false,
      beforeSay: "",
      color: 0xff0000,
      title: "No title",
      description: "No description",
      author: {
          name: Message.author.tag,
          iconURL: Message.author.displayAvatarURL,
      },
  };

  if (recievedData.beforeSay) { toSend.beforeSay = recievedData.beforeSay }
  if (recievedData.color) { toSend.color = recievedData.color };
  if (recievedData.title) { toSend.title = recievedData.title };
  if (recievedData.description) { toSend.description = recievedData.description };
  if (recievedData.author) { toSend.author = recievedData.author };

  if (recievedData.guildSend) { toSend.guildSend = recievedData.guildSend };
  if (recievedData.userSend) { toSend.userSend = recievedData.userSend };
  if (recievedData.channelSend) { toSend.channelSend = recievedData.channelSend };

  try {
      if ( toSend.userSend ) {
          return await Message.guild.members.get(toSend.userSend).send(toSend.beforeSay, {
            embed: {
          author: toSend.author,
          color: toSend.color,
          title: toSend.title,
          description: toSend.description,
          timestamp: new Date(),
        }
    });
      };
      if ( toSend.channelSend ) {
        return await Message.guild.channels.get(toSend.channelSend).send(toSend.beforeSay, {
            embed: {
          author: toSend.author,
          color: toSend.color,
          title: toSend.title,
          description: toSend.description,
          timestamp: new Date(),
        }
    });
      };
      if ( toSend.guildSend ) {
        return await client.channels.get(toSend.guildSend).send(toSend.beforeSay, {
            embed: {
          author: toSend.author,
          color: toSend.color,
          title: toSend.title,
          description: toSend.description,
          timestamp: new Date(),
        }
    });

      };

    return await Message.channel.send(toSend.beforeSay, {
        embed: {
      author: toSend.author,
      color: toSend.color,
      title: toSend.title,
      description: toSend.description,
      timestamp: new Date(),
    }
});
  } catch(e) {
  console.error(e);
  }
}

client.elevation = msg => {
    let permlvl = 0;
    if (msg.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) permlvl = 1;
    if (msg.member.hasPermission("KICK_MEMBERS")) permlvl = 2;
    if (msg.member.hasPermission("BAN_MEMBERS")) permlvl = 3;
    if (msg.member.hasPermission("ADMINISTRATOR")) permlvl = 4;
    if (msg.member.id === "476764729919143948") permlvl = 10;
    if (msg.member == null) permlvl = 0;
    return permlvl;
  };

  fs.readdir(`${CommandsFolder}`, (err, files) => {
    if (err) console.error(err);
    files.forEach(f => {
      let props = require(`${CommandsFolder}${f}`);
      client.commands.set(props.help.name, props);
      props.conf.aliases.forEach(alias => {
          client.aliases.set(alias, props.help.name);
      });
    });
  });

client.login(settings.token)
