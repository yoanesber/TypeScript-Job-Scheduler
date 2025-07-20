import { faker } from "@faker-js/faker";
import { QueryInterface } from "sequelize";

export async function up(queryInterface: QueryInterface) {
    const transactions = Array.from({ length: 1000 }).map(() => ({
        id: faker.string.uuid(),
        type: faker.helpers.arrayElement(["credit", "debit"]),
        amount: faker.number.int({ min: 1000, max: 10000 }),
        status: faker.helpers.arrayElement(["pending", "completed", "failed"]),
        consumerId: faker.string.uuid(),
        createdAt: faker.date.recent().toISOString(),
        updatedAt: faker.date.future().toISOString(),
    }));

    await queryInterface.bulkInsert("transactions", transactions);
}

export async function down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("transactions", {}, {});
}