import fetch from "node-fetch";

export default async (login: string, password: string) => {
  const signInResponse = await fetch("https://contest.misis.ru/api/user/authenticate/sign-in", {
    "headers": {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:71.0) Gecko/20100101 Firefox/71.0",
      "Content-Type": "application/json"
    },
    "body": JSON.stringify({
      login,
      password
    }),
    "method": "POST"
  });

  if (signInResponse.status === 401) {
    throw new Error("Invalid credentials");
  }

  const {token} = await signInResponse.json();

  return token;
};