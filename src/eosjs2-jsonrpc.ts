// copyright defined in eosjs2/LICENSE.txt

import { AuthorityProvider, AuthorityProviderArgs } from "./eosjs2-api";
import { RpcError } from "./eosjs2-rpcerror";

/** Structured format for abis */
export interface Abi {
  version: string;
  types: Array<{ new_type_name: string, type: string }>;
  structs: Array<{ name: string, base: string, fields: Array<{ name: string, type: string }> }>;
  actions: Array<{ name: string, type: string, ricardian_contract: string }>;
  tables: Array<{ name: string, type: string, index_type: string, key_names: string[], key_types: string[] }>;
}

/** Return value of `/v1/chain/get_abi` */
export interface GetAbiResult {
  account_name: string;
  abi: Abi;
}

/** Subset of `GetBlockResult` needed to calculate TAPoS fields in transactions */
export interface BlockTaposInfo {
  timestamp: string;
  block_num: number;
  ref_block_prefix: number;
}

/** Return value of `/v1/chain/get_block` */
export interface GetBlockResult {
  timestamp: string;
  producer: string;
  confirmed: number;
  previous: string;
  transaction_mroot: string;
  action_mroot: string;
  schedule_version: number;
  producer_signature: string;
  id: string;
  block_num: number;
  ref_block_prefix: number;
}

/** Return value of `/v1/chain/get_code` */
export interface GetCodeResult {
  account_name: string;
  code_hash: string;
  wast: string;
  wasm: string;
  abi: Abi;
}

/** Return value of `/v1/chain/get_info` */
export interface GetInfoResult {
  server_version: string;
  chain_id: string;
  head_block_num: number;
  last_irreversible_block_num: number;
  last_irreversible_block_id: string;
  head_block_id: string;
  head_block_time: string;
  head_block_producer: string;
  virtual_block_cpu_limit: number;
  virtual_block_net_limit: number;
  block_cpu_limit: number;
  block_net_limit: number;
}

/** Return value of `/v1/chain/get_raw_code_and_abi` */
export interface GetRawCodeAndAbiResult {
  account_name: string;
  wasm: string;
  abi: string;
}

/** Arguments for `push_transaction` */
export interface PushTransactionArgs {
  signatures: string[];
  serializedTransaction: Uint8Array;
}

function arrayToHex(data: Uint8Array) {
  let result = "";
  for (const x of data) {
    result += ("00" + x.toString(16)).slice(-2);
  }
  return result;
}

/** Make RPC calls */
export class JsonRpc implements AuthorityProvider {
  public endpoint: string;
  public fetchBuiltin: (input?: Request | string, init?: RequestInit) => Promise<Response>;

  /**
   * @param args
   *    * `fetch`:
   *      * browsers: leave `null` or `undefined`
   *      * node: provide an implementation
   */
  constructor(endpoint: string, args:
    { fetch?: (input?: string | Request, init?: RequestInit) => Promise<Response> } = {},
  ) {
    this.endpoint = endpoint;
    if (args.fetch) {
      this.fetchBuiltin = args.fetch;
    } else {
      this.fetchBuiltin = (global as any).fetch;
    }
  }

  /** Post `body` to `endpoint + path`. Throws detailed error information in `RpcError` when available. */
  public async fetch(path: string, body: any) {
    let response;
    let json;
    try {
      const f = this.fetchBuiltin;
      response = await f(this.endpoint + path, {
        body: JSON.stringify(body),
        method: "POST",
      });
      json = await response.json();
      if (json.processed && json.processed.except) {
        throw new RpcError(json);
      }
    } catch (e) {
      e.isFetchError = true;
      throw e;
    }
    if (!response.ok) {
      throw new RpcError(json);
    }
    return json;
  }

  /** Raw call to `/v1/chain/get_abi` */
  public async get_abi(accountName: string): Promise<GetAbiResult> {
    return await this.fetch("/v1/chain/get_abi", { accountName });
  }

  /** Raw call to `/v1/chain/get_account` */
  public async get_account(accountName: string): Promise<any> {
    return await this.fetch("/v1/chain/get_account", { accountName });
  }

