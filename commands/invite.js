const { MessageEmbed } = require("discord.js");

exports.run = async (client, message) => {
  message.channel.send(
    new MessageEmbed()
      .setAuthor(
        "Invite Me",
        "https://img.icons8.com/ultraviolet/2x/email-open--v2.gif"
      )
      .setColor("BLUE")
      .setTimestamp()
      .addField("Please note that this bot is made especially for Eagle discord and contains details related to Eagle minecraft however you can fell free to invite it to your server.")
      .setDescription(
        "https://discord.com/oauth2/authorize?client_id=" +
          client.user.id +
          "&permissions=" +
          "37080128" +
          "&scope=" +
          "bot"
          
      )
  );
};
