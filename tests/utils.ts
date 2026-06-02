import { Fibery } from "../src/fibery.js";
import Bottleneck from "bottleneck";
import ky from "ky";

const limiter = new Bottleneck({
  minTime: 334, // 3 requests per second
});

const customFetch: typeof fetch = (input, init) => {
  return limiter.schedule(() => ky(input, init).then((res) => res));
};

export interface AuthorEntity {
  "fibery/id": string;
  [firstNameKey: `${string}/FirstName`]: string;
  [booksKey: `${string}/Books`]: { "fibery/id": string }[] | BookEntity[];
}

export interface BookEntity {
  "fibery/id": string;
  [titleKey: `${string}/Title`]: string;
}

export function getFibery(): Fibery {
  const host = process.env.FIBERY_API_URL;
  const token = process.env.FIBERY_API_KEY;

  if (!host || !token) {
    throw new Error(
      "FIBERY_API_URL and FIBERY_API_KEY environment variables must be set.",
    );
  }

  return new Fibery({ host, token, fetch: customFetch });
}

export async function setupTestTypes(fibery: Fibery) {
  const spaceName = process.env.TEST_SPACE_NAME || "Testing";
  const authorType = `${spaceName}/Author`;
  const bookType = `${spaceName}/Book`;

  // Precautionary cleanup in case a previous run crashed before teardown.
  await teardownTestSpace(fibery);

  // Create the Types
  await fibery.type.createBatch([
    {
      "fibery/name": authorType,
      "fibery/meta": { "fibery/domain?": true },
    },
    {
      "fibery/name": bookType,
      "fibery/meta": { "fibery/domain?": true },
    },
  ]);

  // Create Fields
  await fibery.field.createBatch([
    {
      "fibery/holder-type": authorType,
      "fibery/name": `${spaceName}/FirstName`,
      "fibery/type": "fibery/text",
    },
    {
      "fibery/holder-type": bookType,
      "fibery/name": `${spaceName}/Title`,
      "fibery/type": "fibery/text",
    },
    {
      "fibery/holder-type": authorType,
      "fibery/name": `${spaceName}/Books`,
      "fibery/type": "relation",
      meta: {
        to: bookType,
        toName: `${spaceName}/Author`,
        isFromMany: true,
        isToMany: true,
      },
    },
  ]);

  return { authorType, bookType };
}

export async function teardownTestSpace(fibery: Fibery) {
  const spaceName = process.env.TEST_SPACE_NAME || "Testing";
  const authorType = `${spaceName}/Author`;
  const bookType = `${spaceName}/Book`;

  try {
    // Delete relation field first to break the bidirectional reference
    await fibery.field.deleteBatch([
      {
        "holder-type": authorType,
        name: `${spaceName}/Books`,
      },
      {
        "holder-type": bookType,
        name: `${spaceName}/Author`,
      },
    ]);
  } catch (e) {
    // Ignore if relation or type doesn't exist
  }

  try {
    // Query existing author entities
    const authors = await fibery.entity.query({
      "q/from": authorType,
      "q/select": ["fibery/id"],
      "q/limit": 100,
    });
    if (authors && authors.length > 0) {
      await fibery.entity.deleteBatch(
        authors.map((a: any) => ({
          type: authorType,
          entity: { "fibery/id": a["fibery/id"] },
        })),
      );
    }
  } catch (e) {
    // Ignore if type doesn't exist
  }

  try {
    // Query existing book entities
    const books = await fibery.entity.query({
      "q/from": bookType,
      "q/select": ["fibery/id"],
      "q/limit": 100,
    });
    if (books && books.length > 0) {
      await fibery.entity.deleteBatch(
        books.map((b: any) => ({
          type: bookType,
          entity: { "fibery/id": b["fibery/id"] },
        })),
      );
    }
  } catch (e) {
    // Ignore if type doesn't exist
  }

  try {
    await fibery.type.deleteBatch([{ name: authorType }, { name: bookType }]);
  } catch (e) {
    // Ignore if type doesn't exist
  }
}
