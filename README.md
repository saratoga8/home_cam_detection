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
1. Install Motion and configure it by editing file __motion.conf__ according to [Motion configuration](#Motion-configuration). Configuring motion remember about size limitations of sending data to messengers(e.g. Telegram limits sent video to 50M)
2.  Install NodeJS
3. Download the project
4. Edit file resources/motion.yml in the project directory. See [this](#Motion-settings-of-the-project) 
5. Create Telegram bot and take its API token. See [this](https://core.telegram.org/bots#6-botfather)
6. Add the taken API token to the __resources/io.yml__[(Telegram bot settings)](#Telegram-bot-settings-of-the-project)
7. From project's directory run: `npm start &`
8. From the created Telegram bot send text *hello* [(Telegram bot commands)](#Telegram-bot-commands)
9. For stopping/starting motion detecting use commands *start/stop* 
10. To stop run: `npm stop`

## Motion configuration
After install, Motion's config file usually is in __${MOTION_CONF_PATH}/motion.conf__, where *${MOTION_CONF_PATH}* is __.motion__ directory in the directory of your current user(`$HOME/.motion`). In the __motion.conf__ the values of the next variables should be set:
- *process_id_file* - __${MOTION_CONF_PATH}/motion.pid__ (change ${MOTION_CONF_PATH} by the real path)
- *logfile* - __${MOTION_CONF_PATH}/log/motion.log__
- *videodevice* - Path to your camera device, usually it is /dev/video0 (if there is only one camera)
- *max_movie_time* - Maximal time in seconds of created movie. Shouldn't be too long, 10 seconds is pretty enough
- *output_pictures* - If you don't want to get notifications with pictures(only videos), set it __off__
- *ffmpeg_output_movies* - If you want to get notifications with videos only, set it __on__
- *ffmpeg_video_codec* - For Telegram __mp4__(others haven't checked)
- *target_dir* - Directory for saving images/videos of motion detections, set it __${MOTION_CONF_PATH}/detections__
- *on_movie_start* - Set it __rm -f /tmp/video.finished__
- *on_movie_end* - Set it __touch /tmp/video.finished__ 

## Motion settings of the project
The settings are in the file __resources/motion.yml__
#### Paths:
- *motion* - path to the motion program(use command `which motion`)
-  *conf_dir* - path to the config directory of motion (usually *.motion* in the user's directory, see [(Motion configuration)](#Motion-configuration))
-  *detections_dir* - path to the directory containing detections information(value of *target_dir* from [(Motion configuration)](#Motion-configuration)))
#### Extensions:
- *img* - Extension of image files with detections, same as in __motion.conf__
-  *video* - Extension of video files with detections(depends on supported by Motion and the messenger. E.g. Telegram support only MP4), same as in __motion.conf__
-  *max_saved_imgs* - Directory of detections is being cleaned periodically. All files removed except the given number of the oldest ones
-  *max_saved_videos* - The same as the previous, just for video files
-  *new_imgs_threshold* - Notification will be sent only if there are number of detection images more then the given threshold
-  *seconds_between_detections* - Time between detections. In the case of multiple detections(e.g. smth. moves constantly against camera), to avoid constant notifications there is period of delay between detections. E.g. detections of 15 images will be sent every 2 seconds 

## Telegram bot settings of the project
The settings are in the file __resources/io.yml__. The file contains different Input/Output instances for notifications. E.g. Telegram or CLI(for tests only). Only one instance should be used per run
#### Telegram:
- *use* - Should the instance be used for notification (value: __yes__/__no__)
- *token* - API token of created Telegram bot
- *msg_type* - type of notification message(value: __image__/__video__)
#### Cli (for tests only): 
- *use* - Should the instance be used for notification (value: __yes__/__no__)

## Telegram bot commands
* *help* - print all commands
*  *start* - start detecting motions
*  *stop* - stop detecting motions 
*  *hello* - initialize connection to bot(use just after creating bot)

## Planned features
* Auto stop/start of motion detecting by pinging of user's phone device (E.g. if the device isn't reachable then detecting will be started)
* Scheduled stop/start of motion detecting (E.g. every weekend stop motion detecting)
* Slack support
* Support running in a cloud in the case of web camera use