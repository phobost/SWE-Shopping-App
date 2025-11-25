// functions/index.js
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import {
  onCall,
  HttpsError,
  CallableRequest,
} from "firebase-functions/v2/https";
import { GetUserRequest, GetUserResponse } from "shared/functions/types";

initializeApp();

export const getUser = onCall<GetUserRequest>(
  async (
    request: CallableRequest<GetUserRequest>,
  ): Promise<GetUserResponse> => {
    const { data, auth } = request;
    if (!auth || auth.token.role !== "admin") {
      throw new HttpsError("permission-denied", "Unauthorized");
    }
    try {
      const userRecord = await getAuth().getUser(data.userId);
      return userRecord;
    } catch {
      throw new HttpsError("not-found", "User not found");
    }
  },
);

export const getAllusers = onCall(async (request: CallableRequest) => {
  const { auth } = request;
  if (!auth || auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Unauthorized");
  }

  return (await getAuth().listUsers()).users;
});

export const setUserRole = onCall<{ userId: string; role: string }>(
  async (request: CallableRequest<{ userId: string; role: string }>) => {
    const { data, auth } = request;
    if (!auth || auth.token.role !== "admin") {
      throw new HttpsError("permission-denied", "Unauthorized");
    }

    try {
      await getAuth().setCustomUserClaims(data.userId, { role: data.role });
      return { success: true };
    } catch (error) {
      throw new HttpsError("internal", `Failed to set user role: ${error}`);
    }
  },
);
