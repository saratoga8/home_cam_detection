[![](https://github.com/saratoga8/home_cam_detection/workflows/Node.js%20CI/badge.svg)](https://github.com/saratoga8/home_cam_detection/actions?query=workflow%3A%22Node.js+CI%22)
Detecting a motion by camera and notifying user
===================
Regular camera can be connected to you computer and used for detecting any motion. When motion detected, notification will be sent to the user by messenger(e.g. Telegram or Slack)
It can be run on any computer with Linux OS. The optimal case is to run on a single board computer like Raspberry Pi

Table of contents
* [Used technologies](#Technologies)
* [Requirements](#Requirements)
* [Getting started](#Getting-started)
* [How to run in Docker?](#How-to-run-in-Docker?)
* [How does it work?](#How-does-it-work?)
* [If it has stuck](#If-it-has-stuck)
* [Planned features](#Planned-features)


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
1. Install Motion 
2.  Install NodeJS by [NVM](https://github.com/nvm-sh/nvm) or by your Linux package manager
3. Download the project and install it from its directory `npm install --only=prod`
4. In the __resources/motion.conf__ is the configuration file of Motion used in the project. If you camera device file is not /dev/video0, update the value of __videodevice__ in the file. 
More information about the configuration file can be found [here](https://motion-project.github.io/motion_config.html). The [values](#Motion-configuration-variables-used-in-the-project) of the file used in the project  
5. Edit file __resources/detections.yml__ in the project directory. See [this](#Detections-settings-of-the-project) 
6. Create Telegram bot and take its API token. See [this](https://core.telegram.org/bots#6-botfather)
7. Add the taken API token to the __resources/io.yml__[(Telegram bot settings)](#Telegram-bot-settings-of-the-project)
8. From project's directory run: `npm start &`
9. From the created Telegram bot send text *hello* [(Telegram bot commands)](#Telegram-bot-commands)
10. For stopping/starting motion detecting use commands *start/stop* 
11. To stop run: `npm stop`


## Detections settings of the project
The settings are in the file __resources/detections.yml__. Except __motion__ all the values are default and can be left as they are
#### Paths:
- *motion* - path to the motion program(use command `which motion`)
#### Extensions:
- *img* - Extension of image files with detections, same as in __motion.conf__ 
-  *video* - Extension of video files with detections(depends on supported by Motion and the messenger. E.g. Telegram support only MP4), same as in __motion.conf__
####
-  *max_saved_imgs* - Directory of detections is being cleaned periodically. All files removed except the given number of the oldest ones
-  *max_saved_videos* - The same as the previous, just for video files
-  *new_imgs_threshold* - Notification will be sent only if there are number of detection images more then the given threshold
-  *seconds_between_detections* - Time between detections. In the case of multiple detections(e.g. smth. moves constantly against camera), to avoid constant notifications there is period of delay between detections. E.g. detections of 15 images will be sent every 2 seconds 

## Telegram bot settings of the project
The settings are in the file __resources/io.yml__. The file contains different Input/Output instances for notifications. E.g. Telegram or CLI(for tests only). Only one instance should be used
#### Telegram:
- *use* - Should the instance be used for notification (value: __yes__/__no__)
- *token* - API token of created Telegram bot
- *msg_type* - type of notification message(value: __image__/__video__) (For weak computers, like Raspberry Pi or slow connections __image__ should be used)
#### Cli (for tests only): 
- *use* - Should the instance be used for notification (value: __yes__/__no__)

## Telegram bot commands
* *help* - print all commands
*  *start* - start detecting motions
*  *stop* - stop detecting motions 
*  *hello* - initialize connection to bot(use just after creating bot)

## Motion configuration variables used in the project
Be careful with editing of the variables it can affect program's run
- *process_id_file* - __motion/motion.pid__ (change ${MOTION_CONF_PATH} by the real path)
- *logfile* - __motion/log/motion.log__
- *videodevice* - Path to your camera device, usually it is /dev/video0 (if there is only one camera)
- *max_movie_time* - Maximal time in seconds of created movie. Shouldn't be too long, 10 seconds is pretty enough
- *output_pictures* - If you don't want to get notifications with pictures(only videos), set it __off__
- *ffmpeg_output_movies* - If you want to get notifications with videos only, set it __on__
- *ffmpeg_video_codec* - For Telegram __mp4__(others haven't checked)
- *target_dir* - Directory for saving images/videos of motion detections, set it __motion/detections__
- *on_movie_start* - Set it __rm -f /tmp/video.finished__
- *on_movie_end* - Set it __touch /tmp/video.finished__ 

## How to run in Docker?
From the directory of the project build the docker image: 
```
docker build -t ${IMG_NAME} .
docker run -d --device=${VIDEO_DEV_PATH}:/dev/video0 --name ${CONTAINER_NAME} -ti ${IMG_NAME}
docker exec -ti ${CONTAINER_NAME} bash
```
*${VIDEO_DEV_PATH}* - path to the video device(e.g. /dev/video0)
*${IMG_NAME}* - name of docker image
*${CONTAINER_NAME}* - name of docker container


## How does it work?
The program starts Motion as a child process, the Motion uses __motion__ directory in the project for logging and saving detection files(images/videos). Motion uses its config file __resources/motion.conf__. Configuration of detections is in __resources/detections.yml__
If there are detection files in the __motion__ directory, the files will be sent to the messenger configured in __resources/io.yml__

## If it has stuck
Try `npm stop` or from the directory __bin__ `./stop.sh`
If it is still stuck `killall motion; killall node`

## Planned features
* Auto stop/start of motion detecting by pinging of user's phone device (E.g. if the device isn't reachable then detecting will be started)
* Scheduled stop/start of motion detecting (E.g. every weekend stop motion detecting)
* Slack support
* Support running in a cloud in the case of web camera use
