import { config } from '../src/config.js';
import * as events from '../src/events.js';
import { EVENTS } from '../src/constants.json';
import { logMessage } from '../src/utils.js';

const MODULE_NAME = 'bidViewabilityIO';
const CONFIG_ENABLED = 'enabled';
const IAB_VIEWABLE_TIME = 1000;
const IAB_VIEWABLE_THRESHOLD = 0.5

let CLIENT_SUPPORTS_IO = false;

if (window.IntersectionObserver && window.IntersectionObserverEntry && window.IntersectionObserverEntry.prototype &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
  CLIENT_SUPPORTS_IO = true;
}
// options for the iO that fires when the ad is viewed.  This one has no root margin, and a threshold of 1,
// because we only want it to fire when the entire ad placement has come into view.  This might actually be too
// aggressive, because ads that are obscured, possibly by the edge of a browser if you're too narrow or something
// will never have this fire.
let viewableOptions = {
  root: null,
  rootMargin: '0px',
  threshold: IAB_VIEWABLE_THRESHOLD
};

// markViewed returns a function what will be executed when a display ad has met the
// IAB definition of viewable
let markViewed = (bid, entry, observer) => {
  return () => {
    observer.unobserve(entry.target);
    events.emit(EVENTS.BID_VIEWABLE, bid);
    entry.target.style.outline = 'green solid 5px';
    logMessage(entry.target.getAttribute('id') + ' was viewed'); // TODO: should use something from bid here rather than the id probably
  }
}

// viewCallbackFactory creates the callback used by the viewable IntersectionObserver.
// when an ad comes into view, it sets a timeout for a function to be executed
// when that ad would be considered viewed per the IAB specs. the bid that was rendered
// is passed into the factory, so it can pass it into markViewed, so that it can be included
// in the BID_VIEWABLE event data. If the ad leaves view before the timer goes off, the setTimeout
// is cancelled, an the bid will not be marked as viewable. There's probably some kind of race-ish
// thing going on between IO and setTimeout but the browser will do what it does.
let viewCallbackFactory = (bid) => {
  return (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        logMessage('start watching view time'); // TODO: watching bid time on what?
        entry.target.style.outline = 'yellow solid 5px';
        entry.target.view_tracker = setTimeout(markViewed(bid, entry, observer), IAB_VIEWABLE_TIME);
      } else {
        logMessage(entry.target.getAttribute('id') + ' is out of view'); // TODO: use bid here too probably
        if (entry.target.view_tracker) {
          clearTimeout(entry.target.view_tracker);
          logMessage(entry.target.getAttribute('id') + ' had its viewability timer stopped'); // TODO: use bid here too probably
        }
      }
    });
  };
};

export let init = () => {
  events.on(EVENTS.AD_RENDER_SUCCEEDED, ({doc, bid, id}) => {
    // read the config for the module
    const globalModuleConfig = config.getConfig(MODULE_NAME) || {};
    // do nothing if module-config.enabled is not set to true
    // this way we are adding a way for bidders to know (using pbjs.getConfig('bidViewability').enabled === true) whether this module is added in build and is enabled
    if (globalModuleConfig[CONFIG_ENABLED] && CLIENT_SUPPORTS_IO) {
      let viewable = new IntersectionObserver(viewCallbackFactory(bid), viewableOptions);
      let element = document.getElementById(bid.adUnitCode);
      viewable.observe(element);
    }
  });
}

init()
