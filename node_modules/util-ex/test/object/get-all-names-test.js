import {expect} from "chai";


import {getAllNames} from '../../src/index.js';


describe('getAllNames', () => {
  it('should return all property names of an object', () => {
    let result = getAllNames({a: 1, b: 2})
    expect(result).to.include.members(['a', 'b', 'constructor', 'hasOwnProperty']);
  });

  it('should return all property names for class prototype', () => {
    class A {
      a(){}
      b(){}
    }
    let result = getAllNames(A.prototype)
    expect(result).to.include.members(['a', 'b', 'constructor', 'hasOwnProperty']);
  });

  it('should return all property names for inherited class prototype', () => {
    class Root {
      root(){}
    }
    class A extends Root {
      a(){}
      b(){}
    }
    let result = getAllNames(A.prototype)
    expect(result).to.include.members(['root', 'a', 'b', 'constructor', 'hasOwnProperty']);
  });

  it('should not include inherited properties', () => {
    class Root {
      root(){}
    }
    class A extends Root {
      a(){}
      b(){}
    }
    let result = getAllNames(A.prototype, false)
    expect(result).to.be.members(['a', 'b', 'constructor']);
    expect(result).to.not.include.members(['root']);
  });

  it('should get all names for primitive values', () => {
    let result = getAllNames(12)
    expect(result).to.include.members(['constructor', 'hasOwnProperty', 'toFixed', 'valueOf']);
  });
});
