const {Client} = require("discord.js");
const bot = new Client();

const djsGiveaway = require("./index");
const giveaway = new djsGiveaway(bot, {
    countdownUpdateInterval: 1000,
    reaction: "795726782484578334",
    embed: {
        color: "#fffff"
    }
});

bot.on("ready", () => {
    console.log("bot online!")
});

bot.on("message", (message) => {


    if (message.author.bot) return;

    if (message.content === "kur") {

        giveaway.create({
            guildId: message.guild.id,
            channelId: message.channel.id,
            prize: "test",
            duration: 10000,
            winnersCount: 1
        })

    }

});

bot.login("NzIyODQ4ODczOTQwMjU0Nzgw.XupDeQ.UYGxFBdfh4_fq-mrSujMvWkuu4A");