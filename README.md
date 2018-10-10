A Node server for manipulating [Calibre](https://calibre-ebook.com) libraries from a simple HTTP API. If you're looking for a simple way to work with Calibre directly in Node, try [node-calibre](https://github.com/Xyfir/node-calibre) instead.

# Abandoned

Unless a maintainer for this project is found or the [Xyfir Network](https://www.xyfir.com)'s needs change, this project will likely not receive any more updates. This was originally built to serve as part of the back end for the now-defunct xyBooks. The code has changed very little since when it was originally written in 2016. Some xyBooks-specific features have been modified or removed from this open source release, although some remnants of the old system may still be found.

# Setup

This was built only to run on POSIX systems and was tested exclusively on Ubuntu.

```bash
git clone ...
cd http-calibre
npm install
cp config.default.js config.js
```

Now you need to set the config file. `directories.libraries` and `directories.uploads` are the root directories for where library and upload files and folders will be stored. These should be absolute paths. `port` is obviously the port that the server will run on.

```bash
# install calibre if needed
# https://calibre-ebook.com/download_linux
sudo -v && wget -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sudo sh /dev/stdin
# start the server
npm start
```

You can now use the API. There is no documentation other than the comments and code within `controllers/`.
