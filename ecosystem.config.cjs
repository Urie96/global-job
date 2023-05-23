const dotenv = require('dotenv');

module.exports = {
    apps: [
        {
            script: './output/dist/main.pve.js',
            name: 'MyCronJob',
            log_date_format: 'MM-DD HH:mm:ss',
            log_file: './output/combined.log',
            combine_logs: true,
            env: dotenv.config().parsed,
            // time: true,
            // cwd:'',
            // args:'',
            // watch: '.',
        },
    ],

    // deploy : {
    //   production : {
    //     user : 'SSH_USERNAME',
    //     host : 'SSH_HOSTMACHINE',
    //     ref  : 'origin/master',
    //     repo : 'GIT_REPOSITORY',
    //     path : 'DESTINATION_PATH',
    //     'pre-deploy-local': '',
    //     'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
    //     'pre-setup': ''
    //   }
    // }
};
