const {CommandInteraction, Client, MessageEmbed, MessageActionRow, MessageButton} = require('discord.js')
const sf = require("seconds-formater");
const axios = require('axios')
module.exports = {
    name: 'nowplaying',
    description: 'Shows the current song playing',

    run:async (client, interaction) => {

    try{
        const vc = interaction.member.voice.channel

        if(!vc) return interaction.followUp({content:'Must be in VC to use command'})

        let queue = client.player.getQueue(interaction.guild.id);
        if(!queue) return interaction.followUp({content:`No Songs Playing in ${vc}`})
        
        const song = queue.nowPlaying
        const progressbar = queue.createProgressBar()

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('pause')
                .setLabel('⏸')
                .setStyle('PRIMARY')
                .setDisabled(false),
            new MessageButton()
                .setCustomId('resume')
                .setLabel('▶')
                .setStyle('PRIMARY')
                .setDisabled(false),
            new MessageButton()
                .setCustomId('skip')
                .setLabel('⏭')
                .setStyle('PRIMARY')
                .setDisabled(false),

        )


        const channel = client.channels.cache.get(interaction.channelId)
        const filter = (interaction) => {
            if(interaction.user.id) return true;

            return interaction.reply({content:'You cannot use this button'})
        }

        const collector = channel.createMessageComponentCollector({
            filter: filter,
            max: 1
        })


        collector.on("end", (ButtonInteraction) => {
            const id = ButtonInteraction.first().customId

            if(id == "pause") {

                queue.setPaused(true);
            }
            else if(id == "resume") {
                queue.setPaused(false);
            }
        })


        let total = song.milliseconds;
        let stream = queue.connection.player._state.resource.playbackDuration;


        let seconds = Math.floor(stream / 1000);
        if (seconds === 86400) {
            time = sf.convert(seconds).format("D day");
          } else if (seconds >= 3600) {
            time = sf.convert(seconds).format("H:MM:SS");
          } else {
            time = sf.convert(seconds).format("M:SS");
          }

          const newname = song.name.replace(/ *\([^)]*\) */g, "");

          let image = " "

          axios({
            method: 'get',
            url: `https://v1.nocodeapi.com/endofle/spotify/IUKwQtzrULSFKxMf/search?q=${newname}`, 
            params: {},
        }).then(async function (response) {
                console.log(response.data.albums.items[0].images[0].url);
                image = response.data.albums.items[0].images[0].url

                    const embed = new MessageEmbed()
                    .setTitle(`**Currently Playing**`)
                    .setColor(client.color.invis)
                    .addField('Song Name', newname)
                    .setDescription(`${progressBar(
                        total,
                        stream,
                        18,
                        "▬",
                    )} ${time}/${song.duration}`)
                    .setThumbnail(image)
                    .setTimestamp()

                return interaction.followUp({embeds:[embed], components:[row]})

        }).catch(function (error) {

            console.log(error);

            const embed = new MessageEmbed()
            .setTitle(`**Currently Playing**`)
            .setColor(client.color.invis)
            .addField('Song Name', newname)
            .setDescription(`${progressBar(
                total,
                stream,
                18,
                "▬",
            )} ${time}/${song.duration}`)
            .setThumbnail(song.thumbnail)
            .setTimestamp()

        return interaction.followUp({embeds:[embed], components:[row]})


        })


    }catch(err){
        console.log(err)
        interaction.followUp('An error has occured, please try again later')
    }
       

    }
}

const progressBar = (total, current, size = 40, empty = '▬', line = '▬', slider = '🔘') => {
	if (!total) throw new Error('Total value is either not provided or invalid');
	if (!current && current !== 0) throw new Error('Current value is either not provided or invalid');
	if (isNaN(total)) throw new Error('Total value is not an integer');
	if (isNaN(current)) throw new Error('Current value is not an integer');
	if (isNaN(size)) throw new Error('Size is not an integer');
	if (current > total) {
		const bar = line.repeat(size + 2);
		const percentage = (current / total) * 100;
		return [bar, percentage];
	} else {
		const percentage = current / total;
		const progress = Math.round((size * percentage));
		const emptyProgress = size - progress;
		const lineProgress = line.repeat(progress);
		const progressText = lineProgress.substring(0, lineProgress.length - (line.length)) + slider;
		const emptyProgressText = empty.repeat(emptyProgress);
		const bar = progressText + emptyProgressText;

		return [bar];
	}
};