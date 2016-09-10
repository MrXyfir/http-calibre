const config = require("config");
const exec = require("child_process").exec;
const disk = require("diskusage");
const DO = require("digitalocean").client(config.keys.digitalocean);

module.exports = function() {

    // Get storage volume's USED disk space
    const check = () =>
    disk.check(config.directories.storage.mount, (err, info) => {
        if (!err) {
            const usedSpace = info.total - info.available;

            // If less than 5GB free space remaining
            if (usedSpace + 5000000000 >= global.__storageSpace) {
                try {
                    const newSize = Math.ceil(usedSpace / 1000000000) + 5;

                    DO.volumes.resize(config.volume.doId, newSize, config.volume.doRegionId);
                }
                catch (e) {
                    // !! NOTE: digitalocean package currently throws error for unexpected
                    // !! HTTP status code (202)
                }
                finally {
                    // Update global.__storageSpace
                    // Run resize2fs command
                    DO.volumes.get(config.volume.doId).then(volume => {
                        global.__storageSpace = volume.size_gigabytes * 1000000000;

                        // ¯\_(ツ)_/¯
                        const cmd = `echo '${config.keys.sudoPass}' | sudo -S `
                            + `resize2fs ${config.directories.storage.disk}`;

                        exec(cmd, (err, data, stderr) => 1);
                    });
                }
            }
        }
    });

    // Call DigitalOcean API to get block storage volume's total space
    if (global.__storageSpace === undefined) {
        DO.volumes.get(config.volume.doId).then(volume => {
            global.__storageSpace = volume.size_gigabytes * 1000000000;
            check();
        });
    }
    else {
        check();
    }

};