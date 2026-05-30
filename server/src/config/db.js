class AwsService {
    static getAwsAccessKeys() {
        const {
            AWS_ACCESS_KEY_ID: accessKeyId,
            AWS_SECRET_ACCESS_KEY: secretAccessKey,
            AWS_SESSION_TOKEN: sessionToken,
            AWS_REGION: awsRuntimeRegion,
            AWS_DEFAULT_REGION: awsRegion,
        } = process.env;

        let awsConfig = {
            region: awsRuntimeRegion || awsRegion || "ap-southeast-1", // Singapore By Default
        };

        if (accessKeyId) {
            awsConfig = {
                ...awsConfig,
                accessKeyId,
                secretAccessKey,
            };
            if (sessionToken) {
                awsConfig = {
                    ...awsConfig,
                    sessionToken,
                };
            }
        }

        return awsConfig;
    }
}

module.exports = { AwsService };