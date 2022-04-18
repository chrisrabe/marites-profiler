import type { NextApiRequest, NextApiResponse } from "next";
import { analyseUser, getUserInfo } from "service/gateway-service";

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = req.query;
  if (!query.username) {
    return res.status(400).end("Username not specified.");
  }
  const username = query.username as string;
  const userInfo = await getUserInfo(username);
  if (!userInfo || userInfo.following.length === 0) {
    // We need to send a request to analyse another user in the background
    // if it doesn't exist, or we don't have a following
    await analyseUser(username);
  }

  if (!userInfo) {
    return res.status(200).json({});
  }

  return res.status(200).json({ data: userInfo });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "GET":
      return handleGet(req, res);
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
