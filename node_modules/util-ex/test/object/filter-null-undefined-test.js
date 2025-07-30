import {expect} from "chai";


import {filterNullUndefined} from '../../src/index.js';


describe('filterNullUndefined', () => {
  it('should filter null and undefined values for object', () => {
    let result = filterNullUndefined({a: 1, b: 2, c: null, d: undefined,e: false, e: 0, f: ''})
    expect(result).to.deep.equal({a: 1, b: 2, e: false, e: 0, f: ''});
  });

  it('should filter null and undefined values for array', () => {
    let result = filterNullUndefined([1,2,"ss","",0,false, null, undefined])
    expect(result).to.deep.equal([1,2,"ss","",0,false]);
  });

});
