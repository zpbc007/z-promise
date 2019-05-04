/** promise的状态 */
export enum PromiseState {
    PENDING,
    FULFILLED,
    REJECTED
}

export type IResolve = (value?: any) => void;
export type IReject = (error?: any) => void;

export type IHandleFunc = (resolve: IResolve, reject: IReject) => any;