  /** Raw call to `/v1/chain/get_block_header_state` */
  public async get_block_header_state(blockNumOrId: number | string): Promise<any> {
    return await this.fetch("/v1/chain/get_block_header_state", { blockNumOrId });
  }

  /** Raw call to `/v1/chain/get_block` */
  public async get_block(blockNumOrId: number | string): Promise<GetBlockResult> {
    return await this.fetch("/v1/chain/get_block", { blockNumOrId });
  }

  /** Raw call to `/v1/chain/get_code` */
  public async get_code(accountName: string): Promise<GetCodeResult> {
    return await this.fetch("/v1/chain/get_code", { accountName });
  }

  /** Raw call to `/v1/chain/get_currency_balance` */
  public async get_currency_balance(code: string, account: string, symbol: string = null): Promise<any> {
    return await this.fetch("/v1/chain/get_currency_balance", { code, account, symbol });
  }

  /** Raw call to `/v1/chain/get_currency_stats` */
  public async get_currency_stats(code: string, symbol: string): Promise<any> {
    return await this.fetch("/v1/chain/get_currency_stats", { code, symbol });
  }

  /** Raw call to `/v1/chain/get_info` */
  public async get_info(): Promise<GetInfoResult> {
    return await this.fetch("/v1/chain/get_info", {});
  }

  /** Raw call to `/v1/chain/get_producer_schedule` */
  public async get_producer_schedule(): Promise<any> {
    return await this.fetch("/v1/chain/get_producer_schedule", {});
  }

  /** Raw call to `/v1/chain/get_producers` */
  public async get_producers(json = true, lowerBound = "", limit = 50): Promise<any> {
    return await this.fetch("/v1/chain/get_producers", { json, lowerBound, limit });
  }

  /** Raw call to `/v1/chain/get_raw_code_and_abi` */
  public async get_raw_code_and_abi(accountName: string): Promise<GetRawCodeAndAbiResult> {
    return await this.fetch("/v1/chain/get_raw_code_and_abi", { accountName });
  }

  /** Raw call to `/v1/chain/get_table_rows` */
  public async get_table_rows({
    json = true,
    code,
    scope,
    table,
    table_key = "",
    lower_bound = "",
    upper_bound = "",
    limit = 10 }: any): Promise<any> {

    return await this.fetch(
      "/v1/chain/get_table_rows", {
        json,
        code,
        scope,
        table,
        table_key,
        lower_bound,
        upper_bound,
        limit,
      });
  }

  /** Get subset of `availableKeys` needed to meet authorities in `transaction`. Implements `AuthorityProvider` */
  public async getRequiredKeys(args: AuthorityProviderArgs): Promise<string[]> {
    return (await this.fetch("/v1/chain/get_required_keys", {
      transaction: args.transaction,
      available_keys: args.availableKeys,
    })).required_keys;
  }

  /** Push a serialized transaction */
  public async push_transaction({ signatures, serializedTransaction }: PushTransactionArgs): Promise<any> {
    return await this.fetch("/v1/chain/push_transaction", {
      signatures,
      compression: 0,
      packed_context_free_data: "",
      packed_trx: arrayToHex(serializedTransaction),
    });
  }

  /** Raw call to `/v1/db_size/get` */
  public async db_size_get() { return await this.fetch("/v1/db_size/get", {}); }

  /** Raw call to `/v1/history/get_actions` */
  public async history_get_actions(accountName: string, pos: number = null, offset: number = null) {
    return await this.fetch("/v1/history/get_actions", { accountName, pos, offset });
  }

  /** Raw call to `/v1/history/get_transaction` */
  public async history_get_transaction(id: string, blockNumHint: number = null) {
    return await this.fetch("/v1/history/get_transaction", { id, blockNumHint });
  }

  /** Raw call to `/v1/history/get_key_accounts` */
  public async history_get_key_accounts(publicKey: string) {
    return await this.fetch("/v1/history/get_key_accounts", { publicKey });
  }

  /** Raw call to `/v1/history/get_controlled_accounts` */
  public async history_get_controlled_accounts(controllingAccount: string) {
    return await this.fetch("/v1/history/get_controlled_accounts", { controllingAccount });
  }
} // JsonRpc
