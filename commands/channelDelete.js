const {Client, Message} = require('discord.js')

module.exports = {

  name:'channeldelete',
  description: 'Deletes a new channel',


  async execute(message, args,client){

    if(!message.member.hasPermission('MANAGE_CHANNELS')){
      return message.reply('Perms Denied')
    }

    const channelTarget = message.mentions.channels.first()

    if(!channelTarget){
      return message.reply('Please specify a channel name')
    }

    channelTarget.delete().then((ch) => {
        message.author.send(`Channel has been deleted`)
    });



  }


}
