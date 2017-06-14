import { expect } from 'chai';
import { spy, mock, stub } from 'sinon';

global.spy    = spy;
global.mock   = mock;
global.stub   = stub;
global.expect = expect;