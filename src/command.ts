// @ts-ignore
import Type from "./type.js";
// @ts-ignore
import Field from "./field.js";
// @ts-ignore
import Entity from "./entity.js";
import { APIError, FiberyCommandError } from "./errors.js";
import {
  FiberyCommandExecutionError,
  FiberyResponse,
  FiberySuccessResponse,
  FetchFn,
} from "./types.js";

export class Command {
  private _host: string;
  private _token: string;
  private _commandsEndpoint: string;
  private _fetch: FetchFn;

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

  constructor(host: string, token: string, fetchFn: FetchFn) {
    this._host = host;
    this._token = token;
    this._fetch = fetchFn;

    const endpointUrl = new URL("/api/commands", `https://${host}`);
    if (endpointUrl.protocol !== "https:") {
      endpointUrl.protocol = "https:";
    }
    this._commandsEndpoint = endpointUrl.toString();

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
    const response = await this._fetch(this._commandsEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Token ${this._token}`,
        "X-Client": "Unofficial TS",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        `Executing ${commands.length} commands failed! Response: ${errorText}`,
        {
          status: response.status,
          payload: errorText,
        },
      );
    }

    const data = (await response.json()) as FiberyResponse<T>[];

    const errors = data.reduce<FiberyCommandExecutionError[]>((acc, res, i) => {
      if (!res.success) {
        return acc.concat({
          command: commands[i],
          error: res.result,
        });
      }
      return acc;
    }, []);

    if (errors.length) {
      throw new FiberyCommandError(`One or more commands failed!`, { errors });
    }

    return data.map((res) => (res as FiberySuccessResponse<T>).result);
  }

  execute<T = any>(command: CommandArgs): Promise<T> {
    return this.executeBatch<T>([command]).then((results) => results[0]);
  }
}

export default Command;
