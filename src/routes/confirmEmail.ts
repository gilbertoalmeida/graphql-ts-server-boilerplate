import { User } from "../entity/User";
import { Request, Response } from "express";
import { redis } from "../redis";

export const confirmEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = await redis.get(id);
  if (userId) {
    await User.update({ id: userId }, { confirmed: true });
    /* removing the key value part from redis, so that
    the link doesn't work anymore */
    await redis.del(id);
    res.send("ok");
  } else {
    res.send("invalid");
  }
};
