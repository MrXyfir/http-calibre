const config = require("config");
const exec = require("child_process").exec;
const disk = require("diskusage");
const DO = require("digitalocean").client(config.keys.digitalocean);

module.exports = function() {

    // Get storage volume's USED disk space
    const check = () =>
    disk.check(config.directories.storage.disk, (err, info) => {
        if (!err) {
            const usedSpace = info.total;

            // If less than 5GB free space remaining
            if (usedSpace + 5000000000 >= global.____storageSpace) {
                // !! NOTE: digitalocean package currently throws error for unexpected
                // !! HTTP status code (202)
                try {
                    const newSize = Math.ceil(usedSpace / 1000000000) + 5;

                    DO.volumes.resize(config.volume.doId, newSize, config.volume.doRegionId);
                }
                finally {
                    // Update global.__storageSpace
                    // Run resize2fs command
                    DO.volumes.get(config.volume.doId).then(volumes => {
                        volumes.forEach(v => {
                            if (v.id == config.volume.doId) {
                                global.___storageSpace = v.size_gigabytes * 1000000000;

                                // ¯\_(ツ)_/¯
                                const cmd = `echo '${config.keys.sudoPass}' | sudo -S `
                                    + `resize2fs ${config.directories.storage.disk}`;

                                exec(cmd, (err, data, stderr) => {});
                            }
                        });
                    });
                }
            }
        }
    });

    // Call DigitalOcean API to get block storage volume's total space
    if (global.__storageSpace === undefined) {
        DO.volumes.get(config.volume.doId).then(volumes => {
            volumes.forEach(v => {
                if (v.id == config.volume.doId) {
                    global.___storageSpace = v.size_gigabytes * 1000000000;
                    check();
                }
            });
        });
    }
    else {
        check();
    }

};