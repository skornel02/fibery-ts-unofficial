import Command from "./command.js";
// @ts-ignore
import Type from "./type.js";
// @ts-ignore
import Field from "./field.js";
// @ts-ignore
import Entity from "./entity.js";
// @ts-ignore
import File from "./file.js";
// @ts-ignore
import Document from "./document.js";

export interface FiberyOptions {
  host: string;
  token: string;
  fetch?: typeof fetch;
}

export interface FiberyTypeService {
  DOMAIN_TYPE_FIELDS: any[];
  createBatch(argsArray: any[]): Promise<any>;
  renameBatch(argsArray: any[]): Promise<any>;
  deleteBatch(argsArray: any[]): Promise<any>;
}

export interface FiberyFieldService {
  PRIMITIVE_FIELD_TYPES: any[];
  SYNTHETIC_FIELD_TYPES: any[];
  createBatch(argsArray: any[]): Promise<any>;
  renameBatch(argsArray: any[]): Promise<any>;
  deleteBatch(argsArray: any[]): Promise<any>;
}

export interface FiberyEntityService {
  query(query: any, params?: any): Promise<any>;
  createBatch(argsArray: any[]): Promise<any[]>;
  updateBatch(argsArray: any[]): Promise<any[]>;
  addToEntityCollectionFieldBatch(argsArray: any[]): Promise<any[]>;
  removeFromEntityCollectionFieldBatch(argsArray: any[]): Promise<any[]>;
  deleteBatch(argsArray: any[]): Promise<any[]>;
}

export interface FiberyFileService {
  upload(path: string): Promise<any>;
  download(secret: string, destination: string): Promise<void>;
}

export type DocumentFormat = "md" | "html" | "json";

export interface FiberyDocumentService {
  get(secret: string, format?: DocumentFormat): Promise<any>;
  getBatch(secrets: string[], format?: DocumentFormat): Promise<any>;
  update(
    secret: string,
    content: string,
    format?: DocumentFormat,
  ): Promise<any>;
}

export class Fibery {
  public command: Command;
  public type: FiberyTypeService;
  public field: FiberyFieldService;
  public entity: FiberyEntityService;
  public file: FiberyFileService;
  public document: FiberyDocumentService;

  constructor(options: FiberyOptions) {
    if (!options.host) {
      throw new Error("Please provide a host (*.fibery.io)");
    }

    if (!options.token) {
      throw new Error("Please provide an API token");
    }

    const fetchFn = options.fetch || fetch;

    this.command = new Command(options.host, options.token, fetchFn);

    this.type = {
      DOMAIN_TYPE_FIELDS: Type?.meta?.DOMAIN_TYPE_FIELDS,
      createBatch: async (argsArray: any[]) =>
        this.command.execute(Type.commands.createTypeBatchCmd(argsArray)),
      renameBatch: async (argsArray: any[]) =>
        this.command.execute(Type.commands.renameTypeBatchCmd(argsArray)),
      deleteBatch: async (argsArray: any[]) =>
        this.command.execute(Type.commands.deleteTypeBatchCmd(argsArray)),
    };

    this.field = {
      PRIMITIVE_FIELD_TYPES: Field?.meta?.PRIMITIVE_FIELD_TYPES,
      SYNTHETIC_FIELD_TYPES: Field?.meta?.SYNTHETIC_FIELD_TYPES,
      createBatch: async (argsArray: any[]) =>
        this.command.execute(Field.commands.createFieldBatchCmd(argsArray)),
      renameBatch: async (argsArray: any[]) =>
        this.command.execute(Field.commands.renameFieldBatchCmd(argsArray)),
      deleteBatch: async (argsArray: any[]) =>
        this.command.execute(Field.commands.deleteFieldBatchCmd(argsArray)),
    };

    this.entity = {
      query: async (query: any, params: any = {}) =>
        this.command.execute(Entity.commands.queryEntityCmd(query, params)),
      createBatch: async (argsArray: any[]) =>
        this.command.executeBatch(
          Entity.commands.createEntityBatchCmds(argsArray),
        ),
      updateBatch: async (argsArray: any[]) =>
        this.command.executeBatch(
          Entity.commands.updateEntityBatchCmds(argsArray),
        ),
      addToEntityCollectionFieldBatch: async (argsArray: any[]) =>
        this.command.executeBatch(
          Entity.commands.addToEntityCollectionFieldBatchCmds(argsArray),
        ),
      removeFromEntityCollectionFieldBatch: async (argsArray: any[]) =>
        this.command.executeBatch(
          Entity.commands.removeFromEntityCollectionFieldBatchCmds(argsArray),
        ),
      deleteBatch: async (argsArray: any[]) =>
        this.command.executeBatch(
          Entity.commands.deleteEntityBatchCmds(argsArray),
        ),
    };

    this.file = new File(options.host, options.token, fetchFn);
    this.document = new Document(options.host, options.token, fetchFn);
  }

  getSchema() {
    return this.command
      .execute({ command: "fibery.schema/query", args: {} })
      .then((result: any) => result["fibery/types"]);
  }
}

export default Fibery;
