// Navigation param lists. The auth gate in App.tsx swaps between these stacks by
// session status; Home is the authenticated landing.
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Otp: { phone: string };
};

export type AppStackParamList = {
  Home: undefined;
};
