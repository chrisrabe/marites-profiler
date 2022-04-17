import http from "./http";

export const analyseUser = async (username: string) => {
  try {
    const payload = {
      username,
    };
    const { data } = await http.post("/analyse", payload, {
      headers: {
        "Content-Type": "application/json",
        InvocationType: "Event",
      },
    });
    return data;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
