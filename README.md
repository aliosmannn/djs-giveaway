# Djs Giveaway

[![discordBadge](https://img.shields.io/badge/Chat-Click%20here-7289d9?style=for-the-badge&logo=discord)](https://discord.gg/sBtF6bt4vC)
[![npm](https://img.shields.io/npm/v/djs-giveaway?style=for-the-badge)](https://www.npmjs.com/package/djs-giveaway)
[![npm](https://img.shields.io/npm/dt/djs-giveaway?style=for-the-badge)](https://www.npmjs.com/package/djs-giveaway)

# Features

⏱️ Easy to use!\
⚙️ Full configuration\
📁 Support for all databases! (default is json)\
🔄 Automatic restart after bot crash!

# Examples

<hr>

<div style="display: flex">
<img src="https://i.resimyukle.xyz/MG842H.png" width="250">
<img src="https://i.resimyukle.xyz/54BIyK.png" width="250">
</div>

<hr>

# Code Examples

⏱️ **Calling the module**

```typescript
const djsGiveaway = require("djs-giveaway");
const giveaway = new djsGiveaway(client);
```

**Giveaway Options**

```typescript
new djsGiveaway(client, {
    countdownUpdateInterval: 1000,
    reaction: "🎁",
    embed: {
        color: "BLUE"
    }
});
```

**Giveaway Start**

```typescript
giveaway.create({
    guildId: message.guild.id,
    channelId: message.channel.id,
    prize: "Test",
    duration: 10000,
    winnersCount: 1
});
```

**For role-specific raffle**

```javascript
giveaway.create({
    guildId: message.guild.id,
    channelId: message.channel.id,
    prize: "Test",
    duration: 10000,
    winnersCount: 1,
    rolesToParticipate: ["roleId"]
});
```

**Giveaway Edit**

```typescript
giveaway.edit(messageId, {prize: "Test v2", duration: 5000, winnersCount: 5});
```

**Giveaway Delete**

```typescript
giveaway.delete(messageId);
```

<hr>

⚙️ **We did not say full configuration for nothing**

```json
{
  "createEmbed": {
    "title": "Giveaway",
    "description": ":tada: Raffle started prize ",
    "footer": "• {{winnersCount}} Winners"
  },
  "countdownEmbed": {
    "title": "Giveaway",
    "description": ":partying_face: Giveaway finish reaming time {{reaming}}.\n:gift: Prize: **{{prize}}**",
    "footer": "• {{winnersCount}} Winners"
  },
  "finishEmbed": {
    "title": ":tada: The draw is over",
    "description": ":partying_face: Giveaway end.\n:military_medal: Winners {{winners}} won.\n:gift: Prize: **{{prize}}**",
    "footer": ""
  },
  "winner": ":military_medal: Winners {{winners}} won.\n\n:gift: Prize: {{prize}}",
  "noWinner": ":military_medal: Giveaway there was no winner.",
  "controllers": {
    "noRole": "You need {{roles}} roles to participate in the lottery."
  }
}
```