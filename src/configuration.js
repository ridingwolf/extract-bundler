'use strict'

const archiveFormat = 'zip';

const loadConfiguration = () => {
    let {
        extractDownloadUrls, 
        bundleName, 
        s3:{ 
            bucket, 
            destinationPath = ''
        } 
    } = loadEnvironmentConfig();
    
    if (destinationPath.length > 0){
        destinationPath = `${destinationPath}/`.replace(/\/\//g, '/');
    }

    return {
        extractDownloadUrls,
        archiveFormat,
        uploadOptions: {
            Bucket: bucket,
            Key: `${destinationPath}${bundleName}-${getDateString()}.${archiveFormat}`
        }
    }
}

const loadEnvironmentConfig = () => {
    const {
        EXTRACTDOWNLOADURLS = '',
        S3_BUCKET,
        S3_DESTINATIONPATH = '',
        BUNDLENAME
    } = process.env;

    const extractDownloadUrls = EXTRACTDOWNLOADURLS
        .split(',')
        .map(url => url.trim())
        .filter(url => url);

    if (extractDownloadUrls.length === 0)
        throwConfigurationException('EXTRACTDOWNLOADURLS')
    if (!S3_BUCKET)
        throwConfigurationException('S3_BUCKET');
    if (!BUNDLENAME)
        throwConfigurationException('BUNDLENAME');

    return {
        extractDownloadUrls,
        bundleName: BUNDLENAME,
        s3: {
            bucket: S3_BUCKET,
            destinationPath: S3_DESTINATIONPATH
        }
    }
}

const throwConfigurationException = variableName => {
    throw `Environment variable ${variableName} not set!`
    + '\n\nEnvironment variables:'
    + '\n EXTRACTDOWNLOADURLS : string containing a comma separated list of download urls'
    + '\n S3_BUCKET : S3 bucket name'
    + '\n S3_DESTINATIONPATH : optional, prefix for the uploaded bundle'
    + '\n BUNDLENAME : name of bundle that will be suffixed with the date';
}

const getDateString = () => {
    const pad = (value, length) => {
        let padded = value.toString();
        while (padded.length < length)
            padded = '0' + padded;
        return padded;
    }

    const date = new Date();
    const month = pad(date.getMonth() + 1, 2);
    const day = pad(date.getDate(), 2);

    return `${date.getFullYear()}-${month}-${day}`;
}

module.exports.load = loadConfiguration;