var SERVER_SCREENSHOT = require('node-server-screenshot');
var AWS = require('aws-sdk');
var mimemessage = require('mimemessage');
var fs = require('fs');

/**Change this to proper dashboard location */
const dashboardURL =  'http://aws-practice-nikhil-bucket.s3-website.us-east-2.amazonaws.com/';
const dashboardPNGPath = 'DashboardSnapshot.png';

function modifyDashboard () {
    
    const s3 = new AWS.S3({
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY_ID,
        },
        region : 'us-east-1',
    });

    const getParams = {
        Bucket : 'helios-uw-dashboard-designs',
        Key : 'helios-uw-dashboarddesigns/Dashboard.html'
        //Key : 'Dashboard.html',
    };

    s3.getObject(getParams, function (err, data) {
        if (err) {
            return {
                statusCode : err.statusCode,
                body : err
            }
        } else {
            return {
                statusCode : 200,
                body : data.Body
            }
            let updateDashboard = 
                function updateDashboardWithMetrics(energyProduced) {
                    //console.log(data.Body.toString('utf-8'));                
                    // update data
            };

            let getEnergyInRange = 
                function getTotalEnergyProductedInTimeRange(startTime, endTime) {
                    // accumulate energy from DynamoDB
                    return 9001;
            };

            totalEnergyProduced = getEnergyInRange(null, null);
            updateDashboard(totalEnergyProduced);

            const putParams = {
                Body : data.Body,
                Bucket : 'aws-practice-nikhil-bucket',
                Key : 'Dashboard.html',
                ContentType : 'text/html'
            };

            s3.putObject(putParams, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log('Dashboard Updated');
                    
                    SERVER_SCREENSHOT.fromURL(dashboardURL, 'DashboardSnapshot.png', function () {
                        console.log('Image DashboardSnapshot.png saved locally');

                        // send via Simple Email Service
                        let sendEmail = function () {

                            fs.readFile('./DashboardSnapshot.png', 'base64', function (err, data) {
                                if (err) {
                                    console.log('Error reading file; aborting');
                                } else {
                                    let msg = mimemessage.factory({
                                        contentType : 'multipart/mixed',
                                        body: []
                                    });
                                    msg.header('Message-ID', '<1234querty>');
    
                                    let alternateEntry = mimemessage.factory({
                                        contentType : 'multipart/alternate',
                                        body : []
                                    });

                                    let plainEntry = mimemessage.factory({
                                        body : 'Here is the weekly update. Enjoy!'
                                    });
    
    
                                    let pngEntity = mimemessage.factory({
                                        contentType : 'image/png',
                                        contentTransferEncoding : 'base64',
                                        body:  data.toString()
                                    });
                                    pngEntity.header('Content-Disposition', 'attachment ;filename="DashboardSnapshot.png"');

                                    alternateEntry.body.push(plainEntry);
                                    msg.body.push(alternateEntry);
                                    msg.body.push(pngEntity);

                                    let sesParams = {
                                        // put email address
                                        // ex) 'johnsmith@gmail.com'
                                        Destinations : ['<email_address_here>'],
                                        Source : '<email_address_here>',
                                        RawMessage : {
                                            Data : msg.toString(),
                                        },
                                    };

                                    const ses = new AWS.SES({
                                        region : 'us-east-1',
                                    });

                                    ses.sendRawEmail(sesParams, function (err, data) {
                                        if (err) {
                                            console.log(err, err.stack);
                                        } else {
                                            console.log('Email has been sent');
                                            console.log(data);
                                        }
                                    });
                                }
                            });
                        };
                        sendEmail();
                    });
                }
            });
        }
    });
}

/*
exports.handler = async (event) => {
    return modifyDashboard()
};
*/

function readFile(path) {
    SERVER_SCREENSHOT.fromURL(dashboardURL, 
        'DashboardSnapshot.png', function() {
        console.log('Image DashboardSnapshot.png saved locally');
    })
}

modifyDashboard()
