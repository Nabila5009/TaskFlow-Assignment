const request = require("supertest");
const app = require("../server");

describe("Task API", () => {

    test("should reject task with empty title", async () => {
        const response = await request(app)
            .post("/tasks")
            .send({
                title: "",
                description: "Test task",
                priority: "High",
                column_id: 1
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.message).toBe(
            "Task title is required"
        );
    });


    test("should move task to another column", async () => {

        const createResponse = await request(app)
            .post("/tasks")
            .send({
                title: "Move Test Task",
                description: "Testing task movement",
                priority: "Medium",
                column_id: 1
            });

        expect(createResponse.statusCode).toBe(201);

        const taskId = createResponse.body.task.id;

        const updateResponse = await request(app)
            .put(`/tasks/${taskId}`)
            .send({
                title: "Move Test Task",
                description: "Testing task movement",
                priority: "Medium",
                column_id: 2
            });

        expect(updateResponse.statusCode).toBe(200);

        expect(updateResponse.body.task.column_id).toBe(2);
    });


    test("should return correct task count for each column", async () => {

        const response = await request(app)
            .get("/boards/1/task-count");

        expect(response.statusCode).toBe(200);

        expect(Array.isArray(response.body)).toBe(true);

        expect(response.body.length).toBe(3);

        response.body.forEach((column) => {
            expect(column).toHaveProperty("column_id");
            expect(column).toHaveProperty("column_name");
            expect(column).toHaveProperty("task_count");
        });
    });

});