import type { NextApiRequest, NextApiResponse } from "next";
import { getNewsArticles } from "service/gateway-service";

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = req.query;
  const countryCode = (query.countryCode as string) ?? "AU";
  const keywords = query.keywords as string;
  const articles = await getNewsArticles(countryCode, keywords);
  return res.status(200).json(articles);
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
