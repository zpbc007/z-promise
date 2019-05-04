import { ZPromise } from '../src'

describe('test promise api', () => {
    
    it('should resolve', (done) => {
        new ZPromise<number>((resolve) => {
            setTimeout(() => {
                resolve(1)
            }, 500)
        }).then((data) => {
            expect(data).toEqual(1)
            done()
        })
    })

    it('should reject', (done) => {
        new ZPromise<number>((_, reject) => {
            setTimeout(() => {
                reject(1)
            }, 500)
        }).catch((err) => {
            expect(err).toBe(1)
            done()
        })
    })

    it('should multi resolve', (done) => {
        const result = []
        new ZPromise<number>((resolve) => {
            setTimeout(() => {
                resolve(1)
            }, 500)
        }).then((res) => {
            result.push(res)
            return 2
        }).then((res) => {
            result.push(res)

            expect(result).toEqual([1,2])
            done()
        })
    })

    it('should multi reject', (done) => {
        const reuslt = []
        new ZPromise<number>((_, reject) => {
            setTimeout(() => {
                reject(1)
            }, 500)
        }).catch((res) => {
            reuslt.push(res)

            throw(2)
        }).catch((res) => {
            reuslt.push(res)

            expect(reuslt).toEqual([1, 2])
            done()
        })
    })
    
    it('should wait promise result', (done) => {
        const result = []
        new ZPromise<number>((resolve) => {
            setTimeout(() => {
                resolve(1)
            }, 100)
        }).then((res) => {
            result.push(res)

            return new ZPromise((resolve) => {
                setTimeout(() => {
                    resolve(2)
                }, 50)
            })
        }).then((res) => {
            result.push(res)

            expect(result).toEqual([1, 2])
            done()
        })
    })

    it('should resolve', (done) => {
          ZPromise.resolve(1).then((res) => {
              expect(res).toBe(1)
              done()
          })
    })

    it('should reject', (done) => {
        ZPromise.reject(1).catch((res) => {
            expect(res).toBe(1)
            done()
        })
    })

    it('should wait all', (done) => {
        const pro1 = ZPromise.resolve(1);
        const pro2 = new ZPromise<number>((resolve) => {
            setTimeout(() => {
                resolve(2)
            }, 100);
        })
        const pro3 = new ZPromise<number>((resolve) => {
            setTimeout(() => {
                resolve(3)
            }, 200);
        })

        ZPromise.all([pro1, pro2, pro3]).then((res) => {
            expect(res).toEqual([1, 2, 3])
            done()
        })
    })

    it('should race', (done) => {
        const pro1 = new ZPromise<number>((resolve) => {
            setTimeout(() => {
                resolve(1)
            }, 100);
        })
        const pro2 = new ZPromise<number>((resolve) => {
            setTimeout(() => {
                resolve(2)
            }, 200);
        })
        const pro3 = new ZPromise<number>((resolve) => {
            setTimeout(() => {
                resolve(3)
            }, 300);
        })

        ZPromise.race([pro1, pro2, pro3]).then((res)=> {
            expect(res).toBe(1)

            done()
        })
    })
})