const humanizeDuration = require('humanize-duration');
const { MessageEmbed } = require('discord.js');

const Controllers = require('./Controller');
const Methods = require('./Methods');

const replaceAll = require('replace-once');

const { EventEmitter } = require('events');
const { Database } = require('sileco.db');

const { readFileSync } = require('fs');
const { copySync } = require('fs-extra');

const { join } = require('path');

String.prototype.replaceAll = function(find, replace) {

    return replaceAll(String(this), find, replace);

};

class Giveaway extends EventEmitter {

    constructor(client, options = { countdownUpdateInterval: 5000, reaction: '🎉', embed: {color: "RED"} }) {
        super();
        this.client = client;
        this.client.giveaways = [];
        this.options = options;

        this.message = this.messages;
        this.db = new Database('giveaways.json');
        this.methods = new Methods(this);
        this.controllers = new Controllers(this);

    }

    get messages() {

        try {

            return JSON.parse(readFileSync('./giveawayMessages.json', 'utf-8'));

        } catch (err) {

            if (err.code === 'ENOENT') {

                copySync(join(__dirname, '/Messages/default.json'), './giveawayMessages.json');
                return JSON.parse(readFileSync('./giveawayMessages.json', 'utf-8'));

            } else {

                copySync('./giveawayMessages.json', './oldGiveawayMessages.json');
                copySync(join(__dirname, '/Messages/default.json'), './giveawayMessages.json');

                return JSON.parse(readFileSync('./giveawayMessages.json', 'utf-8'));

            }

        }

    }

    get reaction() {

        return this.options.reaction ? this.options.reaction : "🎉"

    }

    get embedColor() {

        if (this.options.embed && this.options.embed.color) return this.options.embed.color;
        else return "RED";


    }

    async create(giveaway) {

        if (!giveaway.guildId) throw new Error("You did not specify a server id");
        if (!giveaway.channelId) throw new Error("You did not specify a channel id");
        if (!giveaway.duration) throw new Error("You did not specify a duration");
        if (!giveaway.prize) throw new Error("You did not specify a prize");

        if (!giveaway.winnersCount) giveaway.winnersCount = 1;

        this.emit('giveawayCreate', (giveaway));

        const guild = this.client.guilds.cache.get(giveaway.guildId);
        const channel = guild.channels.cache.get(giveaway.channelId);

        const giveawayEmbed = new MessageEmbed()
            .setTitle(this.message.createEmbed.title)
            .setDescription(this.message.createEmbed.description.replaceAll(["{{prize}}"], [giveaway.prize]))
            .setFooter(this.message.createEmbed.footer.replaceAll(["{{winnersCount}}"], [giveaway.winnersCount]))
            .setColor(this.embedColor)
        const giveawayMsg = await channel.send(giveawayEmbed);
        await giveawayMsg.react(this.reaction);

        giveaway = {
            ...giveaway,
            messageId: giveawayMsg.id,
            start: Date.now(),
            finish: (Date.now() + giveaway.duration)
        }

        this.db.set(giveaway.messageId, giveaway);

        await this.methods.schedule(giveaway);
        this.methods.showEndTime(giveaway);

    }

    delete(messageId) {

        if (!messageId) throw new Error("you did not specify the ID of the message");

        const giveaway = this.db.fetch(messageId);

        if (giveaway) {

            this.db.deleteEach(giveaway.messageId);
            this.emit('giveawayEnd', giveaway);

            this.client.channels.cache.get(giveaway.channelId).messages.fetch(giveaway.messageId).then(async (message) => await message.delete()).catch(() => { return false; });

        }

        return giveaway;

    }

    edit(messageId, options) {

        if (!messageId) throw new Error("you did not specify the ID of the message");
        if (!options && options === "{}") throw new Error("You must specify an option in the object");

        const getGiveaway = this.db.fetch(messageId);

        if (getGiveaway) {

            const giveaway = {
                ...getGiveaway,
            }

            if (options.newMembersCount) giveaway.winnersCount = Number(options.newMembersCount);
            if (options.newPrize) giveaway.prize = options.newPrize;
            if (options.addedDuration) {
                giveaway.finish += options.addedDuration;
            }

            this.db.set(messageId, giveaway);
            this.methods.schedule(giveaway);

            return true;

        } else return false;

    }

}

module.exports = Giveaway;