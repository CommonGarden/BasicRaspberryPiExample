# BasicRaspberryPiExample

## Setup
Setup your raspberry pi by following these instructions.

Install the latest version of Node. Todo this, either search for an article to help walk you through it or run the following:

```bash
wget https://nodejs.org/dist/v8.6.0/node-v8.6.0-linux-armv7l.tar.xz
tar -xvf node-v8.6.0-linux-armv7l.tar.gz 
cd node-v8.6.0-linux-armv7l

```
Then copy to /usr/local:

```
sudo cp -R * /usr/local/
```

Test that's it's working with `node -v`.

Now we're ready for the rest of the install.

```bash
sudo apt-get update
sudo apt-get install wiringpi git
git clone https://github.com/CommonGarden/BasicRaspberryPiExample
npm install
sudo node example-driver.js
```

This example driver uses a [BME280](https://www.aliexpress.com/item/BME280-Digital-Sensor-Temperature-Humidity-Barometric-Pressure-Sensor-Module-I2C-SPI-1-8-5V-GY-BME280/32832733480.html?src=google&albslr=222159080&isdl=y&aff_short_key=UneMJZVf&source=%7Bifdyn:dyn%7D%7Bifpla:pla%7D%7Bifdbm:DBM&albch=DID%7D&src=google&albch=shopping&acnt=708-803-3821&isdl=y&albcp=653153647&albag=34728528644&slnk=&trgt=61865531738&plac=&crea=en32832733480&netw=g&device=c&mtctp=&gclid=EAIaIQobChMIis-vz5HH1wIVAdlkCh0QSANmEAQYAiABEgJBOPD_BwE) climate sensor. If none is provided it will emit random numbers. See [johnny-five](http://johnny-five.io/) for lots of plug and play sensors.

## Connecting to Grow-IoT
By default, the example driver connects to https://grow.commongarden.org.

To change this see the bottom of the `example-device.js` file. It currently reads.

```
  growHub.connect({
    host: 'grow.commongarden.org',
    port: 443,
    ssl: true
  });
```

For development it's easier to simply connect to you local computer. Find your computer's IP address and change the `host`, `port`, and `ssl` options:
```
  growHub.connect({
    host: '10.0.0.198', // The ip address of the host
    port: 3000, // The port you are running Grow-IoT on
    ssl: false
  });
```

### Run on boot
Once you're happy with your driver you'll want to start it on boot in case your device looses power.

Install [forever](https://www.npmjs.com/package/forever) globally.

```
sudo npm install forever -g
```

Then create a new text file in`/etc/init.d/`:
```bash
sudo nano /etc/init.d/grow
```

Paste in the follow (note this assumes you installed Grow-Hub in the root of the home folder for a user named `pi`):

```bash
#!/bin/bash
#/etc/init.d/grow
export PATH=$PATH:/usr/local/bin
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules

case "$1" in
start)
exec sudo forever --sourceDir=/home/pi/Grow-Hub/driver -p /home/pi/Grow-Hub/dri$
;;
stop)
exec sudo forever stop --sourceDir=/home/pi/Grow-Hub/driver Grow-Hub.js
;;
*)
echo "Usage: /etc/init.d/grow {start|stop}"
exit 1
;;
esac
exit 0
```

Make it executable with the following command:
```bash
chmod 755 /etc/init.d/grow 
```

Feel free to test it:
```bash
sh /etc/init.d/grow start/stop
```

If all goes well, make it bootable:
```bash
sudo update-rc.d grow defaults
```

To remove it from boot:
```bash
sudo update-rc.d -f grow remove
```

One last step, edit the [/etc/rc.local file](https://www.raspberrypi.org/documentation/linux/usage/rc-local.md).

```
sudo nano /etc/rc.local
```

Insert the following line before `exit 0`:
```
sh /etc/init.d/grow start
```

Reboot and your pi should start into the Grow-Hub driver.

