export type FetchFn = typeof fetch;

export interface FiberyErrorResult {
  name: string;
  message: string;
  data: object;
}

export interface FiberySuccessResponse<T = any> {
  success: true;
  result: T;
}

export interface FiberyErrorResponse {
  success: false;
  result: FiberyErrorResult;
}

export type FiberyResponse<T = any> =
  | FiberySuccessResponse<T>
  | FiberyErrorResponse;

export interface CommandArgs {
  command: string;
  args: any;
}

export interface FiberyCommandExecutionError {
  command: CommandArgs;
  error: FiberyErrorResult;
}

export type FiberyEntity<T = object> = T & {
  "fibery/id": string;
};

export type FiberyEntityWithOptionalId<T = object> = T & {
  "fibery/id"?: string;
};

export type FiberyCreateEntity<T = object> = {
  type: string;
  entity: FiberyEntityWithOptionalId<T>;
};

export type FiberyUpdateEntity<T = object> = {
  type: string;
  entity: FiberyEntity<T>;
};

/**
 * Here, to add the id of the user in created-by, we add the {thisField: [targetFields] selector.
 */
type VecDereference = {
  [key: string]: string[];
};

/**
 * The subselect expression is a full query of its own (a subquery).
 */
type VecSubselect = {
  [key: string]: Omit<FiberyQuery, "q/from">;
};

type WhereExpression = (string | WhereExpression)[];

type OrderByExpression = [string[], "q/asc" | "q/desc"];

/**
 * Documentation from: https://developers.fibery.com/guides/http-api/query-entities
 */
export type FiberyQuery = {
  /**
   * Database name in format space/name, such as Cricket/Player or fibery/user. Note that the case matters.
   */
  "q/from": string;
  /**
   *  Array of primitive Fields, entity Field objects, objects with entity collection Fields subqueries and entity collection Field aggregates.
   */
  "q/select": (string | VecDereference | VecSubselect)[];
  /**
   * Filter expression represented as an array.
   */
  "q/where"?: WhereExpression;
  /**
   * How many Entities to skip — useful for pagination.
   */
  "q/offset"?: number;
  /**
   * Array of sorting expressions — sorting by multiple Fields is supported.
   *
   * Default: `[ [["fibery/creation-date"], "q/asc"], [["fibery/id"], "q/asc"] ]`
   */
  "q/order-by"?: OrderByExpression[];
  /**
   * How many Entities to return.
   *
   * Use a bounded value (e.g. 1000) and paginate to read large datasets — see Pagination.
   * "q/no-limit" is supported but discouraged.
   *
   * In sub-queries, use 100; "q/no-limit" is allowed today but planned for deprecation.
   */
  "q/limit": number | "q/no-limit";
};

export type FiberyQueryParams = {
  [key: `$${string}`]: any;
};

export type FiberyQueryRequest = {
  query: FiberyQuery;
  params?: FiberyQueryParams;
};
