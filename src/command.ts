// @ts-ignore
import Type from "./type.js";
// @ts-ignore
import Field from "./field.js";
// @ts-ignore
import Entity from "./entity.js";

export interface FiberyErrorResult {
  name: string;
  message: string;
  data: any;
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

export class Command {
  private _host: string;
  private _token: string;
  private _commandsEndpoint: string;
  private _fetch: typeof fetch;

  public createTypeBatchCmd: any;
  public renameTypeBatchCmd: any;
  public deleteTypeBatchCmd: any;

  public createFieldBatchCmd: any;
  public renameFieldBatchCmd: any;
  public deleteFieldBatchCmd: any;

  public queryEntityCmd: any;
  public createEntityBatchCmds: any;
  public updateEntityBatchCmds: any;
  public addToEntityCollectionFieldBatchCmds: any;
  public removeFromEntityCollectionFieldBatchCmds: any;
  public deleteEntityBatchCmds: any;

  constructor(host: string, token: string, fetchFn: typeof fetch) {
    this._host = host;
    this._token = token;
    this._fetch = fetchFn;
    this._commandsEndpoint = "/api/commands";

    this.createTypeBatchCmd = Type.commands.createTypeBatchCmd;
    this.renameTypeBatchCmd = Type.commands.renameTypeBatchCmd;
    this.deleteTypeBatchCmd = Type.commands.deleteTypeBatchCmd;

    this.createFieldBatchCmd = Field.commands.createFieldBatchCmd;
    this.renameFieldBatchCmd = Field.commands.renameFieldBatchCmd;
    this.deleteFieldBatchCmd = Field.commands.deleteFieldBatchCmd;

    this.queryEntityCmd = Entity.commands.queryEntityCmd;
    this.createEntityBatchCmds = Entity.commands.createEntityBatchCmds;
    this.updateEntityBatchCmds = Entity.commands.updateEntityBatchCmds;
    this.addToEntityCollectionFieldBatchCmds =
      Entity.commands.addToEntityCollectionFieldBatchCmds;
    this.removeFromEntityCollectionFieldBatchCmds =
      Entity.commands.removeFromEntityCollectionFieldBatchCmds;
    this.deleteEntityBatchCmds = Entity.commands.deleteEntityBatchCmds;
  }

  async executeBatch<T = any>(commands: CommandArgs[]): Promise<T[]> {
    const response = await this._fetch(
      "https://" + this._host + this._commandsEndpoint,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${this._token}`,
          "X-Client": "Unofficial JS",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commands),
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      } else if (response.status === 429) {
        throw new Error(await response.text());
      } else if (response.status === 500) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = null;
        }
        if (errorData && errorData.message) {
          throw new Error(`Server error: ${errorData.message}`);
        }
        throw new Error(
          "Unknown command name, malformed JSON body, or unexpected server error",
        );
      }
      throw new Error(`HTTP Error ${response.status}`);
    }

    const data = (await response.json()) as FiberyResponse<T>[];

    const errors = data.reduce<string[]>((acc, res, i) => {
      if (!res.success) {
        const errorMessage = res.result?.message || "Unknown error";
        return acc.concat(
          `Error while executing command '${commands[i].command}': ${errorMessage}`,
        );
      }
      return acc;
    }, []);

    if (errors.length) {
      throw new Error(errors.join("\n"));
    }

    return data.map((res) => (res as FiberySuccessResponse<T>).result);
  }

  execute<T = any>(command: CommandArgs): Promise<T> {
    return this.executeBatch<T>([command]).then((results) => results[0]);
  }
}

export default Command;
