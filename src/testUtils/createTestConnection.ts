import { createConnection, getConnectionOptions } from "typeorm";

export const createTestConnection = async (resetDB: boolean = false) => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  /* This connection is almost a copy of the createTypeormConnection from utils
  you can read the notes from there. This one just adds the resetDB flag
  to control the db in testing*/
  return createConnection({
    ...connectionOptions,
    name: "default",
    synchronize: resetDB,
    dropSchema: resetDB
  });

  /* the boolean flag decides if we synchronize and drop the schema*/
};
