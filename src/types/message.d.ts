export interface Translations {
  auth: {
    invalidSession: string;
    sessionExpired: string;
    invalidToken: string;
    noToken: string;
    unauthorized: string;
    logoutSuccess: string;
    rateLimitExceeded: string;
    tooManyLoginAttempts: string;
    tooManyBets: string;
    tooManyDiceRolls: string;
  };
  common: {
    internalServerError: string;
  };
  user: {
    loginSuccess: string;
    notExist: string;
    profileFetched: string;
    invalidPassword: string;
    loginError: string;
    invalidIdFormat: string;
  };
  wallet: {
    notFound: string;
    insufficientBalance: string;
  };
  bet: {
    placedSuccess: string;
    notFound: string;
    alreadyResolved: string;
    diceAlreadyRolled: string;
    notOwnBet: string;
    wonMessage: string;
    lostMessage: string;
  };
  router: {
    invalidRoute: string;
  };
}
