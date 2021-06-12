# Overview

Module Name: bidViewabilityIO

Purpose: Track when a bid becomes viewable using the browsers IntersectionObserver API

Maintainer: adam.prime@alum.utoronto.ca

# Description
- This module, when included, will trigger a BID_VIEWABLE event which can be consumed by Analytics adapters, bidders will need to implement `onBidViewable` method to capture this event
- Bidders can check if this module is part of the final build and whether it is enabled or not by accessing ```pbjs.getConfig('bidViewability')```
- Viewability, as measured by the module is not perfect, not should it be expected to be. It currently applies the IAB/MRC definition of viewable for display ads to all bids regardless of type. It also cannot tell if all the ad assets actually loaded or not. It runs after PBJS has finished inserting the bid into the DOM, which is not exactly the same thing as the bid is fully loaded an rendered.
- The module does not require any specific ad server, or an adserver at all.
- When a rendered PBJS bid is viewable the module will trigger BID_VIEWABLE event, which can be consumed by bidders and analytics adapters
- For the viewable bid if ```bid.vurls type array``` param is and module config ``` firePixels: true ``` is set then the URLs mentioned in bid.vurls will be executed. Please note that GDPR and USP related parameters will be added to the given URLs

# Params
- enabled [required] [type: boolean, default: false], when set to true, the module will emit BID_VIEWABLE when applicable
- firePixels [optional] [type: boolean], when set to true, will fire the urls mentioned in bid.vurls which should be array of urls

# Example of consuming BID_VIEWABLE event
```
	pbjs.onEvent('bidViewable', function(bid){
		console.log('got bid details in bidViewable event', bid);
	});

```

# Example of using config
```
	pbjs.setConfig({
        bidViewability: {
            enabled: true,
            firePixels: true,
        }
    });
```

# Please Note:
- This currently assumes all ads are small display ads

