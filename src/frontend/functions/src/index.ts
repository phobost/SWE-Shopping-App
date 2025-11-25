// functions/index.js
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { onCall } from "firebase-functions/v2/https";
import { GetUserRequest, GetUserResponse } from "shared/functions/types";

initializeApp();

export const getUser = onCall<GetUserRequest>(
  async ({ data, auth }): Promise<GetUserResponse> => {
    if (!auth || auth.token.claims.role === "admin") {
      throw new Error("Unauthorized");
    }
    try {
      const userRecord = await getAuth().getUser(data.userId);
      return userRecord;
    } catch {
      throw new Error("User not found");
    }
  },
);

export const getAllusers = onCall<GetUserRequest>(async ({ auth }) => {
  if (!auth || auth.token.claims.role === "admin") {
    throw new Error("Unauthorized");
  }

  return (await getAuth().listUsers()).users;
});
