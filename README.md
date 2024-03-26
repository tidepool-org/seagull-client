seagull-client
==============

Client library for interacting with seagull, Tidepool's user metadata service

# Docs

## Setup
```require('seagull-client')(config, hostGetter, request);```

  * ```hostGetter``` -- an object from hakken
  * ```config``` -- an object containing configuration parameters
  * ```request``` -- see amoeba httpClient
  
  Generates an object with the members listed below.

## Members


### getProfile
* ```getProfile (userId, token, cb)```
*Retrieves the user profile from metadata*
    * ```userId``` -- the Tidepool-assigned userId
    * ```token``` -- a server token or the user token
    * ```cb (err, response)```
        * ```err``` -- null if no error, else an object
        * ```response``` -- result from the /metadata/:userid/profile api call

### getGroups
* ```getGroups (userId, token, cb)```
*Retrieves the user group information from metadata*
    * ```userId``` -- the Tidepool-assigned userId
    * ```token``` -- a server token or the user token
    * ```cb (err, response)```
        * ```err``` -- null if no error, else an object
        * ```response``` -- result from the /metadata/:userid/groups api call

### getPrivatePair
* ```getPrivatePair (userId, hashName, token, cb)```
*Gets a private pair from metadata*
    * ```userId``` -- the Tidepool-assigned userId
    * ```hashName``` -- the name of the particular pair value to retrieve
    * ```token``` -- a server token (user token not valid)
    * ```cb (err, response)```
        * ```err``` -- null if no error, else an object
        * ```response``` -- result from the /metadata/:userid/private api call

### getCollection
* ```getCollection (userId, collectionName, token, cb)```
*Retrieves arbitrary collection information from metadata*
    * ```userId``` -- the Tidepool-assigned userId
    * ```collectionName``` -- the collection being retrieved
    * ```token``` -- a server token or the user token
    * ```cb (err, response)```
        * ```err``` -- null if no error, else an object
        * ```response``` -- result from the /metadata/:userid/groups api call
