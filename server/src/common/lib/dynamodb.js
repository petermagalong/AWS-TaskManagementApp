const awsDynamoDbService = require('../../services/aws.dynamodb.service');
const uuid = require('uuid');
const moment = require('moment-timezone');
class DynamoDB {
    static getFormattedTableName() {
        if (!this.table) {
            throw new Error("Database: Table is not specified");
        }

        return this.table
    }

    static async insertOne(fields = null) {
        if (!fields) {
            throw new Error("Database: No parameters to save");
        }

        const params = { ...fields };

        if (!params.id) {
            params.id = uuid.v1();
        }

        if (!params.created) {
            params.created = moment().tz("Asia/Manila").format();
        }

        if (!params.modified) {
            params.modified = moment().tz("Asia/Manila").format();
        }

        const result = await awsDynamoDbService.putItem({
            table: this.getFormattedTableName(),
            fields: params,
        });

        result.insertedId = params.id;
        result.data = params;
        return result;
    }

    static async insertMany(fieldsSet = null) {
        if (!fieldsSet || !fieldsSet.length) {
            throw new Error("Database: No parameters to save");
        }

        const result = [];
        const data = [];
        const insertedIds = [];

        for (const element of fieldsSet) {
            const params = { ...element };

            if (!params.id) {
                params.id = uuid.v1();
            }
            params.created = moment().tz("Asia/Manila").format();
            params.modified = moment().tz("Asia/Manila").format();

            const insert = awsDynamoDbService.putItem({
                table: this.getFormattedTableName(),
                fields: params,
            });

            insertedIds.push(params.id);
            data.push(params);
            result.push(insert);
        }

        await Promise.all(result);

        return {
            insertedIds,
            data,
        };
    }

    static async findOneById(id) {
        if (!id) {
            throw new Error("Database: Missing primary key parameter");
        }

        const result = await awsDynamoDbService.getItem({
            table: this.getFormattedTableName(),
            id,
        });

        return result;
    }

    static async deleteOneById(id) {
        if (!id) {
            throw new Error("Database: Missing primary key parameter");
        }

        const result = await awsDynamoDbService.deleteItem({
            table: this.getFormattedTableName(),
            id,
        });

        return result;
    }

    static async findOneByIndex(index, value) {
        if (!index) {
            throw new Error("Database: Missing index parameter");
        }

        if (!value) {
            throw new Error("Database: Missing filter parameter");
        }

        const result = await awsDynamoDbService.getItemByIndex({
            table: this.getFormattedTableName(),
            index,
            value,
        });

        if (Array.isArray(result) && result.length) {
            return result.shift();
        }

        return null;
    }

    static async findManyByIndex(index, value, where = null) {
        if (!index) {
            throw new Error("Database: Missing index parameter");
        }

        if (!value) {
            throw new Error("Database: Missing filter parameter");
        }
        const result = await awsDynamoDbService.getAllByIndex({
            table: this.getFormattedTableName(),
            index,
            value,
            where,
        });

        return result;
    }

    static async updateOne({ id, values }) {
        if (!id) {
            throw new Error("Database: Missing primary key parameter");
        }

        if (!values) {
            throw new Error("Database: Missing update values parameter");
        }

        const result = await awsDynamoDbService.updateItem({
            table: this.getFormattedTableName(),
            id,
            values: {
                ...values,
                modified: moment().tz("Asia/Manila").format(),
            },
        });

        return result;
    }

    static async findMany(where = null) {
        console.log('findMany');
        const result = await awsDynamoDbService.scanAll({
            table: this.getFormattedTableName(),
            where,
        });

        return result;
    }
}

module.exports = DynamoDB;