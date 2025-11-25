import { UserRecord } from "firebase-admin/auth";

export interface GetUserRequest {
  userId: string;
}

export type GetUserResponse = UserRecord;

export type GetAllUsersRequest = undefined;

export type GetAllUsersResponse = UserRecord[];
