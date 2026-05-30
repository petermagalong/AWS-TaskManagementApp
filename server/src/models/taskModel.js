const DynamoDB = require('../common/lib/dynamodb');

class TaskModel extends DynamoDB {
    static table = process.env.TASKS_TABLE || 'Tasks';

    static async createTask(fields) {
        return this.insertOne(fields);
    }

    static async getTaskById(id) {
        return this.findOneById(id);
    }

    static async deleteTaskById(id) {
        return this.deleteOneById(id);
    }

    static async updateTask(id, values) {
        return this.updateOne({ id, values });
    }

    static async getAllTasks() {
        return this.findMany();
    }
}

module.exports = TaskModel;