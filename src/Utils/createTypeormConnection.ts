import { createConnection, getConnectionOptions } from "typeorm";

export const createTypeormConnection = async () => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);

  /* connects to the database using the ormconfig file and the node environment 
  that is set based on the script run (start or test), this is the name of
  the object inside the ormconfig file that is used, AND sinchronizes it
  so that it catches changes in the entities, for example (set as true in ormconfig)*/
  return createConnection({ ...connectionOptions, name: "default" });

  /* the spread operator adding name: default is bc jest uses this default name, so
  we are getting the right connection options first by their name: development or test,
  but then we pass a modified version of the json where the name is default.
  just so that jest works*/
};
