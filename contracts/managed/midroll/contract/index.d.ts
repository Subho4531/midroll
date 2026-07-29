import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  dispatch_payment(context: __compactRuntime.CircuitContext<PS>,
                   recipient_0: Uint8Array,
                   amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  dispatch_multi_payment(context: __compactRuntime.CircuitContext<PS>,
                         recipients_0: Uint8Array[],
                         amounts_0: bigint[],
                         count_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  claim_shielded_expense(context: __compactRuntime.CircuitContext<PS>,
                         amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cast_shielded_vote(context: __compactRuntime.CircuitContext<PS>,
                     proposal_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  dispatch_payment(context: __compactRuntime.CircuitContext<PS>,
                   recipient_0: Uint8Array,
                   amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  dispatch_multi_payment(context: __compactRuntime.CircuitContext<PS>,
                         recipients_0: Uint8Array[],
                         amounts_0: bigint[],
                         count_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  claim_shielded_expense(context: __compactRuntime.CircuitContext<PS>,
                         amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cast_shielded_vote(context: __compactRuntime.CircuitContext<PS>,
                     proposal_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  dispatch_payment(context: __compactRuntime.CircuitContext<PS>,
                   recipient_0: Uint8Array,
                   amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  dispatch_multi_payment(context: __compactRuntime.CircuitContext<PS>,
                         recipients_0: Uint8Array[],
                         amounts_0: bigint[],
                         count_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  claim_shielded_expense(context: __compactRuntime.CircuitContext<PS>,
                         amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cast_shielded_vote(context: __compactRuntime.CircuitContext<PS>,
                     proposal_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly dummy: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
