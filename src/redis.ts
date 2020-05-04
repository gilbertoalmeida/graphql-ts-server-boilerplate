import * as Redis from "ioredis";

/* This is used now for the confirmation email function, it's passed as a context together with the url when we start the server
  the context can be assessed from the resolver, which is where we want to use this stuff
  The url is localhost or the website name. Basically for example http://localhost:4000 or http://my-site.com */
export const redis = new Redis();
