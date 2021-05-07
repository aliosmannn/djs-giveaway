const { MessageEmbed } = require('discord.js');
const humanizeDuration = require('humanize-duration');
const { scheduleJob } = require('node-schedule');

Array.prototype.unique = function() {

    return this.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });

}

String.prototype.replaceAll = function(find, replace) {

    return replaceAll(String(this), find, replace);

};

class Methods {

    constructor(data) {
        this.client = data.client;
        this.options = data.options;
        this.message = data.message;
        this.db = data.db;
        this.event = data;
    }

    async schedule(giveaway) {

        if (Date.now() > giveaway.finish) giveaway.finish = (Date.now() + 1000);

        scheduleJob(giveaway.messageId, new Date(giveaway.finish), async() => {

            if (giveaway.finish !== this.db.fetch(giveaway.messageId).finish) return;

            if (!this.db.has(giveaway.messageId)) return;

            const guild = this.client.guilds.cache.get(giveaway.guildId);

            const giveawayMessage = await guild.channels.cache.get(giveaway.channelId).messages.fetch(giveaway.messageId);
            if (!giveawayMessage) return;

            const winnerUsers = this.getWinner(giveaway, await giveawayMessage.reactions.cache.get(this.options.reaction || '🎉').users.fetch().then((user) => user.filter((x) => !x.bot)));
            const winners = winnerUsers.filter((user) => guild.members.cache.get(user)).map((user) => this.client.users.cache.get(user)).join(" ,");

            const desc = (winnerUsers.length === 0 ? this.message.noWinner : this.message.winner.replaceAll(["{{winners}}", "{{prize}}"], [winners, giveaway.prize]));

            const finishGiveaway = new MessageEmbed()
                .setTitle(this.message.finishEmbed.title)
                .setDescription(desc)
                .setColor(this.event.embedColor)
            await giveawayMessage.edit(finishGiveaway);
            await this.client.channels.cache.get(giveaway.channelId).send(desc);

            this.db.deleteEach(giveaway.messageId);
            this.event.emit("giveawayEnd", giveaway);

        });

    }

    showEndTime(giveaway) {

        const endInterval = setInterval(async() => {

            if (giveaway && this.db.has(giveaway.messageId)) {

                giveaway = this.db.fetch(giveaway.messageId);

                if (giveaway.finish < Date.now()) return clearInterval(endInterval);

                const giveawayMessage = await this.client.channels.cache.get(giveaway.channelId).messages.fetch(giveaway.messageId);
                const reaming = humanizeDuration((giveaway.finish - Date.now()), { round: true, messageuage: 'en' });

                const endTimeEmbed = new MessageEmbed()
                    .setTitle(this.message.countdownEmbed.title)
                    .setDescription(this.message.countdownEmbed.description.replaceAll(["{{reaming}}", "{{prize}}"], [reaming, giveaway.prize]))
                    .setFooter(this.message.countdownEmbed.footer.replaceAll(["{{winnersCount}}"], [giveaway.winnersCount]))
                    .setColor(this.event.embedColor)
                await giveawayMessage.edit(endTimeEmbed);
            }
        }, this.options.countdownUpdateInterval || 5000);

    }

    getWinner(giveaway, users) {

        if (users.size === 0) return [];

        let index = 0,
            winners = [];

        do {

            winners.push(users.random().id);

            ++index;
        } while (index < giveaway.winnersCount);

        return winners.unique();
    }


}

module.exports = Methods;