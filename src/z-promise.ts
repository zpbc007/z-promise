import { PromiseState, IHandleFunc } from "type";
import { isFunction } from "@utils/is-type";

export class ZPromise {
    /** 初始状态为pending */
    private state = PromiseState.PENDING
    /** 存放的值或者错误信息 */
    private val = null
    /** then 方法注册的函数 */
    private readonly fulfilledQueue = []
    /** catch 方法注册的函数 */
    private readonly rejectedQueue = []

    /** 构造函数传入handle */
    constructor(handleFunc: IHandleFunc) {
        if (!isFunction(handleFunc)) {
            throw new Error("ZPromise need function as handler");
        }

        try {
            handleFunc(this.resolve, this.reject)
        } catch (err) {
            this.reject(err)
        }
    }

    static resolve = (value) => {
        if (value instanceof ZPromise) {
            return value
        }

        return new ZPromise((resolve) => {
            resolve(value)
        })
    }

    static reject = (error) => {
        return new ZPromise((_, reject) => {
            reject(error)
        })
    }

    static all = (proList: ZPromise[]) => {
        return new ZPromise((resolve, reject) => {
            const values = []
            let count = 0;

            for (const [index, pro] of proList.entries()) {
                pro.then((res) => {
                    values[index] = res
                    count++

                    // 所有的都 resolve 后才会 resolve
                    if (count === proList.length) {
                        resolve(values)
                    }
                }, (error) => {
                    // 如果有一个为 error 则直接reject 
                    reject(error)
                })
            }
        })
    }

    static race = (proList: ZPromise[]) => {
        return new ZPromise((resolve, reject) => {
            for (const pro of proList) {
                pro.then((res) => {
                    resolve(res)
                }, (error) => {
                    reject(error)
                })
            }
        })
    }

    private readonly isPending = () => this.state === PromiseState.PENDING;

    private readonly runFulfilled = (value) => {
        // 转换状态
        this.state = PromiseState.FULFILLED
        this.val = value
        // 清空队列
        while (this.fulfilledQueue.length > 0) {
            this.fulfilledQueue.shift()(value)
        }
    }

    private readonly runRejected = (error) => {
        this.state = PromiseState.REJECTED
        this.val = error
        while (this.rejectedQueue.length > 0) {
            this.rejectedQueue.shift()(error)
        }
    }

    private readonly resolve = (value) => {
        /** resolve 只能从 pending 转换为 fulfilled */
        if (!this.isPending()) {
            return
        }

        const run = () => {
            if (value instanceof ZPromise) {
                value.then(this.runFulfilled, this.runRejected)
            } else {
                this.runFulfilled(value)
            }
        }
        
        // 异步调用
        setTimeout(run, 0);
    }

    private readonly reject = (error) => {
        /** reject 只能从 pending 转换为 rejected */
        if (!this.isPending()) {
            return 
        }

        // 异步调用
        setTimeout(() => {
            this.runRejected(error)
        }, 0);
    }

    then(onFulfilled?, onRejected?) {
        return new ZPromise((resolve, reject) => {
            const fulfilled = (value) => {
                try {
                    // 未传入 onFulfilled 直接进入fulfilled状态
                    if (!isFunction(onFulfilled)) {
                        resolve(value)
                    } else {
                        // 得到上个promise的返回值
                        const res = onFulfilled(value)

                        // 返回的为一个新的 promise, 等待它变为fulfilled 状态
                        if (res instanceof ZPromise) {
                            res.then(resolve, reject)
                        } else {
                            // 返回的为一个普通值
                            resolve(res)
                        }
                    }
                } catch (e) {
                    // 期间发生错误
                    reject(e)
                }
            }

            const rejected = (error) => {
                try {
                    // 上一个 promise 未传入 onRejected 进入当前的 rejected 状态
                    if (!isFunction(onRejected)) {
                        reject(error)
                    } else {
                        // 上一个 catch 的返回值
                        const res = onRejected(error)

                        // 返回的为一个新的 promise 等待它变为 fulfilled 状态
                        if (res instanceof ZPromise) {
                            res.then(resolve, reject)
                        } else {
                            // 返回的为普通值
                            resolve(res)
                        }
                    }
                } catch(e) {
                    // 期间发生错误
                    reject(e)
                }
            }

            switch (this.state) {
                // pending 状态加入队列
                case PromiseState.PENDING:
                    this.fulfilledQueue.push(onFulfilled)
                    this.rejectedQueue.push(onRejected)
                    break
                case PromiseState.FULFILLED:
                    fulfilled(this.val)
                    break
                case PromiseState.REJECTED:
                    rejected(this.val)
                    break
            }
        })
    }

    catch(onRejected) {
        return this.then(null, onRejected)
    }

    finally(cb) {
        return this.then(
            (value) => ZPromise.resolve(cb()).then(() => value),
            (error) => ZPromise.reject(cb()).then(() => { throw error })
        )
    }
}