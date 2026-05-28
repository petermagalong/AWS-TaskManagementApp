const AwsService = require('../config/db');
const { DynamoDBClient, ScanCommand, PutItemCommand, DeleteItemCommand, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const {
    marshall,
    unmarshall,
} = require("@aws-sdk/util-dynamodb");

const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
};

const awsConfig = AwsService.AwsService.getAwsAccessKeys();

let dynamoDb = new DynamoDBClient(awsConfig);

function stripAwsMetadata(result) {
    if (!result || typeof result !== 'object') {
        return result;
    }

    const { $metadata, ...cleanResult } = result;
    return cleanResult;
}

const awsDynamoDbService = {
    async putItem(params) {
        try {
            const { table, fields } = params;
            const converted = marshall(fields, marshallOptions);
            const input = {
                Item: converted,
                TableName: table,
            };
            const command = new PutItemCommand(input);
            const result = await dynamoDb.send(command);
            return stripAwsMetadata(result);
        } catch (error) {
            console.error("Error putting item:", error);
            throw error;
        }
    },

    async getItem(params) {
        try {
            const { table, id } = params;
            const input = {
                TableName: table,
                Key: marshall({ id }),
            };
            const command = new GetItemCommand(input);
            const result = await dynamoDb.send(command);
            return result.Item ? unmarshall(result.Item) : null;
        } catch (error) {
            console.error("Error getting item:", error);
            throw error;
        }
    },

    async deleteItem(params) {
        try {
            const { table, id } = params;
            const input = {
                TableName: table,
                Key: marshall({ id }),
            };
            const command = new DeleteItemCommand(input);
            const result = await dynamoDb.send(command);
            return {
                ...stripAwsMetadata(result),
                deletedId: id,
            };
        } catch (error) {
            console.error("Error deleting item:", error);
            throw error;
        }
    },

    updateBuildFilterObjects(values) {
        let updateExpression = "";
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};
        const attrNames = Object.keys(values);

        attrNames.forEach((attrName) => {
            const replaced = attrName.replaceAll('.', '_');
            const attrNameKey = `#${replaced}`;
            const attrNameVal = `:${replaced}`;
            if (values[attrName] !== undefined) {
                expressionAttributeNames[attrNameKey] = attrName;

                const expressionItemObj = marshall({
                    tempKey: values[attrName],
                }, marshallOptions);

                expressionAttributeValues[attrNameVal] = expressionItemObj.tempKey;

                if (!updateExpression) {
                    updateExpression += "set ";
                }

                if (updateExpression !== "set ") {
                    updateExpression += ", ";
                }

                updateExpression += `${attrNameKey} = ${attrNameVal}`;
            }
        });

        return {
            updateExpression,
            expressionAttributeNames,
            expressionAttributeValues,
        };
    },

    async updateItem(params) {
        try {
            const { table, id, values } = params;
            const {
                updateExpression,
                expressionAttributeNames,
                expressionAttributeValues,
            } = this.updateBuildFilterObjects(values);

            const input = {
                TableName: table,
                Key: marshall({ id }),
                UpdateExpression: updateExpression,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
            };

            const command = new UpdateItemCommand(input);
            const result = await dynamoDb.send(command);
            return {
                ...stripAwsMetadata(result),
                updatedId: id,
            };
        } catch (error) {
            console.error("Error updating item:", error);
            throw error;
        }
    },

    async scanAll(params) {
        try {
            const { table, where } = params;
            const filterExpression = where ? Object.keys(where).map((key) => `#${key} = :${key}`).join(' and ') : undefined;
            const expressionAttributeNames = where ? Object.keys(where).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}) : undefined;
            const expressionAttributeValues = where ? Object.keys(where).reduce((acc, key) => {
                const marshalled = marshall({ value: where[key] }, marshallOptions);
                return {
                    ...acc,
                    [`:${key}`]: marshalled.value,
                };
            }, {}) : undefined;

            const result = await dynamoDb.send(new ScanCommand({
                TableName: table,
                FilterExpression: filterExpression,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
            }));
            return (result.Items || []).map((item) => unmarshall(item));
        } catch (error) {
            console.error("Error scanning table:", error);
            throw error;
        }
    },
};

module.exports = awsDynamoDbService;