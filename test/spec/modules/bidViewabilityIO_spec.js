import * as bidViewabilityIO from 'modules/bidViewabilityIO.js';
import { config } from 'src/config.js';
import * as events from 'src/events.js';
import * as utils from 'src/utils.js';
import * as sinon from 'sinon';
import {expect, spy} from 'chai';
import * as prebidGlobal from 'src/prebidGlobal.js';
import { EVENTS } from 'src/constants.json';
import adapterManager, { gdprDataHandler, uspDataHandler } from 'src/adapterManager.js';
import parse from 'url-parse';

describe('#bidViewabilityIO', function() {
  it('a thing to be a function', function() {
    console.log(bidViewabilityIO); // eslint-disable-line no-console
    console.log(bidViewabilityIO.init); // eslint-disable-line no-console
    expect(bidViewabilityIO.init).to.be.a('function')
  });
});
