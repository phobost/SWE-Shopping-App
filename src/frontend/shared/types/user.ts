import {
  ParsedToken as FirebaseParsedToken,
  IdTokenResult as FirebaseIdTokenResult,
  User as FirebaseUser,
} from "firebase/auth";

/**
 * Interface representing a parsed ID token.
 */
export interface ParsedToken extends FirebaseParsedToken {
  role?: string;
}

/**
 * Interface representing ID token result obtained from {@link User.getIdTokenResult}.
 *
 * @remarks
 * `IdTokenResult` contains the ID token JWT string and other helper properties for getting different data
 * associated with the token as well as all the decoded payload claims.
 *
 * Note that these claims are not to be trusted as they are parsed client side. Only server side
 * verification can guarantee the integrity of the token claims.
 */
export interface IdTokenResult extends FirebaseIdTokenResult {
  claims: ParsedToken;
}

/**
 * A user account in Firebase
 */
export interface User extends FirebaseUser {
  getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;
}
