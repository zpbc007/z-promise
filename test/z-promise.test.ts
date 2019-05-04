import { ZPromise } from '../src'

describe('test promise api', () => {
    
    it('should resolve', (done) => {
        new ZPromise((resolve, reject) => {
            setTimeout(() => {
                resolve(1)
            }, 500)
        }).then((data) => {
            expect(data).toEqual(1)
            done()
        })
    })
})