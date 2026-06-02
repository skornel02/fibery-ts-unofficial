import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  getFibery,
  setupTestTypes,
  teardownTestSpace,
  AuthorEntity,
} from "./utils.js";

describe("Fibery Entity Service", () => {
  let fibery: ReturnType<typeof getFibery>;
  let authorType: string;
  let bookType: string;
  const spaceName = process.env.TEST_SPACE_NAME || "Testing";

  beforeAll(async () => {
    fibery = getFibery();
    const types = await setupTestTypes(fibery);
    authorType = types.authorType;
    bookType = types.bookType;

    // Allow time for schema changes to apply in Fibery
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }, 20000);

  afterAll(async () => {
    if (fibery) {
      await teardownTestSpace(fibery);
    }
  }, 10000);

  let authorId1: string;
  let authorId2: string;
  let bookId1: string;

  it("should create entities using createBatch", async () => {
    const result = await fibery.entity.createBatch([
      {
        type: authorType,
        entity: {
          [`${spaceName}/FirstName`]: "Isaac",
        },
      },
      {
        type: authorType,
        entity: {
          [`${spaceName}/FirstName`]: "Arthur",
        },
      },
    ]);

    expect(result).toHaveLength(2);
    authorId1 = result[0]["fibery/id"];
    authorId2 = result[1]["fibery/id"];
    expect(authorId1).toBeDefined();
    expect(authorId2).toBeDefined();
  });

  it("should query entities using query", async () => {
    const result = await fibery.entity.query<AuthorEntity>(
      {
        "q/from": authorType,
        "q/select": ["fibery/id", `${spaceName}/FirstName`],
        "q/where": ["=", "fibery/id", "$id"],
        "q/limit": 1,
      },
      {
        $id: authorId1,
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0]["fibery/id"]).toBe(authorId1);
    expect(result[0][`${spaceName}/FirstName` as const]).toBe("Isaac");
  });

  it("should update entities using updateBatch", async () => {
    await fibery.entity.updateBatch([
      {
        type: authorType,
        entity: {
          "fibery/id": authorId1,
          [`${spaceName}/FirstName`]: "Isaac Asimov",
        },
      },
    ]);

    const result = await fibery.entity.query<AuthorEntity>(
      {
        "q/from": authorType,
        "q/select": ["fibery/id", `${spaceName}/FirstName`],
        "q/where": ["=", "fibery/id", "$id"],
        "q/limit": 1,
      },
      {
        $id: authorId1,
      },
    );

    expect(result[0][`${spaceName}/FirstName` as const]).toBe("Isaac Asimov");
  });

  it("should add to and remove from collection field", async () => {
    // First create a book
    const bookResult = await fibery.entity.createBatch([
      {
        type: bookType,
        entity: {
          [`${spaceName}/Title`]: "Foundation",
        },
      },
    ]);
    bookId1 = bookResult[0]["fibery/id"];

    // Add book to author's collection
    await fibery.entity.addToEntityCollectionFieldBatch([
      {
        type: authorType,
        field: `${spaceName}/Books`,
        entity: { "fibery/id": authorId1 },
        items: [{ "fibery/id": bookId1 }],
      },
    ]);

    // Query to check if the book is there
    let authorQuery = (await fibery.entity.query(
      {
        "q/from": authorType,
        "q/select": [
          "fibery/id",
          {
            [`${spaceName}/Books`]: {
              "q/select": ["fibery/id"],
              "q/limit": 10,
            },
          },
        ],
        "q/where": ["=", "fibery/id", "$id"],
        "q/limit": 1,
      },
      { $id: authorId1 },
    )) as AuthorEntity[];

    let booksCollection = authorQuery[0][`${spaceName}/Books` as const];
    expect(booksCollection).toBeDefined();
    expect(booksCollection.length).toBe(1);
    expect(booksCollection[0]["fibery/id"]).toBe(bookId1);

    // Remove the book from the collection
    await fibery.entity.removeFromEntityCollectionFieldBatch([
      {
        type: authorType,
        field: `${spaceName}/Books`,
        entity: { "fibery/id": authorId1 },
        items: [{ "fibery/id": bookId1 }],
      },
    ]);

    // Query again to check if the book is removed
    authorQuery = (await fibery.entity.query(
      {
        "q/from": authorType,
        "q/select": [
          "fibery/id",
          {
            [`${spaceName}/Books`]: {
              "q/select": ["fibery/id"],
              "q/limit": 10,
            },
          },
        ],
        "q/where": ["=", "fibery/id", "$id"],
        "q/limit": 1,
      },
      { $id: authorId1 },
    )) as AuthorEntity[];

    booksCollection = authorQuery[0][`${spaceName}/Books` as const];
    expect(booksCollection.length).toBe(0);
  });

  it("should delete entities using deleteBatch", async () => {
    await fibery.entity.deleteBatch([
      {
        type: authorType,
        entity: { "fibery/id": authorId2 },
      },
    ]);

    const result = (await fibery.entity.query(
      {
        "q/from": authorType,
        "q/select": ["fibery/id"],
        "q/where": ["=", "fibery/id", "$id"],
        "q/limit": 1,
      },
      { $id: authorId2 },
    )) as AuthorEntity[];

    expect(result).toHaveLength(0);
  });
});
