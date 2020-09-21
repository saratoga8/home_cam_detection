Detecting motion by camera and notifying user
===================
Regular camera can be connected to you computer and used for detecting any motion. In the case of motion detecting, notification will be sent to the user by messenger(e.g. Telegram or Slack)

## Technologies
The project developed with:
* #### [NodeJS](https://nodejs.org/en/)
* #### [Motion Project](https://motion-project.github.io/)
The project tested with:
* #### [Mocha](https://mochajs.org/)
* #### [Chai](https://www.chaijs.com/)
* #### [Cucumber](https://cucumber.io/)

## Requirements 
- Linux OS
- Telegram bot
- Connected camera

## Getting started
1. Install Motion and configure it by editing file __motion.conf__ according to [manual](https://motion-project.github.io/motion_config.html) 
2.  Install NodeJS
3. [Edit file resources/motion.yml in the project directory](#Motion-settings-of-the-project) 
4. Create Telegram bot and take its API token. See [this](https://core.telegram.org/bots#6-botfather)
5. Add the taken API token to the __resources/io.yml__[(Telegram bot settings)](#Telegram-bot-settings-of-the-project)
6. From project's directory run: `npm start &`
7. From the created Telegram bot send text *hello* [(Telegram bot commands)](#Telegram-bot-commands)
8. To stop run: `npm stop`

## Motion settings of the project
The settings are in the file __resources/motion.yml__
#### Paths:
- *motion* - path to the motion program(use command `which motion`)
-  *conf_dir* - path to the directory of motion (usually *.motion* in the user's directory)
-  *detections_dir* - path to the directory containing detections information(image files and videos)
#### Extensions:
- *img* - Extension of image files with detections
-  *video* - Extension of video files with detections
-  *max_saved_imgs* - Directory of detections is being cleaned periodically. All files removed except the given number of the oldest ones
-  *max_saved_videos* - The same as the previous, just for video files
-  *new_imgs_threshold* - Notification will be sent only if there are number of detection images more then the given threshold
-  *seconds_between_detections* - Time between detections. In the case of multiple detections(e.g. smth. moves constantly against camera), to avoid constant notifications there is period of delay between detections. E.g. detections of 15 images will be sent every 2 seconds 

## Telegram bot settings of the project
The settings are in the file __resources/io.yml__. The file contains different Input/Output instances for notifications. E.g. Telegram or CLI(for tests only). Only one instance should be used per run
#### Telegram:
- *use* - Is the instance should be used for notification (value: __yes__/__no__)
- *token* - API token of created Telegram bot
#### Cli (for tests only): 
- *use* - Is the instance should be used for notification (value: __yes__/__no__)

## Telegram bot commands
* *help* - print all commands
*  *start* - start detecting motions
*  *stop* - stop detecting motions 
*  *hello* - initialize connection to bot(use just after creating bot)
