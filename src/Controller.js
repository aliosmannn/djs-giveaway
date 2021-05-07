class Controller {

    constructor(data) {
        this.client = data.client;
        this.methods = data.methods;
        this.message = data.message;
        this.db = data.db;

        this.client.on('ready', () => {

            const giveaways = this.db.fetchAllData();

            (Object.values(giveaways)).forEach((giveaway) => {

                this.methods.showEndTime(giveaway);
                this.methods.schedule(giveaway);

            });

        });

        this.client.on('raw', async(data) => {

            switch (data.t) {
                case 'MESSAGE_REACTION_ADD':
                    await this.messageReactionAdd(data.d);
                    break;
            }

        });

    }

    async messageReactionAdd({ user_id, message_id, member, emoji, channel_id, guild_id }) {

        const user = this.client.users.cache.get(user_id);
        if (user && user.bot) return;

        const giveaways = Object.entries(this.db.fetchAllData());
        const giveaway = giveaways.find((giveaway) => giveaway[0] === message_id);

        if (giveaway) {

            const guild = this.client.guilds.cache.get(guild_id);
            const channel = guild.channels.cache.get(channel_id);
            const message = channel.messages.fetch(message_id);

            if (giveaway[1].rolesToParticipate && giveaway[1].rolesToParticipate.length >= 1 && !member.roles.some((role) => giveaway[1].rolesToParticipate.includes(role))) {

                message.then(msg => msg.reactions.resolve(emoji.id ? emoji.id : emoji.name).users.remove(user_id));

                try {
                    user.send(this.message.controllers.noRole.replaceAll(["{{roles}}"], [giveaway[1].rolesToParticipate.map((role) => guild.roles.cache.get(role).name).join(" ")]));
                } catch {
                    console.log(`Participation roles of '${giveaway[0]}' lottery have been deleted`);
                }
            }
        }

    }
}

module.exports = Controller;